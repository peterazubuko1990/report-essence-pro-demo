// Bootstrap the hardcoded ITF admin user. Safe to call multiple times.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_EMAIL = "admincpd@itf.gov.ng";
const ADMIN_PASSWORD = "123456";

Deno.serve(async () => {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, key, { auth: { persistSession: false } });

  // Check if user already exists
  const { data: list } = await admin.auth.admin.listUsers();
  const existing = list?.users?.find((u) => u.email === ADMIN_EMAIL);

  let userId: string | undefined = existing?.id;
  let created = false;

  if (!existing) {
    const { data, error } = await admin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "ITF CPD Administrator" },
    });
    if (error) {
      return new Response(JSON.stringify({ ok: false, error: error.message }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }
    userId = data.user?.id;
    created = true;
  } else {
    // Ensure password matches
    await admin.auth.admin.updateUserById(existing.id, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
  }

  if (userId) {
    await admin.from("profiles").upsert({
      id: userId,
      email: ADMIN_EMAIL,
      full_name: "ITF CPD Administrator",
    });
    await admin.from("user_roles").upsert(
      { user_id: userId, role: "admin" },
      { onConflict: "user_id,role" },
    );
  }

  return new Response(
    JSON.stringify({ ok: true, created, userId, email: ADMIN_EMAIL }),
    { headers: { "content-type": "application/json" } },
  );
});
