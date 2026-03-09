create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row
execute function public.set_updated_at();

alter table public.site_settings enable row level security;

drop policy if exists "site_settings public read contact" on public.site_settings;
drop policy if exists "site_settings admin mutate" on public.site_settings;

create policy "site_settings public read contact"
on public.site_settings
for select
to anon, authenticated
using (key = 'contact_settings' or public.current_user_is_admin());

create policy "site_settings admin mutate"
on public.site_settings
for all
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

insert into public.site_settings (key, value)
values (
  'contact_settings',
  '{"method":"form","value":"","labelEn":"Contact Us","labelEs":"Contactanos","openInNewTab":false,"agencyEmail":"sales@youragency.com","agencyPhone":"+1-000-000-0000","locationEn":"United States","locationEs":"Estados Unidos"}'::jsonb
)
on conflict (key) do nothing;
