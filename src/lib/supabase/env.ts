export function getSupabaseBrowserEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const missing: string[] = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (missing.length > 0) {
    throw new Error(`Missing Supabase env vars: ${missing.join(", ")}`);
  }

  return { url, anonKey };
}

export function getSupabaseServiceEnv() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const { url } = getSupabaseBrowserEnv();

  if (!serviceRoleKey) {
    throw new Error("Missing Supabase env var: SUPABASE_SERVICE_ROLE_KEY");
  }

  return {
    url,
    serviceRoleKey,
  };
}
