-- Pilvesünkroon: Stuudiumi andmete krüpteeritud hetktõmmis (sama põhimõte kui chatil, server ei näe sisu).
create table if not exists public.snapshots (
  room text primary key check (char_length(room) = 64),
  iv text not null check (char_length(iv) <= 64),
  data text not null check (char_length(data) <= 4000000),
  updated_at timestamptz not null default now()
);
alter table public.snapshots enable row level security;
create policy "snap read" on public.snapshots for select using (true);
create policy "snap insert" on public.snapshots for insert with check (true);
create policy "snap update" on public.snapshots for update using (true) with check (true);
grant select, insert, update on public.snapshots to anon;
