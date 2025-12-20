import { createClient } from "@supabase/supabase-js";

// WARNING: This client is for server-side use only with the service role key.
// Never expose this in the browser.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      // It's crucial to disable session persistence when using the service key.
      persistSession: false,
    },
  }
);
