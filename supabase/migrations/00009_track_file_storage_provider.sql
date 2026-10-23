ALTER TABLE public.files
  ADD COLUMN IF NOT EXISTS storage_provider text NOT NULL DEFAULT 'supabase';

ALTER TABLE public.files
  DROP CONSTRAINT IF EXISTS files_storage_provider_check;

ALTER TABLE public.files
  ADD CONSTRAINT files_storage_provider_check
  CHECK (storage_provider IN ('supabase', 's3'));
