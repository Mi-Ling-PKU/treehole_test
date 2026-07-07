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
