// Single Supabase client — created in src/dbManagement/index.ts.
// This boot file re-exports it so Quasar's boot lifecycle can attach
// it to the Vue app, and dev mode can expose it on window.
import { supabase } from 'src/dbManagement';

if (process.env.DEV) {
  window.supabase = supabase;
  console.log('🛠️ Dev Mode: window.supabase is available for console debugging.');
}

export default ({ app }) => {
  app.config.globalProperties.$supabase = supabase;
};

export { supabase };
