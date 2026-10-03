-- Pere punktiraamat: krüpteeritud kirjed (teenitud, kinnitatud, trahv, auhind). Rakendatud Levelup projektile.
create table if not exists public.ledger_entries (
  id uuid primary key,
  room text not null check (char_length(room) = 64),
  iv text not null check (char_length(iv) <= 64),
  data text not null check (char_length(data) <= 20000),
  created_at timestamptz not null default now()
);
create index if not exists ledger_entries_room_created on public.ledger_entries (room, created_at);
alter table public.ledger_entries enable row level security;
create policy "ledger read" on public.ledger_entries for select using (true);
create policy "ledger insert" on public.ledger_entries for insert with check (true);
revoke all on public.ledger_entries from anon, authenticated;
grant select, insert on public.ledger_entries to anon;
alter publication supabase_realtime add table public.ledger_entries;
