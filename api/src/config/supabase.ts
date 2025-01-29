// For supabase functions, not for general db connection
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_ANON_KEY as string)

export default supabase