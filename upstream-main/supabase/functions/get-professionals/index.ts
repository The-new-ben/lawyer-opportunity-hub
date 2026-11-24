import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Missing configuration' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { role, specialization, jurisdiction } = await req.json()

    let query = supabase
      .from('lawyers')
      .select('profile_id, location, specializations, rating, profiles!inner(full_name, role)')

    if (jurisdiction) query = query.ilike('location', `%${jurisdiction}%`)
    if (specialization) query = query.contains('specializations', [specialization])
    if (role) query = query.eq('profiles.role', role)

    const { data, error } = await query
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const professionals = (data || []).map(item => ({
      profile_id: item.profile_id,
      full_name: item.profiles.full_name,
      role: item.profiles.role,
      location: item.location,
      specializations: item.specializations || [],
      rating: item.rating
    }))

    return new Response(JSON.stringify(professionals), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
