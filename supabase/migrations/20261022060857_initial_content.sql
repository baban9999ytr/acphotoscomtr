begin;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create table public.authorized_admins (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table public.authorized_admins enable row level security;
revoke all on public.authorized_admins from anon,authenticated;
grant select on public.authorized_admins to authenticated;
revoke insert, update, delete on public.authorized_admins from anon, authenticated;
create policy own_authorization on public.authorized_admins for select to authenticated using (user_id=(select auth.uid()));
create function private.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.authorized_admins where user_id=auth.uid());
$$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon,authenticated;

create table public.categories (
 id uuid primary key default gen_random_uuid(), name text not null check(length(name) between 1 and 160),
 slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug)<=120), sort_order integer not null default 0,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.projects (
 id uuid primary key default gen_random_uuid(), title text not null check(length(title) between 1 and 160),
 slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug)<=120),
 description text not null default '' check(length(description)<=5000), category_id uuid references public.categories(id) on delete restrict,
 status text not null default 'draft' check(status in ('draft','published')), featured boolean not null default false,
 sort_order integer not null default 0, year text not null default '' check(year='' or year ~ '^[0-9]{4}$'), location text not null default '' check(length(location)<=160),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index projects_category_idx on public.projects(category_id);
create index projects_published_order_idx on public.projects(sort_order) where status='published';
create table public.project_images (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete restrict,
 alt text not null check(length(alt) between 1 and 160), paths text[] not null check(array_length(paths,1)=3),
 width integer not null check(width>0), height integer not null check(height>0), sort_order integer not null default 0,
 is_cover boolean not null default false, fingerprint text not null check(fingerprint ~ '^[a-f0-9]{64}$'), deleting boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(project_id,fingerprint)
);
create index project_images_project_order_idx on public.project_images(project_id,sort_order);
create unique index project_images_cover_idx on public.project_images(project_id) where is_cover;
create index project_images_paths_idx on public.project_images using gin(paths);
create table public.journal_posts (
 id uuid primary key default gen_random_uuid(), title text not null check(length(title) between 1 and 160),
 slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug)<=120),
 body text not null default '' check(length(body)<=50000),status text not null default 'draft' check(status in ('draft','published')),
 sort_order integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create index journal_published_order_idx on public.journal_posts(sort_order) where status='published';
create table public.site_settings (
 id text primary key check(id='main'), hero_title text not null check(length(hero_title) between 1 and 160),
 hero_description text not null default '' check(length(hero_description)<=500),about text not null default '' check(length(about)<=5000),
 phone text not null default '' check(phone='' or phone ~ '^\+[1-9][0-9]{7,14}$'),email text not null default '' check(length(email)<=254),
 instagram text not null default '' check(instagram='' or instagram ~ '^https://(www\.)?instagram\.com/[a-zA-Z0-9_.]+/?$'),
 seo_description text not null default '' check(length(seo_description)<=300), hero_image_id text not null default '',
 logo_text text not null default 'ACPhotos' check(length(logo_text) between 1 and 160),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
insert into public.site_settings(id,hero_title,hero_description,about,seo_description) values('main',E'Işığın izinde.\nAnın içinde.','Bir bakış, bir his, bir hikâye.','ACPhotos albümlerini keşfedin.','ACPhotos fotoğraf albümleri ve görsel hikâyeler.');
create function private.touch_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now(); return new; end; $$;
revoke all on function private.touch_updated_at() from public;
do $$ declare t text; begin foreach t in array array['categories','projects','project_images','journal_posts','site_settings'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon,authenticated',t);
 execute format('grant select, insert, update, delete on public.%I to authenticated',t);
 execute format('grant select on public.%I to anon',t);
 execute format('create policy admin_all on public.%I for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))',t);
 execute format('create trigger touch_updated_at before update on public.%I for each row execute function private.touch_updated_at()',t);
 end loop; end $$;
create policy public_categories on public.categories for select to anon,authenticated using (true);
create policy public_settings on public.site_settings for select to anon,authenticated using (true);
create policy published_projects on public.projects for select to anon,authenticated using(status='published');
create policy published_posts on public.journal_posts for select to anon,authenticated using(status='published');
create policy published_images on public.project_images for select to anon,authenticated using(not deleting and exists(select 1 from public.projects p where p.id=project_id and p.status='published'));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('photographs','photographs',false,20971520,array['image/webp']);
create policy photographs_admin on storage.objects for all to authenticated using(bucket_id='photographs' and (select private.is_admin())) with check(bucket_id='photographs' and (select private.is_admin()));
create policy photographs_published on storage.objects for select to anon,authenticated using(bucket_id='photographs' and exists(select 1 from public.project_images i join public.projects p on p.id=i.project_id where i.paths @> array[name] and not i.deleting and p.status='published'));

create function public.set_cover(image_id uuid) returns void language plpgsql security invoker set search_path='' as $$
 declare album_id uuid;
 begin
 if not private.is_admin() then raise exception 'Not authorized' using errcode='42501'; end if;
 select project_id into strict album_id from public.project_images where id=image_id and not deleting;
 perform 1 from public.projects where id=album_id for update;
 update public.project_images set is_cover=false where project_id=album_id and is_cover;
 update public.project_images set is_cover=true where id=image_id;
 end;
$$;
create function public.reorder_images(image_ids uuid[]) returns void language plpgsql security invoker set search_path='' as $$
 declare album_id uuid; total integer;
 begin
 if not private.is_admin() then raise exception 'Not authorized' using errcode='42501'; end if;
 if cardinality(image_ids)=0 then return; end if;
 select project_id into strict album_id from public.project_images where id=image_ids[1];
 perform 1 from public.projects where id=album_id for update;
 select count(*) into total from public.project_images where project_id=album_id;
 if total<>cardinality(image_ids) or total<>(select count(distinct x) from unnest(image_ids) x) or exists(select 1 from unnest(image_ids) x where not exists(select 1 from public.project_images i where i.id=x and i.project_id=album_id)) then raise exception 'Invalid image order'; end if;
 update public.project_images i set sort_order=s.n-1 from unnest(image_ids) with ordinality s(id,n) where i.id=s.id;
 end;
$$;
revoke all on function public.set_cover(uuid),public.reorder_images(uuid[]) from public,anon;
grant execute on function public.set_cover(uuid),public.reorder_images(uuid[]) to authenticated;
create function public.reorder_projects(project_ids uuid[]) returns void language plpgsql security invoker set search_path='' as $$
 begin
 if not private.is_admin() then raise exception 'Not authorized' using errcode='42501'; end if;
 lock table public.projects in share row exclusive mode;
 if cardinality(project_ids)<>(select count(*) from public.projects) or cardinality(project_ids)<>(select count(distinct x) from unnest(project_ids) x) or exists(select 1 from unnest(project_ids) x where not exists(select 1 from public.projects p where p.id=x)) then raise exception 'Invalid project order'; end if;
 update public.projects p set sort_order=s.n-1 from unnest(project_ids) with ordinality s(id,n) where p.id=s.id;
 end;
$$;
revoke all on function public.reorder_projects(uuid[]) from public,anon;
grant execute on function public.reorder_projects(uuid[]) to authenticated;
commit;
