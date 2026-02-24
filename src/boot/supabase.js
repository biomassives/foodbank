// 1. You MUST have this import at the top!
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ✅ Only expose to the window if we are running locally
if (process.env.DEV) {
  window.supabase = supabase
  console.log('🛠️ Dev Mode: window.supabase is available for console debugging.')
}

export default ({ app }) => {
  app.config.globalProperties.$supabase = supabase
}

// Export it so other non-Vue files can use it
export { supabase }
