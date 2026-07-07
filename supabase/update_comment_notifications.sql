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
  parent_author uuid;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  perform public.assert_not_banned();
  perform pg_advisory_xact_lock(hashtext(p_post_id::text));

  select author_id into post_author
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

  if post_author <> auth.uid() then
    insert into public.messages(user_id, kind, title, content, post_id, comment_id)
    values (post_author, 'reply', '你的树洞有新回复', '有人回复了你的树洞。', p_post_id, new_comment_id);
  end if;

  if parent_author is not null and parent_author <> auth.uid() and parent_author <> post_author then
    insert into public.messages(user_id, kind, title, content, post_id, comment_id)
    values (parent_author, 'reply', '你的回复有新回应', '有人回应了你的回复。', p_post_id, new_comment_id);
  end if;

  return new_comment_id;
end;
$$;
