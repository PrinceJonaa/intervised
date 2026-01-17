
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization');
        console.log(`[verify-admin] Auth header present: ${!!authHeader}`);

        if (!authHeader) {
            throw new Error('Missing Authorization header');
        }

        // Create a Supabase client
        const supabaseClient = createClient(
            // Supabase API URL - env var automatically populated by Supabase
            Deno.env.get('SUPABASE_URL') ?? '',
            // Supabase Anon Key - env var automatically populated by Supabase
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                auth: {
                    persistSession: false // Critical for server-side usage
                }
            }
        )

        // Extract token
        const token = authHeader.replace('Bearer ', '');

        // Get the user from the JWT explicitely
        const {
            data: { user },
            error: userError,
        } = await supabaseClient.auth.getUser(token)

        if (userError || !user) {
            console.error('[verify-admin] User fetch error:', userError);
            throw new Error('Invalid token or user not found')
        }

        console.log(`[verify-admin] Verified user: ${user.id} (${user.email})`);

        // Check profile
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profileError) {
            console.error('[verify-admin] Profile fetch error:', profileError)
            // Fallback: If profile fetch fails (e.g. RLS issues), checks if user metadata has role?
            // But let's throw for now to be safe.
            throw new Error('Failed to fetch user profile')
        }

        console.log(`[verify-admin] User role: ${profile?.role}`);

        const isAdmin = profile?.role === 'admin'

        return new Response(
            JSON.stringify({
                isAdmin,
                userId: user.id,
                role: profile?.role,
                verifiedAt: new Date().toISOString()
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        console.error('[verify-admin] Error:', error.message);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            }
        )
    }
})
