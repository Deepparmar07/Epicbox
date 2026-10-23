# EpicBox

EpicBox is a secure cloud file-storage application built with React,
TypeScript, Vite, Tailwind CSS, and Supabase. It provides authenticated file
management, folders, favorites, recent files, recycle-bin workflows, sharing,
and protected storage operations.

## Features

- Email/password authentication and password reset
- User profiles with admin and user roles
- File upload, download, search, sorting, and preview
- Folder creation and organization
- Favorites, recent files, and recycle bin
- Password-protected and expiring share links
- QR codes and share-access statistics
- Private Supabase Storage with client-side AES-GCM encryption
- Responsive light and dark themes

## Stack

- React 18, TypeScript, and Vite
- React Router with hash-based navigation
- Tailwind CSS and Radix UI
- Supabase Auth, PostgreSQL, Row Level Security, and Storage
- Vercel deployment
- npm 10 and Node.js 20 or newer

## Repository

- GitHub: [DEEPPARMAR7/EPICBOX](https://github.com/DEEPPARMAR7/EPICBOX)
- Production: [epicbox.vercel.app](https://epicbox.vercel.app/)

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` from `.env.example`:

   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
   VITE_STORAGE_PROVIDER=supabase
   VITE_ENCRYPTION_KEY=your-existing-encryption-key
   ```

   `.env` is ignored by Git. Use only a Supabase publishable/anon key in this
   browser application. Never expose a Supabase service-role key.

3. Apply the Supabase migrations in the SQL Editor, in this order:

   - `supabase/migrations/00001_create_initial_schema.sql`
   - `supabase/migrations/00002_add_terabox_features.sql`
   - `supabase/migrations/00003_fix_profile_creation.sql`
   - `supabase/migrations/00004_repair_profile_trigger.sql`
   - `supabase/migrations/00005_backfill_missing_profiles.sql`
   - `supabase/migrations/00006_handle_duplicate_signup_usernames.sql`
   - `supabase/migrations/00007_grant_authenticated_app_table_access.sql`
   - `supabase/migrations/00008_allow_encrypted_file_uploads.sql`
   - `supabase/migrations/00009_track_file_storage_provider.sql`

   These migrations create the database tables, Row Level Security policies,
   profile trigger, functions, indexes, and private storage bucket. The trigger
   migrations repair server-side profile creation and safely handle duplicate
   usernames; migration `00005` restores profiles for accounts created before
   profile creation was repaired, `00007` grants table privileges required in
   addition to row-level security policies, and `00008` permits encrypted file
   blobs in the private storage bucket. `00009` records which provider stores
   each file so existing Supabase files remain accessible after new uploads
   switch to S3.

4. Start the development server:

   ```bash
   npm run dev
   ```

   The application uses hash-based navigation. The login page is available at
   `/#/login`.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes | URL of the active Supabase project |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase publishable key |
| `VITE_SUPABASE_ANON_KEY` | Legacy | Older anon-key name still supported |
| `VITE_STORAGE_PROVIDER` | Yes | `supabase` or `s3`; S3 requires the setup below |
| `VITE_ENCRYPTION_KEY` | For compatibility | AES key used for encrypted files |

`VITE_*` values are embedded in the frontend bundle. The encryption key is
therefore not a server-only secret. Keep the same `VITE_ENCRYPTION_KEY` value
when restoring access to existing encrypted files; changing it makes those
files unreadable. If no key was configured for older files, the application’s
legacy fallback may be required for compatibility. Plan a key migration before
changing encryption behavior.

## Supabase setup

The active project must contain all nine migrations listed above. New users are
created in the active Supabase project and their profile is created by a
database trigger; the browser must not insert profile rows during signup.
Users and file metadata are not automatically transferred when changing
Supabase projects.

For a new project:

1. Run all nine migrations in Supabase SQL Editor, in order.
2. Confirm the migrations complete successfully. The Supabase storage bucket
   is used for legacy files and when `VITE_STORAGE_PROVIDER=supabase`.
3. Configure Authentication settings and redirect URLs for local and Vercel
   origins.
4. Try signing in with the email used at registration. If the auth account
   exists but its profile was missing, migration `00005` restores that profile.
   Accounts are not transferred when switching Supabase projects.

## AWS S3 storage

EpicBox encrypts files in the browser and uses a Supabase Edge Function to issue
short-lived S3 presigned URLs. AWS credentials must only be stored as Edge
Function secrets; never add them to Vercel `VITE_*` variables or commit them.
Existing files stay in Supabase and keep working because each file records its
storage provider. New uploads use the provider selected by
`VITE_STORAGE_PROVIDER`.

1. Create a private S3 bucket in the AWS region you will configure. Keep Block
   Public Access enabled and enable bucket versioning if you want recovery from
   accidental overwrites/deletes.
2. Configure bucket CORS. For production, replace the origin below with the
   EpicBox origin and add localhost only if needed for development:

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

3. Create a dedicated AWS IAM user/access key limited to this bucket and the
   `s3:PutObject`, `s3:GetObject`, and `s3:DeleteObject` actions. Do not use
   root-account credentials. Scope the policy resource to
   `arn:aws:s3:::YOUR_BUCKET_NAME/*`.
4. Deploy `supabase/functions/s3-storage` to the same Supabase project used by
   EpicBox. In Supabase Dashboard → Edge Functions → Secrets, set
   `S3_BUCKET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, and
   `AWS_SECRET_ACCESS_KEY`. Never paste these values into chat or source files.
   Supabase provides `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and
   `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions.
5. Run all nine migrations, including `00009_track_file_storage_provider.sql`.
6. Only after the function and secrets are ready, set `VITE_STORAGE_PROVIDER=s3` in Vercel Production, then redeploy. Set it
   for Preview/Development only where the Edge Function and secrets are ready.
7. Test a new upload, download, preview, share link, and permanent delete before
   removing or changing the existing Supabase Storage bucket.

S3 is the primary object store after this switch, not automatically a backup.
For backup protection, enable versioning and configure replication or scheduled
copies to a separate bucket/account with independent access controls and
retention. Periodically test restoring an object.

## Vercel deployment

Connect Vercel to the `Deepparmar07/Epicbox` repository and use `master` as
the production branch. The project configuration is:

- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

Add these environment variables in Vercel for Production, Preview, and
Development:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_STORAGE_PROVIDER
VITE_ENCRYPTION_KEY
```

Redeploy after changing any `VITE_*` value. `vercel.json` rewrites clean entry
URLs such as `/login` to the Vite application entry point, preventing Vercel
from returning a 404 before the client router loads.

If a replacement Supabase project contains test data, the optional
`supabase/reset-data.sql` script removes users, application records, and
Storage objects while preserving the schema. Review it carefully and run it
manually only in the intended replacement project.

## Production validation

Run the production build locally:

```bash
npm run build
```

The generated files are written to `dist/`. The repository also provides a
combined lint and build command:

```bash
npm run lint
```

## Project structure

```text
src/
  components/       Shared UI and layout components
  contexts/         Authentication and application state
  db/               Supabase client and data-access APIs
  hooks/             Reusable React hooks
  lib/               Encryption and storage providers
  pages/             Route-level screens
  routes.tsx        Application routes
supabase/
  migrations/       Database schema and security migrations
docs/prd.md         Product requirements record
vercel.json         Vercel build and SPA rewrite configuration
```

## Security notes

- Never commit `.env`, service-role keys, database passwords, or access tokens.
- Supabase Row Level Security must remain enabled on application tables.
- Keep the Storage bucket private.
- Use the same encryption key when accessing existing encrypted files.
- Review and rotate exposed credentials immediately if they are published
  outside the intended deployment configuration.
