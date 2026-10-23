-- Table grants are required in addition to RLS policies.
-- RLS continues to restrict each user's rows after these grants are applied.
GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.folders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.files TO authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.shared_links TO authenticated;
GRANT SELECT ON TABLE public.shared_links TO anon;
