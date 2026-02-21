UPDATE public.profiles 
SET 
  active = true, 
  joined_at = now(),
  role = 'admin'
WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';