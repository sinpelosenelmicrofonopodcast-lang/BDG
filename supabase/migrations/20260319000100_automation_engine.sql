create table if not exists public.auto_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Automation post',
  content text not null,
  content_type text not null default 'educational' check (content_type in ('educational', 'sales', 'video_script')),
  platform text not null default 'multi-platform',
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'posted', 'simulated')),
  scheduled_at timestamptz,
  performance_score integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.auto_posts
  alter column content set not null;

drop trigger if exists auto_posts_set_updated_at on public.auto_posts;
create trigger auto_posts_set_updated_at
before update on public.auto_posts
for each row
execute function public.set_updated_at();

alter table public.auto_posts enable row level security;

drop policy if exists "auto_posts user or admin read" on public.auto_posts;
create policy "auto_posts user or admin read"
on public.auto_posts
for select
using (auth.uid() = user_id or public.current_user_is_admin());

drop policy if exists "auto_posts admin mutate" on public.auto_posts;
create policy "auto_posts admin mutate"
on public.auto_posts
for all
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create index if not exists idx_auto_posts_user_schedule on public.auto_posts (user_id, scheduled_at desc);
create index if not exists idx_auto_posts_user_status on public.auto_posts (user_id, status);

alter table public.automation_settings
  alter column social_account_id drop not null;

alter table public.automation_settings
  drop constraint if exists automation_settings_provider_check;

alter table public.automation_settings
  add constraint automation_settings_provider_check
  check (provider in ('facebook', 'automation_engine'));

alter table public.automation_settings
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists auto_post_enabled boolean not null default false,
  add column if not exists auto_dm_enabled boolean not null default false,
  add column if not exists auto_reply_enabled boolean not null default false,
  add column if not exists preferred_platforms jsonb not null default '["instagram","facebook","tiktok","x"]'::jsonb,
  add column if not exists preferred_schedule_times jsonb not null default '["08:30","11:45","15:15","18:30"]'::jsonb,
  add column if not exists auto_reply_message text not null default 'Hey there. BDG can automate your business, check this out: https://bdg.lat',
  add column if not exists auto_dm_message text not null default 'Hey there. BDG can automate your business, check this out: https://bdg.lat',
  add column if not exists simulate_posting boolean not null default true;

create unique index if not exists idx_automation_settings_provider_user
on public.automation_settings (provider, user_id)
where provider = 'automation_engine' and user_id is not null;
