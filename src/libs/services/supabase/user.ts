import { User } from "@supabase/supabase-js";
import { createSignal } from "solid-js";

export const [user, setUser] = createSignal<User | undefined>(undefined);
