# EpicBox

EpicBox is a secure cloud file-storage web application built with React,
TypeScript, Vite, Tailwind CSS, and Supabase. It provides authenticated file
management, folders, favorites, sharing, recycle-bin workflows, and protected
storage operations.

Production: <https://epicbox.vercel.app/>

## Features

- Email and password authentication
- User profiles and role-based access
- Folder and file management
- Secure Supabase Storage integration
- Favorites, recent files, and recycle bin
- Shareable file and folder links
- Responsive dashboard interface

## Technology

- React 18 and TypeScript
- Vite
- React Router
- Tailwind CSS and Radix UI
- Supabase Auth, PostgreSQL, Row Level Security, and Storage
- npm

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- A Supabase project

## Local setup

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root:

   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   VITE_STORAGE_PROVIDER=supabase
   ```

   Only use the Supabase anon/public key in this frontend application. Never
   expose a service-role key.

3. Initialize the new Supabase project by running the migration files in
   order in Supabase SQL Editor:

   - `supabase/migrations/00001_create_initial_schema.sql`
   - `supabase/migrations/00002_add_terabox_features.sql`
   - `supabase/migrations/00003_fix_profile_creation.sql`

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the URL printed by Vite. The application uses hash-based navigation,
   so the login route is available at `/#/login`.

## Production build

```bash
npm run build
```

The production output is generated in `dist/`. Vercel uses the configuration
in `vercel.json` and the `master` branch for production deployment.

## Project structure

```text
.
├── public/                 Static assets and images
├── src/
│   ├── components/         Shared UI and feature components
│   ├── contexts/           Authentication and application state
│   ├── db/                 Supabase client and data-access APIs
│   ├── hooks/              Reusable React hooks
│   ├── lib/                Encryption and file utilities
│   ├── pages/              Route-level screens
│   ├── types/              Shared TypeScript types
│   ├── App.tsx             Application shell and routes
│   └── main.tsx            React entry point
├── supabase/
│   ├── migrations/         Database schema and security migrations
│   └── config.toml         Local Supabase configuration
├── index.html              Vite HTML entry point
├── package.json            Scripts and dependencies
├── vercel.json              Vercel build and SPA routing
└── vite.config.ts          Vite configuration
```

## Authentication notes

New users must register with an email address and password in the active
Supabase project. Profile rows are created by the database trigger in
`00003_fix_profile_creation.sql`; the browser does not insert profile rows
directly.

If authentication returns an invalid-credentials error after changing
Supabase projects, register the user again in the new project. Users and
uploaded files are not automatically transferred between Supabase projects.

## Deployment

The production repository is `Deepparmar07/app2`, deployed by the Vercel
project `app2`. Configure `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` as Vercel Production environment variables, then
redeploy after changing either value because Vite embeds `VITE_*` variables
during the build.

## License

No license has been specified for this project.
