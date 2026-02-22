-- SUPABASE SQL EDITOR UCHUN KOD
-- Iltimos, ushbu kodni Supabase sahifangizdagi o'zingizning "SQL Editor" qismingizga kiritib "Run" (ishga tushirish) ni bosing.

-- 1. Create allowed_emails table
CREATE TABLE IF NOT EXISTS public.allowed_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'seller')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Modify the User trigger to check against allowed_emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  predefined_role text;
BEGIN
  -- Check if user's email is in allowed_emails list
  SELECT role INTO predefined_role FROM public.allowed_emails WHERE email = new.email;
  
  IF predefined_role IS NULL THEN
    -- Begona pochta kirsa 'blocked' roliga tushadi
    INSERT INTO public.profiles (id, full_name, avatar_url, role)
    VALUES (
      new.id, 
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'avatar_url',
      'blocked'
    );
  ELSE
    -- Ruxsati bor pochta
    INSERT INTO public.profiles (id, full_name, avatar_url, role)
    VALUES (
      new.id, 
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'avatar_url',
      predefined_role
    );
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Temporarily allow all authenticated users to manage allowed_emails
CREATE POLICY "Allow full access to allowed_emails" ON public.allowed_emails FOR ALL TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;
