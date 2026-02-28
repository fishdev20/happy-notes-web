-- Sync Supabase auth users into public.user_profiles.
create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles ("id", "email", "displayName", "avatarUrl")
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict ("id") do update
  set
    "email" = excluded."email",
    "displayName" = coalesce(excluded."displayName", public.user_profiles."displayName"),
    "avatarUrl" = coalesce(excluded."avatarUrl", public.user_profiles."avatarUrl"),
    "updatedAt" = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_auth_user_created();

-- Helper function for collaboration-aware access checks.
create or replace function public.user_can_access_note(target_note_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.notes n
    where n."id" = target_note_id
      and (
        n."ownerId" = auth.uid()
        or exists (
          select 1
          from public.note_members m
          where m."noteId" = n."id"
            and m."userId" = auth.uid()
        )
      )
  );
$$;

-- Enable RLS.
alter table public.user_profiles enable row level security;
alter table public.notes enable row level security;
alter table public.tags enable row level security;
alter table public.note_tags enable row level security;
alter table public.saved_views enable row level security;
alter table public.note_members enable row level security;
alter table public.share_links enable row level security;
alter table public.note_versions enable row level security;

-- user_profiles policies.
drop policy if exists "profiles_select_own" on public.user_profiles;
create policy "profiles_select_own"
on public.user_profiles
for select
using ("id" = auth.uid());

drop policy if exists "profiles_insert_own" on public.user_profiles;
create policy "profiles_insert_own"
on public.user_profiles
for insert
with check ("id" = auth.uid());

drop policy if exists "profiles_update_own" on public.user_profiles;
create policy "profiles_update_own"
on public.user_profiles
for update
using ("id" = auth.uid())
with check ("id" = auth.uid());

-- notes policies.
drop policy if exists "notes_select_access" on public.notes;
create policy "notes_select_access"
on public.notes
for select
using (public.user_can_access_note("id"));

drop policy if exists "notes_insert_owner" on public.notes;
create policy "notes_insert_owner"
on public.notes
for insert
with check ("ownerId" = auth.uid());

drop policy if exists "notes_update_owner_or_editor" on public.notes;
create policy "notes_update_owner_or_editor"
on public.notes
for update
using (
  "ownerId" = auth.uid()
  or exists (
    select 1
    from public.note_members m
    where m."noteId" = "id"
      and m."userId" = auth.uid()
      and m."role" in ('OWNER', 'EDITOR')
  )
)
with check (
  "ownerId" = auth.uid()
  or exists (
    select 1
    from public.note_members m
    where m."noteId" = "id"
      and m."userId" = auth.uid()
      and m."role" in ('OWNER', 'EDITOR')
  )
);

drop policy if exists "notes_delete_owner" on public.notes;
create policy "notes_delete_owner"
on public.notes
for delete
using ("ownerId" = auth.uid());

-- tags policies.
drop policy if exists "tags_owner_all" on public.tags;
create policy "tags_owner_all"
on public.tags
for all
using ("ownerId" = auth.uid())
with check ("ownerId" = auth.uid());

-- note_tags policies.
drop policy if exists "note_tags_select_access" on public.note_tags;
create policy "note_tags_select_access"
on public.note_tags
for select
using (public.user_can_access_note("noteId"));

drop policy if exists "note_tags_insert_owner_or_editor" on public.note_tags;
create policy "note_tags_insert_owner_or_editor"
on public.note_tags
for insert
with check (
  public.user_can_access_note("noteId")
  and exists (
    select 1
    from public.tags t
    where t."id" = "tagId"
      and t."ownerId" = auth.uid()
  )
);

drop policy if exists "note_tags_delete_owner_or_editor" on public.note_tags;
create policy "note_tags_delete_owner_or_editor"
on public.note_tags
for delete
using (public.user_can_access_note("noteId"));

-- saved_views policies.
drop policy if exists "saved_views_owner_all" on public.saved_views;
create policy "saved_views_owner_all"
on public.saved_views
for all
using ("ownerId" = auth.uid())
with check ("ownerId" = auth.uid());

-- note_members policies.
drop policy if exists "note_members_select_access" on public.note_members;
create policy "note_members_select_access"
on public.note_members
for select
using (public.user_can_access_note("noteId"));

drop policy if exists "note_members_owner_manage" on public.note_members;
create policy "note_members_owner_manage"
on public.note_members
for all
using (
  exists (
    select 1
    from public.notes n
    where n."id" = "noteId"
      and n."ownerId" = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.notes n
    where n."id" = "noteId"
      and n."ownerId" = auth.uid()
  )
);

-- share_links policies.
drop policy if exists "share_links_owner_manage" on public.share_links;
create policy "share_links_owner_manage"
on public.share_links
for all
using (
  exists (
    select 1
    from public.notes n
    where n."id" = "noteId"
      and n."ownerId" = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.notes n
    where n."id" = "noteId"
      and n."ownerId" = auth.uid()
  )
);

-- note_versions policies.
drop policy if exists "note_versions_select_access" on public.note_versions;
create policy "note_versions_select_access"
on public.note_versions
for select
using (public.user_can_access_note("noteId"));

drop policy if exists "note_versions_insert_owner_or_editor" on public.note_versions;
create policy "note_versions_insert_owner_or_editor"
on public.note_versions
for insert
with check (
  public.user_can_access_note("noteId")
  and ("authorId" is null or "authorId" = auth.uid())
);
