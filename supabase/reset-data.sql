-- DANGER: Run manually in Supabase SQL Editor only when this project should
-- contain the schema with no users, application data, or Storage objects.
-- This does not drop tables, policies, functions, indexes, or the bucket.

BEGIN;

DELETE FROM storage.objects
WHERE bucket_id = 'app-84kgjmh9j8qp_files';

TRUNCATE TABLE
  share_access_logs,
  shared_links,
  files,
  folders,
  profiles
RESTART IDENTITY CASCADE;

-- Auth users are managed by Supabase Auth. Delete them last so the project
-- starts with no accounts. This requires SQL Editor owner privileges.
DELETE FROM auth.users;

COMMIT;
