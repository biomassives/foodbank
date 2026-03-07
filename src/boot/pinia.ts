import { boot } from 'quasar/wrappers';
import pinia from 'src/store/store';
import { supabase } from 'src/dbManagement';

export default boot(({ app }) => {
  app.use(pinia);
  // Expose supabase for Puppeteer e2e tests (harmless — anon key is already public)
  if (import.meta.env.DEV || import.meta.env.VITE_E2E === 'true') {
    (window as any).__supabase = supabase;
  }
});