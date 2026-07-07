create extension if not exists pgcrypto;

drop function if exists public.create_post(text) cascade;
drop function if exists public.create_comment(uuid, text, uuid) cascade;
drop function if exists public.set_favorite(uuid, boolean) cascade;
drop function if exists public.create_report(text, uuid, text) cascade;
drop function if exists public.review_report(uuid, text) cascade;
drop function if exists public.moderate_content(text, uuid, text, text, boolean, timestamptz) cascade;
drop function if exists public.mark_message_read(uuid) cascade;
drop function if exists public.mark_all_messages_read() cascade;
drop function if exists public.mark_message_unread(uuid) cascade;
drop function if exists public.is_admin() cascade;
drop function if exists public.touch_updated_at() cascade;
drop function if exists public.next_participant_name(integer) cascade;
drop function if exists public.assert_not_banned() cascade;

drop table if exists public.moderation_actions cascade;
drop table if exists public.reports cascade;
drop table if exists public.messages cascade;
drop table if exists public.bans cascade;
drop table if exists public.favorites cascade;
drop table if exists public.post_participants cascade;
drop table if exists public.comments cascade;
drop table if exists public.posts cascade;
drop table if exists public.admins cascade;
drop table if exists public.profiles cascade;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  public_no bigint generated always as identity unique,
  author_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0),
  status text not null default 'active' check (status in ('active', 'folded', 'deleted')),
  tag text,
  reply_count integer not null default 0 check (reply_count >= 0),
  favorite_count integer not null default 0 check (favorite_count >= 0),
  report_count integer not null default 0 check (report_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  sequence integer not null,
  author_id uuid not null references auth.users(id) on delete cascade,
  reply_to_comment_id uuid references public.comments(id) on delete set null,
  content text not null check (char_length(trim(content)) > 0),
  status text not null default 'active' check (status in ('active', 'folded', 'deleted')),
  tag text,
  report_count integer not null default 0 check (report_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (post_id, sequence)
);

create table public.post_participants (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  sequence integer not null check (sequence >= 0),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id),
  unique (post_id, sequence),
  unique (post_id, display_name)
);

create table public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table public.bans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid references public.posts(id) on delete set null,
  comment_id uuid references public.comments(id) on delete set null,
  until timestamptz not null,
  reason text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'system' check (kind in ('system', 'reply', 'moderation', 'ban')),
  title text not null,
  content text not null,
  post_id uuid references public.posts(id) on delete set null,
  comment_id uuid references public.comments(id) on delete set null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('post', 'comment')),
  target_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (char_length(trim(reason)) > 0),
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('post', 'comment', 'user', 'report')),
  target_id uuid not null,
  action text not null,
  reason text,
  actor_id uuid references auth.users(id) on delete set null,
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

create trigger posts_touch_updated_at before update on public.posts
for each row execute function public.touch_updated_at();

create trigger comments_touch_updated_at before update on public.comments
for each row execute function public.touch_updated_at();

