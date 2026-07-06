create extension if not exists pgcrypto;

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  public_no bigint generated always as identity unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(trim(content)) between 1 and 2000),
  status text not null default 'active' check (status in ('active', 'hidden', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  public_no bigint generated always as identity unique,
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(trim(content)) between 1 and 1200),
  reply_to_comment_id uuid references public.comments(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'hidden', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('post', 'comment')),
  target_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (char_length(trim(reason)) between 1 and 600),
  status text not null default 'open' check (status in ('open', 'reviewed')),
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
before update on public.posts
for each row execute function public.touch_updated_at();

drop trigger if exists comments_touch_updated_at on public.comments;
create trigger comments_touch_updated_at
before update on public.comments
for each row execute function public.touch_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins
    where user_id = auth.uid()
  );
$$;

alter table public.admins enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.favorites enable row level security;
alter table public.reports enable row level security;

drop policy if exists "admins can read admin list" on public.admins;
create policy "admins can read admin list"
on public.admins for select
to authenticated
using (public.is_admin() or user_id = auth.uid());

drop policy if exists "anyone can read active posts" on public.posts;
create policy "anyone can read active posts"
on public.posts for select
to anon, authenticated
using (status = 'active' or public.is_admin());

drop policy if exists "users can create own posts" on public.posts;
create policy "users can create own posts"
on public.posts for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "admins can update posts" on public.posts;
create policy "admins can update posts"
on public.posts for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "anyone can read active comments" on public.comments;
create policy "anyone can read active comments"
on public.comments for select
to anon, authenticated
using (status = 'active' or public.is_admin());

drop policy if exists "users can create own comments" on public.comments;
create policy "users can create own comments"
on public.comments for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "admins can update comments" on public.comments;
create policy "admins can update comments"
on public.comments for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "users can manage own favorites" on public.favorites;
create policy "users can manage own favorites"
on public.favorites for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users can create reports" on public.reports;
create policy "users can create reports"
on public.reports for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can read own reports and admins can read all" on public.reports;
create policy "users can read own reports and admins can read all"
on public.reports for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "admins can update reports" on public.reports;
create policy "admins can update reports"
on public.reports for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create index if not exists posts_created_at_idx on public.posts(created_at desc);
create index if not exists comments_post_id_created_at_idx on public.comments(post_id, created_at);
create index if not exists comments_reply_to_idx on public.comments(reply_to_comment_id);
create index if not exists favorites_user_id_created_at_idx on public.favorites(user_id, created_at desc);
create index if not exists reports_status_created_at_idx on public.reports(status, created_at desc);
