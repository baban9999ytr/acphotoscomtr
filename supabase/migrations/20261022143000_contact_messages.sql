begin;

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (
    char_length(email) between 3 and 254
    and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  message text not null check (char_length(message) between 10 and 4000),
  created_at timestamptz not null default now()
);

create index contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from public, anon, authenticated;
grant select on public.contact_messages to authenticated;
create policy contact_messages_admin_read
  on public.contact_messages
  for select to authenticated
  using ((select private.is_admin()));

create function public.submit_contact_message(
  p_name text,
  p_email text,
  p_message text,
  p_website text default ''
) returns boolean
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  clean_name text := btrim(coalesce(p_name, ''));
  clean_email text := lower(btrim(coalesce(p_email, '')));
  clean_message text := btrim(coalesce(p_message, ''));
begin
  -- Silently discard common bot submissions through the hidden honeypot.
  if btrim(coalesce(p_website, '')) <> '' then
    return false;
  end if;

  if char_length(clean_name) not between 2 and 100
    or char_length(clean_email) not between 3 and 254
    or clean_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or char_length(clean_message) not between 10 and 4000 then
    raise exception 'Invalid contact form input' using errcode = '22023';
  end if;

  -- Serialize submissions for the same address and limit accidental repeats.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(clean_email, 0)
  );
  if exists (
    select 1 from public.contact_messages
    where email = clean_email
      and created_at > now() - interval '1 minute'
  ) then
    return false;
  end if;

  insert into public.contact_messages (name, email, message)
  values (clean_name, clean_email, clean_message);
  return true;
end;
$$;

revoke all on function public.submit_contact_message(text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.submit_contact_message(text, text, text, text)
  to anon, authenticated;

commit;
