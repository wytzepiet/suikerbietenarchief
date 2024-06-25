"user server";

import { createClient } from "@supabase/supabase-js";
import { Database } from "./types";

export const supabase = () =>
  createClient<Database>(
    process.env.VITE_SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
  );
