# Free Treehole

Free Treehole is an anonymous community board inspired by the spirit of campus treehole forums. Users can publish posts, reply anonymously, follow discussions, receive reply notifications, and search across public conversations.

The project is maintained by Mi-Ling-PKU and Codex.

## Features

- Email/password authentication with Supabase Auth.
- Logged-in community feed for browsing, publishing, replying, and following posts.
- Per-post anonymous identities: the post author is shown as `洞主`; other participants receive stable names such as Alice, Bob, Carol, and later prefixed names.
- Dedicated post pages at `/post/[id]`, supporting both UUIDs and public post numbers such as `/post/1`.
- Followed-post view with the same browsing experience as the main feed.
- Reply notifications with post number and a short reply preview.
- Message read/unread controls.
- Search settings for searching only posts or both posts and replies.
- Report and moderation workflow for admins.
- Dark/light theme toggle, with dark mode as the default.
- Client-side drafts for new posts and replies.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase Auth and Postgres
- Vercel

## Local Setup

Install dependencies:

```bash
npm install
```

Create a Supabase project, then run the full SQL in:

```text
supabase/schema.sql
```

This schema creates the application tables, row-level security policies, and RPC functions used by the app. It is intended for a fresh project or a controlled reset, because it drops and recreates the app's business tables.

Copy `.env.example` to `.env.local` and fill in:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Supabase Auth

In Supabase, enable Email under Authentication > Providers.

After deployment, add the production site to Authentication > URL Configuration:

```text
https://your-domain.vercel.app
https://your-domain.vercel.app/**
```

## Admin Setup

Register a user account first. Then copy that user's ID from Supabase Authentication > Users and run:

```sql
insert into public.admins (user_id)
values ('replace-with-user-id');
```

That account will see the admin entry and can review reports.

## Incremental SQL Updates

For existing deployments, small non-destructive database updates may be placed in `supabase/update_*.sql`.

For example:

```text
supabase/update_comment_notifications.sql
```

Run these files in Supabase SQL Editor when the deployed frontend depends on updated RPC behavior.

## Vercel Deployment

Import the GitHub repository into Vercel and use the default Next.js settings.

Required environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Recommended build command:

```bash
npm run build
```

## Common Commands

```bash
npm run dev
npm run lint
npm run build
```

## Credits

Free Treehole is inspired by PKU Treehole culture. The implementation also acknowledges ideas and prior art from the open-source projects `xmcp/webhole` and `jimmielin/the-light`.
