-- Rakendatud Levelup projektile: anon tohib chatis ainult lugeda ja lisada, sünkroonis lugeda, lisada ja uuendada.
revoke all on public.chat_messages from anon, authenticated;
grant usage on schema public to anon;
grant select, insert on public.chat_messages to anon;

revoke all on public.snapshots from anon, authenticated;
grant select, insert, update on public.snapshots to anon;
