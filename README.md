# EpicBox

EpicBox is a web-based file manager for uploading, organizing, previewing, and
sharing files. It uses Supabase for authentication and file metadata, and
supports private Supabase Storage or AWS S3 for file objects.

- **Production:** [epicbox.vercel.app](https://epicbox.vercel.app/)
- **Source:** [Deepparmar07/Epicbox](https://github.com/Deepparmar07/Epicbox)

## Features

- Email and password authentication, registration, and password recovery
- File upload, download, search, preview, and folder organization
- Favorites, recent files, and recycle-bin workflows
- Share links with optional passwords, expiration, and download permissions
- Share QR codes and access statistics
- Responsive interface with light and dark themes
- Supabase Auth, PostgreSQL, and row-level security
- Supabase Storage or private AWS S3 object storage
- Browser-side AES-GCM encryption before file upload

## Technology

- React 18, TypeScript, Vite, and React Router
- Tailwind CSS, Radix UI, and Lucide icons
- Supabase Auth, PostgreSQL, Storage, and Edge Functions
- AWS S3 with short-lived presigned URLs
- Vercel

## Getting started

### Requirements

- Node.js 20 or later
- npm 10 or later
- A Supabase project

### Install and run

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env` and set the values for your Supabase project:

   ```dotenv
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
   VITE_STORAGE_PROVIDER=supabase
   VITE_ENCRYPTION_KEY=your-encryption-key
   ```

3. Apply the SQL migrations in `supabase/migrations/` to the intended Supabase
   project, in filename order.
4. Start the local development server:

   ```sh
   npm run dev
   ```

The app uses hash-based routes. The login page is available at `/#/login`.

## Storage configuration

### Supabase Storage

Set `VITE_STORAGE_PROVIDER=supabase` to store new uploads in the configured
Supabase Storage bucket. This is the default. Existing file records retain
their provider so they continue using their original storage location.

### AWS S3

S3 is optional. The bucket must remain private; EpicBox accesses it through
short-lived URLs issued by the `s3-storage` Supabase Edge Function. AWS
credentials belong only in Supabase Edge Function secrets—not in frontend
`VITE_*` variables, source code, or chat.

1. Create a private S3 bucket. Keep **Block all public access** enabled.
2. Configure bucket CORS for the application origins. For production:

   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["PUT", "GET", "DELETE"],
       "AllowedOrigins": ["https://epicbox.vercel.app"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

3. Create a dedicated IAM identity with only the object permissions EpicBox
   needs, scoped to the bucket:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject"
         ],
         "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
       }
     ]
   }
   ```

4. In Supabase **Edge Functions → Secrets**, set:
   - `S3_BUCKET`
   - `AWS_REGION`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

   Supabase supplies its project URL and service credentials to the Edge
   Function at runtime.
5. Deploy the Edge Function to the same Supabase project used by the app:

   ```sh
   npx supabase login
   npx supabase functions deploy s3-storage --project-ref YOUR_PROJECT_REF
   ```

6. Apply migration `00009_track_file_storage_provider.sql` if it has not
   already been applied.
7. After verifying the function, secrets, bucket CORS, and IAM policy, set
   `VITE_STORAGE_PROVIDER=s3` in the Vercel environment and redeploy.
8. Test a new upload, download, preview, share link, and deletion. Existing
   Supabase objects are not automatically copied to S3.

Enable S3 versioning to help recover overwritten or deleted objects. For an
independent backup, configure replication or scheduled copies to a separate
bucket or account, and periodically test restoring an object.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes | URL of the Supabase project |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase publishable key |
| `VITE_SUPABASE_ANON_KEY` | Legacy | Legacy publishable/anon key name supported by existing deployments |
| `VITE_STORAGE_PROVIDER` | No | `supabase` (default) or `s3` |
| `VITE_ENCRYPTION_KEY` | For existing encrypted data | Browser-side AES-GCM encryption key |

Vite embeds `VITE_*` values in the client bundle. In particular,
`VITE_ENCRYPTION_KEY` is **not a server-only secret**. Changing it can prevent
previously encrypted files from being decrypted. Keep the same value for
existing data and do not treat it as a secure key-management system.

## Database and deployment

Apply all migrations in `supabase/migrations/` in order. They define the
application schema, access policies, profile recovery, encrypted uploads, and
per-file storage-provider tracking. Use the SQL Editor in the correct Supabase
project and verify each migration before continuing.

For Vercel, use:

- Build command: `npm run build`
- Output directory: `dist`
- Production branch: `master`

Set the required `VITE_*` variables in the appropriate Vercel environments and
redeploy after changing them. Do not put AWS credentials in Vercel.

The `supabase/reset-data.sql` script is destructive: it removes application
data and storage objects. Review it carefully and run it only when you
intentionally want to reset the correct project.

## Development checks

```sh
npm run lint
npm run build
```

## Security notes

- Never commit `.env`, AWS access keys, Supabase service-role keys, or tokens.
- Keep Supabase row-level security enabled for application tables.
- Keep the S3 bucket private and grant only the required IAM permissions.
- Browser-side encryption does not replace TLS, access controls, backups, or
  secure management of encryption keys.
