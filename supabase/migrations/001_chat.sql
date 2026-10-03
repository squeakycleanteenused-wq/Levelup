-- Vanemate chat: server hoiab ainult krüpteeritud sõnumeid (AES-GCM, võti tuleb parooli põhjal seadmes).
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room text not null check (char_length(room) = 64),          -- parooli põhjal tuletatud ruumi id (hex)
  iv text not null check (char_length(iv) <= 64),
  data text not null check (char_length(data) <= 20000),       -- krüptitud sisu (nimi + tekst)
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_room_created on public.chat_messages (room, created_at);

alter table public.chat_messages enable row level security;

-- Ilma sisselogimiseta lugemine ja lisamine: sisu on krüptitud, ruumi id'd ei saa parooli teadmata ära arvata.
create policy "chat read" on public.chat_messages for select using (true);
create policy "chat insert" on public.chat_messages for insert with check (true);
-- Uuendamist ja kustutamist ei lubata.

alter publication supabase_realtime add table public.chat_messages;
