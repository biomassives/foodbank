// Global test setup
// Mock import.meta.env for Supabase client initialization
Object.defineProperty(globalThis, 'import', {
  value: { meta: { env: { VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' } } },
  writable: true,
});
