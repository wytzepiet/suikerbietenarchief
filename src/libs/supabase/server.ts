"user server";

import { createClient } from "@supabase/supabase-js";
import { Database } from "./types";
import { createServerClient } from "@supabase/ssr";
import { useSession } from "vinxi/http";

function getSession() {
  if (!process.env.SESSION_SECRET) throw new Error("SESSION_SECRET is not set");
  return useSession({ password: process.env.SESSION_SECRET });
}

export const supabase = () =>
  createServerClient<Database>(
    process.env.VITE_SUPABASE_URL ?? "",
    process.env.VITE_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        async get(name: string) {
          const session = await getSession();
          return session.data[name];
        },
        async set(name: string, value: string, options) {
          try {
            const session = await getSession();
            session.update((d) => (d[name] = value));
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options) {
          try {
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
