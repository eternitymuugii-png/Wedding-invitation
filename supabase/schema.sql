create table if not exists public.wedding_rsvps (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null
    check (char_length(btrim(guest_name)) between 1 and 120),
  attending boolean not null,
  created_at timestamptz not null default now()
);

alter table public.wedding_rsvps enable row level security;

revoke all on table public.wedding_rsvps from anon, authenticated;
grant insert (guest_name, attending) on table public.wedding_rsvps to anon;

drop policy if exists "Public guests can submit an RSVP"
  on public.wedding_rsvps;

create policy "Public guests can submit an RSVP"
  on public.wedding_rsvps
  for insert
  to anon
  with check (
    char_length(btrim(guest_name)) between 1 and 120
  );

comment on table public.wedding_rsvps is
  'Private wedding RSVP responses submitted by invitation guests.';
