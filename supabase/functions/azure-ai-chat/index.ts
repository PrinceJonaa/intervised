
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
}

// Map UI model names to Azure AI Foundry deployment names
const MODEL_MAP: Record<string, string> = {
    'deepseek-v3.2': 'DeepSeek-V3.2',
    'gpt-4.1': 'gpt-4.1',
    'grok-4-fast': 'grok-4-fast-reasoning',
    'kimi-k2': 'Kimi-K2-Thinking',
    // Fallback
    'default': 'DeepSeek-V3.2'
};

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
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            { auth: { persistSession: false } }
        )

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: 'Invalid token', details: userError }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
            )
        }

        // 3. Azure AI Foundry Configuration
        const AZURE_ENDPOINT = Deno.env.get('AZURE_OPENAI_ENDPOINT');
        const AZURE_KEY = Deno.env.get('AZURE_OPENAI_KEY');

        if (!AZURE_ENDPOINT || !AZURE_KEY) {
            return new Response(
                JSON.stringify({ error: 'Azure AI configuration missing' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 503 }
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
            return new Response(
                JSON.stringify({ error: `Spending check failed: ${limitError.message}` }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
        }

        const spending = limitData?.[0] || { is_under_limit: true, current_spending: 0 };
        if (!spending.is_under_limit) {
            return new Response(
                JSON.stringify({ message: 'Monthly AI spending limit reached ($5.00).', spending }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
            )
        }

        // 6. Map model to Azure deployment name
        const modelKey = (model || 'default').toLowerCase();
        const deploymentName = MODEL_MAP[modelKey] || MODEL_MAP['default'];

        // 7. Call Azure AI Foundry (new format)
        // Format: https://{resource}.services.ai.azure.com/models/chat/completions
        const azureUrl = `${AZURE_ENDPOINT}/models/chat/completions?api-version=2024-05-01-preview`;

        const azureResponse = await fetch(azureUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': AZURE_KEY
            },
            body: JSON.stringify({
                model: deploymentName,
                messages,
                temperature: temperature ?? 0.7,
                max_tokens: maxTokens ?? 1000
            })
        });

        if (!azureResponse.ok) {
            const errText = await azureResponse.text();
            console.error('Azure API Error:', azureResponse.status, errText);
            return new Response(
                JSON.stringify({ error: `Azure API error: ${azureResponse.status}`, details: errText }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 }
            )
        }

        const azureData = await azureResponse.json();
        const content = azureData.choices?.[0]?.message?.content || '';
        const usage = azureData.usage || { prompt_tokens: 0, completion_tokens: 0 };

        // Cost estimation (rough)
        const costUsd = ((usage.prompt_tokens + usage.completion_tokens) * 0.001) / 1000;

        // 8. Log Usage
        await supabaseClient.from('ai_usage').insert({
            user_id: user.id,
            model_name: deploymentName,
            input_tokens: usage.prompt_tokens,
            output_tokens: usage.completion_tokens,
            cost_usd: costUsd,
            ip_address: req.headers.get('x-forwarded-for') || 'unknown'
        });

        // 9. Return Response
        return new Response(
            JSON.stringify({
                content,
                model: deploymentName,
                usage: {
                    inputTokens: usage.prompt_tokens,
                    outputTokens: usage.completion_tokens,
                    cost: costUsd
                },
                spending: {
                    current: (spending.current_spending || 0) + costUsd,
                    limit: 5.0,
                    remaining: 5.0 - ((spending.current_spending || 0) + costUsd)
                },
                finishReason: azureData.choices?.[0]?.finish_reason
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
