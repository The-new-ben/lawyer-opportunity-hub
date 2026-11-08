import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const client = createClient(supabaseUrl, serviceKey);

  const { data: profiles } = await client
    .from("profiles")
    .select("id, user_id")
    .eq("delete_requested", true)
    .eq("anonymized", false);

  for (const profile of profiles ?? []) {
    await client.from("profiles").update({
      company_name: null,
      avatar_url: null,
      consent: false,
      anonymized: true
    }).eq("id", profile.id);
    await client.auth.admin.deleteUser(profile.user_id);
  }

  return new Response("ok");
});
