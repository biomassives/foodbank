import { boot } from 'quasar/wrappers';
import pinia from 'src/store/store';
import { supabase } from 'src/dbManagement';
import { setLocale, registerLangPack } from 'src/i18n';

export default boot(async ({ app, router }) => {
  app.use(pinia);

  // Restore saved locale
  const savedLocale = localStorage.getItem('locale');
  if (savedLocale && savedLocale !== 'en') {
    try {
      const { default: pack } = await import(/* @vite-ignore */ `src/i18n/${savedLocale}`);
      registerLangPack(savedLocale, pack);
      setLocale(savedLocale);
    } catch { /* unknown locale — fall back to en */ }
  }

  // Expose supabase and router for Puppeteer e2e tests (harmless — anon key is already public)
  if (import.meta.env.DEV || import.meta.env.VITE_E2E === 'true') {
    const w = window as Window & Record<string, unknown>;
    w.__supabase = supabase;
    w.__router = router;
    w.__supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    w.__supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  }
});