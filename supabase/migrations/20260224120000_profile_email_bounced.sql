-- Track bounced/complained email addresses so MTS skips them
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_bounced BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_email_bounced
  ON public.profiles (email_bounced)
  WHERE email_bounced = true;
