alter table public.projects
  add column if not exists service_status text not null default 'active' check (service_status in ('active', 'past_due', 'suspended', 'canceled')),
  add column if not exists billing_status text not null default 'current' check (billing_status in ('current', 'past_due', 'unpaid', 'canceled')),
  add column if not exists next_billing_date date,
  add column if not exists last_payment_at timestamptz,
  add column if not exists suspended_at timestamptz,
  add column if not exists suspension_reason text;

update public.projects
set service_status = 'suspended'
where status = 'paused'
  and service_status = 'active';

update public.projects
set billing_status = 'past_due'
where expiration_date is not null
  and expiration_date < current_date
  and billing_status = 'current';

create table if not exists public.project_websites (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  client_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  domain text not null,
  website_url text,
  platform text,
  status text not null default 'active' check (status in ('active', 'maintenance', 'suspended', 'offline')),
  ssl_expires_at date,
  last_checked_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, domain)
);

create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  client_id uuid not null references auth.users(id) on delete cascade,
  stripe_invoice_id text,
  amount numeric(10,2) not null default 0,
  currency text not null default 'USD',
  status text not null default 'open' check (status in ('paid', 'past_due', 'failed', 'refunded', 'open')),
  due_date date,
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.internal_notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references auth.users(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  admin_id uuid not null references auth.users(id) on delete cascade,
  visibility text not null default 'internal' check (visibility in ('internal', 'client')),
  note text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_alerts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references auth.users(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  alert_type text not null,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  status text not null default 'open' check (status in ('open', 'resolved')),
  title text not null,
  message text,
  visible_to_client boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  resolved_by uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists project_websites_set_updated_at on public.project_websites;
create trigger project_websites_set_updated_at
before update on public.project_websites
for each row
execute function public.set_updated_at();

drop trigger if exists internal_notes_set_updated_at on public.internal_notes;
create trigger internal_notes_set_updated_at
before update on public.internal_notes
for each row
execute function public.set_updated_at();

drop trigger if exists admin_alerts_set_updated_at on public.admin_alerts;
create trigger admin_alerts_set_updated_at
before update on public.admin_alerts
for each row
execute function public.set_updated_at();

alter table public.project_websites enable row level security;
alter table public.billing_events enable row level security;
alter table public.internal_notes enable row level security;
alter table public.admin_alerts enable row level security;

drop policy if exists "project_websites read" on public.project_websites;
create policy "project_websites read"
on public.project_websites
for select
using (client_id = auth.uid() or public.current_user_is_admin());

drop policy if exists "project_websites admin mutate" on public.project_websites;
create policy "project_websites admin mutate"
on public.project_websites
for all
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "billing_events read" on public.billing_events;
create policy "billing_events read"
on public.billing_events
for select
using (client_id = auth.uid() or public.current_user_is_admin());

drop policy if exists "billing_events admin mutate" on public.billing_events;
create policy "billing_events admin mutate"
on public.billing_events
for all
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "internal_notes read" on public.internal_notes;
create policy "internal_notes read"
on public.internal_notes
for select
using (
  public.current_user_is_admin()
  or (visibility = 'client' and client_id = auth.uid())
);

drop policy if exists "internal_notes admin mutate" on public.internal_notes;
create policy "internal_notes admin mutate"
on public.internal_notes
for all
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "admin_alerts read" on public.admin_alerts;
create policy "admin_alerts read"
on public.admin_alerts
for select
using (
  public.current_user_is_admin()
  or (visible_to_client = true and client_id = auth.uid())
);

drop policy if exists "admin_alerts admin mutate" on public.admin_alerts;
create policy "admin_alerts admin mutate"
on public.admin_alerts
for all
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "testimonials own read" on public.testimonials;
create policy "testimonials own read"
on public.testimonials
for select
to authenticated
using (created_by = auth.uid());

drop policy if exists "testimonials client submit" on public.testimonials;
create policy "testimonials client submit"
on public.testimonials
for insert
to authenticated
with check (
  created_by = auth.uid()
  and active = false
  and is_featured = false
);

create index if not exists idx_projects_billing_status on public.projects (billing_status);
create index if not exists idx_projects_service_status on public.projects (service_status);
create index if not exists idx_projects_expiration_date on public.projects (expiration_date);
create index if not exists idx_projects_next_billing_date on public.projects (next_billing_date);

create index if not exists idx_project_websites_client_status on public.project_websites (client_id, status);
create index if not exists idx_project_websites_project on public.project_websites (project_id);

create index if not exists idx_billing_events_client_status_due on public.billing_events (client_id, status, due_date);
create index if not exists idx_billing_events_project on public.billing_events (project_id);

create index if not exists idx_internal_notes_client_created on public.internal_notes (client_id, created_at desc);
create index if not exists idx_internal_notes_project_created on public.internal_notes (project_id, created_at desc);

create index if not exists idx_admin_alerts_status_created on public.admin_alerts (status, created_at desc);
create index if not exists idx_admin_alerts_client_status on public.admin_alerts (client_id, status);

insert into public.admin_alerts (client_id, project_id, alert_type, severity, status, title, message, visible_to_client, metadata)
select
  p.client_id,
  p.id,
  'billing_past_due',
  'high',
  'open',
  'Project past due',
  concat('Project ', p.name, ' is marked as past due.'),
  false,
  jsonb_build_object('project_name', p.name)
from public.projects p
where p.billing_status = 'past_due'
  and not exists (
    select 1
    from public.admin_alerts a
    where a.project_id = p.id
      and a.alert_type = 'billing_past_due'
      and a.status = 'open'
  );
create unique index if not exists idx_billing_events_stripe_invoice_id on public.billing_events (stripe_invoice_id) where stripe_invoice_id is not null;
