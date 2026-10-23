-- Files are encrypted in the browser and uploaded as application/octet-stream.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-84kgjmh9j8qp_files',
  'app-84kgjmh9j8qp_files',
  false,
  52428828,
  ARRAY['application/octet-stream']
)
ON CONFLICT (id) DO UPDATE
SET
  public = false,
  file_size_limit = GREATEST(COALESCE(storage.buckets.file_size_limit, 0), 52428828),
  allowed_mime_types = CASE
    WHEN storage.buckets.allowed_mime_types IS NULL THEN ARRAY['application/octet-stream']
    WHEN 'application/octet-stream' = ANY(storage.buckets.allowed_mime_types)
      THEN storage.buckets.allowed_mime_types
    ELSE array_append(storage.buckets.allowed_mime_types, 'application/octet-stream')
  END;
