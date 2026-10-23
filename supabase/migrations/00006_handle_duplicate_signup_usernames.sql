-- Prevent a duplicate username from aborting Supabase Auth user creation.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count integer;
  base_username text;
  candidate_username text;
  user_id_suffix text := replace(NEW.id::text, '-', '');
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.profiles;

  base_username := LOWER(COALESCE(
    NULLIF(BTRIM(NEW.raw_user_meta_data ->> 'username'), ''),
    NULLIF(
      SPLIT_PART(COALESCE(NULLIF(NEW.email, ''), NULLIF(NEW.phone, ''), NEW.id::text), '@', 1),
      ''
    ),
    'user'
  ));
  candidate_username := base_username;

  LOOP
    BEGIN
      INSERT INTO public.profiles (id, username, role)
      VALUES (
        NEW.id,
        candidate_username,
        CASE WHEN user_count = 0 THEN 'admin'::public.user_role ELSE 'user'::public.user_role END
      )
      ON CONFLICT (id) DO NOTHING;

      RETURN NEW;
    EXCEPTION WHEN unique_violation THEN
      IF candidate_username = base_username THEN
        candidate_username := base_username || '_' || user_id_suffix;
      ELSE
        candidate_username := candidate_username || '_1';
      END IF;
    END;
  END LOOP;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE OF confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user();
