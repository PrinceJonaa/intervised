
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

        if (!authHeader) {
            throw new Error('Missing Authorization header');
        }

        // Create a Supabase client with persistSession false
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                auth: { persistSession: false }
            }
        )

        // Extract token
        const token = authHeader.replace('Bearer ', '');

        // Get the user from the JWT explicitly
        const {
            data: { user },
            error: userError,
        } = await supabaseClient.auth.getUser(token)

        if (userError || !user) {
            throw new Error('Invalid token or user not found')
        }

        // Check profile
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profileError) {
            console.error('Profile fetch error:', profileError)
            throw new Error('Failed to fetch user profile')
        }

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
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            }
        )
    }
})
