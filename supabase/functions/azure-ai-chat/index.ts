
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
}

serve(async (req) => {
    // 1. Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 2. Auth Check
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error('Missing Authorization header');

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use Service Role for DB writes/RPC
            { auth: { persistSession: false } }
        )

        const token = authHeader.replace('Bearer ', '');

        // Custom Manual Verification
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

        if (userError || !user) {
            console.error('Auth error:', userError);
            return new Response(
                JSON.stringify({ error: 'Invalid token', details: userError }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
            )
        }

        // 3. Azure Configuration (Set via Supabase Dashboard > Edge Functions > Secrets)
        const AZURE_ENDPOINT = Deno.env.get('AZURE_OPENAI_ENDPOINT');
        const AZURE_KEY = Deno.env.get('AZURE_OPENAI_KEY');

        if (!AZURE_ENDPOINT || !AZURE_KEY) {
            console.error('Missing Azure Secrets');
            return new Response(
                JSON.stringify({
                    error: 'Azure OpenAI configuration missing. Please set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY secrets.'
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 503 } // 503 Service Unavailable
            )
        }

        // 4. Parse Request
        let body;
        try {
            body = await req.json();
        } catch (e) {
            throw new Error('Invalid JSON body');
        }

        const { messages, model, temperature, maxTokens } = body;

        if (!messages || !Array.isArray(messages)) {
            throw new Error('Messages array is required');
        }

        // 5. Check Spending Limit
        const { data: limitData, error: limitError } = await supabaseClient
            .rpc('check_ai_spending_limit', {
                p_user_id: user.id,
                p_limit_usd: 5.0
            });

        if (limitError) {
            console.error('Spending check error:', limitError);
            // Return specific error for debugging
            return new Response(
                JSON.stringify({ error: `Spending check failed: ${limitError.message}` }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
        }

        const spending = limitData?.[0] || { is_under_limit: true, current_spending: 0 };
        if (!spending.is_under_limit) {
            return new Response(
                JSON.stringify({
                    message: 'Monthly AI spending limit reached ($5.00).',
                    spending
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
            )
        }

        // 6. Call Azure OpenAI
        const AZURE_DEPLOYMENT = model === 'gpt-4.1' ? 'gpt-4' : 'gpt-35-turbo';

        const azureUrl = `${AZURE_ENDPOINT}/openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=2024-02-15-preview`;

        const azureResponse = await fetch(azureUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': AZURE_KEY
            },
            body: JSON.stringify({
                messages,
                temperature: temperature ?? 0.7,
                max_tokens: maxTokens ?? 1000,
                stream: false
            })
        });

        if (!azureResponse.ok) {
            const errText = await azureResponse.text();
            console.error('Azure API Error:', errText);
            return new Response(
                JSON.stringify({ error: `Azure API error: ${azureResponse.status}`, details: errText }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 } // 502 Bad Gateway
            )
        }

        const azureData = await azureResponse.json();
        const content = azureData.choices[0]?.message?.content || '';
        const usage = azureData.usage || { prompt_tokens: 0, completion_tokens: 0 };

        const isGpt4 = model === 'gpt-4.1';
        const costInput = isGpt4 ? 30 : 0.5;
        const costOutput = isGpt4 ? 60 : 1.5;
        const costUsd = ((usage.prompt_tokens * costInput) + (usage.completion_tokens * costOutput)) / 1000000;

        // 7. Log Usage
        const { error: logError } = await supabaseClient.from('ai_usage').insert({
            user_id: user.id,
            model_name: model || 'gpt-3.5-turbo',
            input_tokens: usage.prompt_tokens,
            output_tokens: usage.completion_tokens,
            cost_usd: costUsd,
            ip_address: req.headers.get('x-forwarded-for') || 'unknown'
        });

        if (logError) {
            console.error('Usage logging error:', logError);
            // Non-blocking error, but good to know
        }

        // 8. Return Response
        return new Response(
            JSON.stringify({
                content,
                model: model,
                usage: {
                    inputTokens: usage.prompt_tokens,
                    outputTokens: usage.completion_tokens,
                    cost: costUsd
                },
                spending: {
                    current: spending.current + costUsd,
                    limit: 5.0,
                    remaining: 5.0 - (spending.current + costUsd)
                },
                finishReason: azureData.choices[0]?.finish_reason
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        console.error('Edge Function Error:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Unknown internal error' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
