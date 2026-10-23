-- Repair accounts whose auth user was created before profile creation failed.
WITH missing_profiles AS (
  SELECT
    users.id,
    COALESCE(
      NULLIF(BTRIM(users.raw_user_meta_data ->> 'username'), ''),
      NULLIF(SPLIT_PART(COALESCE(users.email, users.phone, users.id::text), '@', 1), ''),
      'user'
    ) AS base_username,
    users.created_at
  FROM auth.users AS users
  LEFT JOIN public.profiles AS profiles ON profiles.id = users.id
  WHERE profiles.id IS NULL
),
named_profiles AS (
  SELECT
    missing_profiles.id,
    CASE
      WHEN COUNT(*) OVER (PARTITION BY missing_profiles.base_username) > 1
        OR EXISTS (
          SELECT 1
          FROM public.profiles AS existing
          WHERE existing.username = missing_profiles.base_username
        )
      THEN missing_profiles.base_username || '_' || missing_profiles.id::text
      ELSE missing_profiles.base_username
    END AS username,
    missing_profiles.created_at
  FROM missing_profiles
)
INSERT INTO public.profiles (id, username, role, created_at)
SELECT id, username, 'user'::public.user_role, COALESCE(created_at, now())
FROM named_profiles
ON CONFLICT (id) DO NOTHING;
