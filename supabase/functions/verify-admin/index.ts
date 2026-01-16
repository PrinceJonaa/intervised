
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Create a Supabase client with the Auth context of the logged-in user
        const supabaseClient = createClient(
            // Supabase API URL - env var automatically populated by Supabase
            Deno.env.get('SUPABASE_URL') ?? '',
            // Supabase Anon Key - env var automatically populated by Supabase
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            // Global header to inject the user's JWT
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // Get the user from the JWT
        // This server-side check ensures the token is valid and not tampered with
        const {
            data: { user },
            error: userError,
        } = await supabaseClient.auth.getUser()

        if (userError || !user) {
            throw new Error('Invalid token or user not found')
        }

        // Now check the user's role in your 'profiles' table
        // (Assuming you store roles in a 'profiles' table, adapting to your schema)
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profileError) {
            console.error('Error fetching profile:', profileError)
            throw new Error('Failed to fetch user profile')
        }

        const isAdmin = profile?.role === 'admin'

        // Return the verification result
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
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            }
        )
    }
})