create trigger reports_touch_updated_at before update on public.reports
for each row execute function public.touch_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists(select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.next_participant_name(index_value integer)
returns text
language sql
immutable
as $$
  with names as (
    select array[
      'Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Francis', 'Grace', 'Hans',
      'Isabella', 'Jason', 'Kate', 'Louis', 'Margaret', 'Nathan', 'Olivia',
      'Paul', 'Queen', 'Richard', 'Susan', 'Thomas', 'Uma', 'Vivian',
      'Winnie', 'Xander', 'Yasmine', 'Zach'
    ] as items
  ),
  modifiers as (
    select array[
      'Angry', 'Baby', 'Crazy', 'Diligent', 'Excited', 'Fat', 'Greedy',
      'Hungry', 'Interesting', 'Jolly', 'Kind', 'Little', 'Magic', 'Naïve',
      'Old', 'PKU', 'Quiet', 'Rich', 'Superman', 'THU', 'Undefined',
      'Valuable', 'Wifeless', 'Xenial', 'Young', 'Zombie'
    ] as items
  ),
  calc as (
    select greatest(index_value - 1, 0) as i
  )
  select case
    when floor(calc.i / 26)::integer - 1 < 0
      then names.items[(calc.i % 26) + 1]
    when floor(calc.i / 26)::integer - 1 < array_length(modifiers.items, 1)
      then modifiers.items[floor(calc.i / 26)::integer] || ' ' || names.items[(calc.i % 26) + 1]
    else 'You Win ' || calc.i::text
  end
  from names, modifiers, calc;
$$;

create or replace function public.assert_not_banned()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  active_ban record;
begin
  select until, reason into active_ban
  from public.bans
  where user_id = auth.uid() and until > now()
  order by until desc
  limit 1;

  if found then
    raise exception 'BANNED:%:%', active_ban.until, active_ban.reason;
  end if;
end;
$$;

create or replace function public.create_post(p_content text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_post_id uuid;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  perform public.assert_not_banned();

  insert into public.profiles(user_id) values (auth.uid()) on conflict do nothing;

  insert into public.posts(author_id, content)
  values (auth.uid(), trim(p_content))
  returning id into new_post_id;

  insert into public.post_participants(post_id, user_id, display_name, sequence)
  values (new_post_id, auth.uid(), '洞主', 0);

  insert into public.favorites(user_id, post_id)
  values (auth.uid(), new_post_id)
  on conflict do nothing;

  update public.posts set favorite_count = favorite_count + 1 where id = new_post_id;

  return new_post_id;
end;
$$;

create or replace function public.create_comment(p_post_id uuid, p_content text, p_reply_to_comment_id uuid default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_comment_id uuid;
  comment_sequence integer;
  participant_sequence integer;
  post_author uuid;
  post_public_no bigint;
  parent_author uuid;
  reply_summary text;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  perform public.assert_not_banned();
  perform pg_advisory_xact_lock(hashtext(p_post_id::text));

  select author_id, public_no into post_author, post_public_no
  from public.posts
  where id = p_post_id and status <> 'deleted';

  if post_author is null then
    raise exception 'NOT_FOUND';
  end if;

  if p_reply_to_comment_id is not null then
    select author_id into parent_author
    from public.comments
    where id = p_reply_to_comment_id and post_id = p_post_id and status <> 'deleted';

    if parent_author is null then
      raise exception 'NOT_FOUND';
    end if;
  end if;

  if not exists (
    select 1 from public.post_participants
    where post_id = p_post_id and user_id = auth.uid()
  ) then
    select coalesce(max(sequence), 0) + 1 into participant_sequence
    from public.post_participants
    where post_id = p_post_id;

    insert into public.post_participants(post_id, user_id, display_name, sequence)
    values (p_post_id, auth.uid(), public.next_participant_name(participant_sequence), participant_sequence);
  end if;

  select coalesce(max(sequence), 0) + 1 into comment_sequence
  from public.comments
  where post_id = p_post_id;

  insert into public.comments(post_id, sequence, author_id, reply_to_comment_id, content)
  values (p_post_id, comment_sequence, auth.uid(), p_reply_to_comment_id, trim(p_content))
  returning id into new_comment_id;

  update public.posts set reply_count = reply_count + 1 where id = p_post_id;

  insert into public.favorites(user_id, post_id)
  values (auth.uid(), p_post_id)
  on conflict do nothing;

  update public.posts
  set favorite_count = (select count(*) from public.favorites where post_id = p_post_id)
  where id = p_post_id;

  reply_summary := left(trim(p_content), 10) || case when char_length(trim(p_content)) > 10 then '...' else '' end;

  if post_author <> auth.uid() then
    insert into public.messages(user_id, kind, title, content, post_id, comment_id)
    values (
      post_author,
      'reply',
      '你的树洞有新回复',
      '有人回复了你的树洞 #' || post_public_no::text || '：' || reply_summary,
      p_post_id,
      new_comment_id
    );
  end if;

  if parent_author is not null and parent_author <> auth.uid() and parent_author <> post_author then
    insert into public.messages(user_id, kind, title, content, post_id, comment_id)
    values (
      parent_author,
      'reply',
      '你的回复有新回应',
      '有人回复了你在树洞 #' || post_public_no::text || ' 中的回复：' || reply_summary,
      p_post_id,
      new_comment_id
    );
  end if;

  return new_comment_id;
end;
$$;

create or replace function public.set_favorite(p_post_id uuid, p_favorite boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if p_favorite then
    insert into public.favorites(user_id, post_id)
    select auth.uid(), p_post_id
    where exists (select 1 from public.posts where id = p_post_id and status <> 'deleted')
    on conflict do nothing;
  else
    delete from public.favorites where user_id = auth.uid() and post_id = p_post_id;
  end if;

  update public.posts
  set favorite_count = (select count(*) from public.favorites where post_id = p_post_id)
  where id = p_post_id;
end;
$$;

create or replace function public.create_report(p_target_type text, p_target_id uuid, p_reason text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  report_id uuid;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if p_target_type = 'post' then
    if not exists (select 1 from public.posts where id = p_target_id and status <> 'deleted') then
      raise exception 'NOT_FOUND';
    end if;
    update public.posts set report_count = report_count + 1 where id = p_target_id;
  elsif p_target_type = 'comment' then
    if not exists (select 1 from public.comments where id = p_target_id and status <> 'deleted') then
      raise exception 'NOT_FOUND';
    end if;
    update public.comments set report_count = report_count + 1 where id = p_target_id;
  else
    raise exception 'BAD_TARGET';
  end if;

  insert into public.reports(target_type, target_id, user_id, reason)
  values (p_target_type, p_target_id, auth.uid(), trim(p_reason))
  returning id into report_id;

  return report_id;
end;
$$;

create or replace function public.review_report(p_report_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'NO_PERMISSION';
  end if;

  update public.reports
  set status = p_status
  where id = p_report_id and p_status in ('open', 'reviewed', 'dismissed');

  insert into public.moderation_actions(target_type, target_id, action, actor_id)
  values ('report', p_report_id, 'review:' || p_status, auth.uid());
end;
$$;

create or replace function public.moderate_content(
  p_target_type text,
  p_target_id uuid,
  p_action text,
  p_reason text default null,
  p_ban_user boolean default false,
  p_ban_until timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user uuid;
  next_status text;
begin
  if not public.is_admin() then
    raise exception 'NO_PERMISSION';
  end if;

  next_status := case p_action
    when 'fold' then 'folded'
    when 'delete' then 'deleted'
    when 'restore' then 'active'
    else null
  end;

  if next_status is null then
    raise exception 'BAD_ACTION';
  end if;

  if p_target_type = 'post' then
    select author_id into target_user from public.posts where id = p_target_id;
    update public.posts set status = next_status where id = p_target_id;
  elsif p_target_type = 'comment' then
    select author_id into target_user from public.comments where id = p_target_id;
    update public.comments set status = next_status where id = p_target_id;
  else
    raise exception 'BAD_TARGET';
  end if;

  if target_user is null then
    raise exception 'NOT_FOUND';
  end if;

  insert into public.moderation_actions(target_type, target_id, action, reason, actor_id)
  values (p_target_type, p_target_id, p_action, p_reason, auth.uid());

  insert into public.messages(user_id, kind, title, content)
  values (
    target_user,
    'moderation',
    '有一条内容被处理',
    coalesce(p_reason, '你的内容已被站点管理者处理。')
  );

  if p_ban_user then
    insert into public.bans(user_id, post_id, comment_id, until, reason, created_by)
    values (
      target_user,
      case when p_target_type = 'post' then p_target_id else null end,
      case when p_target_type = 'comment' then p_target_id else null end,
      coalesce(p_ban_until, now() + interval '7 days'),
      coalesce(p_reason, '违反社区规则'),
      auth.uid()
    );

    insert into public.messages(user_id, kind, title, content)
    values (target_user, 'ban', '账号已被暂时限制', coalesce(p_reason, '你暂时不能发布或回复。'));
  end if;
end;
$$;

create or replace function public.delete_own_content(
  p_target_type text,
  p_target_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_post_id uuid;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if p_target_type = 'post' then
    update public.posts
    set status = 'deleted'
    where id = p_target_id
      and author_id = auth.uid()
      and status <> 'deleted'
    returning id into affected_post_id;
  elsif p_target_type = 'comment' then
    update public.comments
    set status = 'deleted'
    where id = p_target_id
      and author_id = auth.uid()
      and status <> 'deleted'
    returning post_id into affected_post_id;

    if affected_post_id is not null then
      update public.posts
      set reply_count = greatest(reply_count - 1, 0)
      where id = affected_post_id;
    end if;
  else
    raise exception 'BAD_TARGET';
  end if;

  if affected_post_id is null then
    raise exception 'NO_PERMISSION';
  end if;
end;
$$;

create or replace function public.mark_message_read(p_message_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  update public.messages
  set read_at = coalesce(read_at, now())
  where id = p_message_id and user_id = auth.uid();
end;
$$;

create or replace function public.mark_all_messages_read()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  update public.messages
  set read_at = coalesce(read_at, now())
  where user_id = auth.uid() and read_at is null;
end;
$$;

create or replace function public.mark_message_unread(p_message_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  update public.messages
  set read_at = null
  where id = p_message_id and user_id = auth.uid();
end;
$$;

alter table public.profiles enable row level security;
alter table public.admins enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_participants enable row level security;
alter table public.favorites enable row level security;
alter table public.bans enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;
alter table public.moderation_actions enable row level security;

create policy "users can read own profile and admins can read all" on public.profiles
for select to authenticated using (user_id = auth.uid() or public.is_admin());

create policy "admins can read admin list" on public.admins
for select to authenticated using (user_id = auth.uid() or public.is_admin());

create policy "authenticated users can read visible posts" on public.posts
for select to authenticated using (status <> 'deleted' or public.is_admin());

create policy "authenticated users can read visible comments" on public.comments
for select to authenticated using (status <> 'deleted' or public.is_admin());

create policy "authenticated users can read participants" on public.post_participants
for select to authenticated using (
  exists (select 1 from public.posts where posts.id = post_id and (posts.status <> 'deleted' or public.is_admin()))
);

create policy "users can read own favorites and admins can read all" on public.favorites
for select to authenticated using (user_id = auth.uid() or public.is_admin());

create policy "admins can read bans and users can read own active bans" on public.bans
for select to authenticated using (public.is_admin() or user_id = auth.uid());

create policy "users can read own messages" on public.messages
for select to authenticated using (user_id = auth.uid() or public.is_admin());

create policy "users read own reports and admins read all" on public.reports
for select to authenticated using (user_id = auth.uid() or public.is_admin());

create policy "admins read moderation actions" on public.moderation_actions
for select to authenticated using (public.is_admin());

create index posts_created_at_idx on public.posts(created_at desc, id desc);
create index posts_search_idx on public.posts using gin(to_tsvector('simple', content));
create index comments_post_sequence_idx on public.comments(post_id, sequence);
create index comments_search_idx on public.comments using gin(to_tsvector('simple', content));
create index post_participants_user_idx on public.post_participants(user_id);
create index favorites_user_created_idx on public.favorites(user_id, created_at desc);
create index reports_status_created_idx on public.reports(status, created_at desc);
create index messages_user_created_idx on public.messages(user_id, created_at desc);
create index bans_user_until_idx on public.bans(user_id, until desc);
