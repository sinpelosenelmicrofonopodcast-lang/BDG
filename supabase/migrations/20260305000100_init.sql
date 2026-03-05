create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'client');
create type public.plan_category as enum ('project', 'retainer');
create type public.plan_billing_type as enum ('one_time', 'subscription', 'quote_only');
create type public.addon_billing_type as enum ('one_time', 'subscription');
create type public.project_status as enum ('draft', 'active', 'in_review', 'completed', 'paused');
create type public.ticket_type as enum ('bug', 'change_request', 'question', 'addon_request');
create type public.ticket_status as enum ('open', 'in_progress', 'resolved', 'closed');
create type public.ticket_priority as enum ('low', 'medium', 'high');
create type public.quote_request_status as enum ('new', 'qualified', 'quoted', 'archived');
create type public.quote_status as enum ('draft', 'sent', 'accepted', 'rejected', 'expired');
create type public.entitlement_status as enum ('active', 'expired', 'canceled');
create type public.addon_request_status as enum ('pending', 'approved', 'rejected', 'in_progress');
create type public.lead_status as enum ('new', 'contacted', 'qualified', 'won', 'lost');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  company_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category public.plan_category not null,
  billing_type public.plan_billing_type not null,
  price_min numeric(10,2) not null default 0,
  price_max numeric(10,2) not null default 0,
  currency text not null default 'USD',
  description text,
  features jsonb not null default '[]'::jsonb,
  is_popular boolean not null default false,
  active boolean not null default true,
  stripe_price_id text,
  stripe_product_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.addons (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  billing_type public.addon_billing_type not null,
  price_min numeric(10,2) not null default 0,
  price_max numeric(10,2) not null default 0,
  currency text not null default 'USD',
  description text,
  active boolean not null default true,
  stripe_price_id text,
  stripe_product_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null,
  name text not null,
  status public.project_status not null default 'draft',
  start_date date,
  due_date date,
  timeline jsonb not null default '{}'::jsonb,
  total_price numeric(10,2),
  expiration_date date,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  addon_id uuid references public.addons(id) on delete set null,
  type public.addon_billing_type not null,
  status public.entitlement_status not null default 'active',
  starts_at date not null default current_date,
  expires_at date,
  created_at timestamptz not null default now()
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  client_id uuid not null references auth.users(id) on delete cascade,
  type public.ticket_type not null,
  status public.ticket_status not null default 'open',
  priority public.ticket_priority not null default 'medium',
  subject text not null,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references public.tickets(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid references auth.users(id) on delete set null,
  body text not null,
  is_admin_message boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  ticket_id uuid references public.tickets(id) on delete set null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  bucket text not null,
  path text not null,
  mime_type text,
  file_size bigint,
  created_at timestamptz not null default now()
);

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  budget numeric(10,2) not null,
  industry text not null,
  needs text[] not null default array[]::text[],
  business_name text not null,
  email text not null,
  phone text not null,
  notes text,
  status public.quote_request_status not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid references public.quote_requests(id) on delete set null,
  client_id uuid references auth.users(id) on delete set null,
  plan_id uuid references public.plans(id) on delete set null,
  status public.quote_status not null default 'draft',
  recommended_plan text not null,
  timeline text not null,
  addons jsonb not null default '[]'::jsonb,
  subtotal numeric(10,2) not null,
  addons_total numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  deposit_required numeric(10,2) not null,
  currency text not null default 'USD',
  expires_at timestamptz,
  payment_unlocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_documents (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  storage_path text not null,
  public_url text,
  version integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.quote_acceptances (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  typed_name text not null,
  accepted_at timestamptz not null default now(),
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.addon_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  client_id uuid not null references auth.users(id) on delete cascade,
  addon_id uuid not null references public.addons(id) on delete cascade,
  notes text,
  status public.addon_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  source text not null default 'website',
  notes text,
  status public.lead_status not null default 'new',
  created_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger plans_set_updated_at
before update on public.plans
for each row
execute function public.set_updated_at();

create trigger addons_set_updated_at
before update on public.addons
for each row
execute function public.set_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

create trigger tickets_set_updated_at
before update on public.tickets
for each row
execute function public.set_updated_at();

create trigger quotes_set_updated_at
before update on public.quotes
for each row
execute function public.set_updated_at();

create trigger addon_requests_set_updated_at
before update on public.addon_requests
for each row
execute function public.set_updated_at();

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'client')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.plans enable row level security;
alter table public.addons enable row level security;
alter table public.projects enable row level security;
alter table public.entitlements enable row level security;
alter table public.tickets enable row level security;
alter table public.messages enable row level security;
alter table public.files enable row level security;
alter table public.quote_requests enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_documents enable row level security;
alter table public.quote_acceptances enable row level security;
alter table public.addon_requests enable row level security;
alter table public.admin_audit_log enable row level security;
alter table public.leads enable row level security;

create policy "profiles self read"
on public.profiles
for select
using (auth.uid() = id or public.current_user_is_admin());

create policy "profiles self update"
on public.profiles
for update
using (auth.uid() = id or public.current_user_is_admin())
with check (auth.uid() = id or public.current_user_is_admin());

create policy "profiles self insert"
on public.profiles
for insert
with check (auth.uid() = id or public.current_user_is_admin());

create policy "user_roles select own"
on public.user_roles
for select
using (user_id = auth.uid() or public.current_user_is_admin());

create policy "user_roles admin mutate"
on public.user_roles
for all
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "plans public read"
on public.plans
for select
using (active = true or public.current_user_is_admin());

create policy "plans admin mutate"
on public.plans
for all
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "addons public read"
on public.addons
for select
using (active = true or public.current_user_is_admin());

create policy "addons admin mutate"
on public.addons
for all
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "projects client read"
on public.projects
for select
using (client_id = auth.uid() or public.current_user_is_admin());

create policy "projects admin mutate"
on public.projects
for all
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "entitlements read by ownership"
on public.entitlements
for select
using (
  public.current_user_is_admin()
  or exists (
    select 1
    from public.projects p
    where p.id = entitlements.project_id
      and p.client_id = auth.uid()
  )
);

create policy "entitlements admin mutate"
on public.entitlements
for all
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "tickets read"
on public.tickets
for select
using (client_id = auth.uid() or public.current_user_is_admin());

create policy "tickets insert"
on public.tickets
for insert
with check (client_id = auth.uid() or public.current_user_is_admin());

create policy "tickets update"
on public.tickets
for update
using (client_id = auth.uid() or public.current_user_is_admin())
with check (client_id = auth.uid() or public.current_user_is_admin());

create policy "messages read"
on public.messages
for select
using (
  sender_id = auth.uid()
  or recipient_id = auth.uid()
  or public.current_user_is_admin()
  or (
    project_id is not null
    and exists (
      select 1
      from public.projects p
      where p.id = messages.project_id
        and p.client_id = auth.uid()
    )
  )
);

create policy "messages insert"
on public.messages
for insert
with check (sender_id = auth.uid() or public.current_user_is_admin());

create policy "files read"
on public.files
for select
using (
  owner_id = auth.uid()
  or public.current_user_is_admin()
  or (
    project_id is not null
    and exists (
      select 1
      from public.projects p
      where p.id = files.project_id
        and p.client_id = auth.uid()
    )
  )
);

create policy "files insert"
on public.files
for insert
with check (owner_id = auth.uid() or public.current_user_is_admin());

create policy "quote_requests public insert"
on public.quote_requests
for insert
to anon, authenticated
with check (true);

create policy "quote_requests admin read"
on public.quote_requests
for select
using (public.current_user_is_admin());

create policy "quote_requests admin update"
on public.quote_requests
for update
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "quotes read"
on public.quotes
for select
using (client_id = auth.uid() or public.current_user_is_admin());

create policy "quotes admin mutate"
on public.quotes
for all
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "quote_documents read"
on public.quote_documents
for select
using (
  public.current_user_is_admin()
  or exists (
    select 1
    from public.quotes q
    where q.id = quote_documents.quote_id
      and q.client_id = auth.uid()
  )
);

create policy "quote_documents admin mutate"
on public.quote_documents
for all
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "quote_acceptances insert"
on public.quote_acceptances
for insert
to anon, authenticated
with check (true);

create policy "quote_acceptances read"
on public.quote_acceptances
for select
using (
  public.current_user_is_admin()
  or exists (
    select 1
    from public.quotes q
    where q.id = quote_acceptances.quote_id
      and q.client_id = auth.uid()
  )
);

create policy "addon_requests read"
on public.addon_requests
for select
using (client_id = auth.uid() or public.current_user_is_admin());

create policy "addon_requests insert"
on public.addon_requests
for insert
with check (client_id = auth.uid() or public.current_user_is_admin());

create policy "addon_requests update"
on public.addon_requests
for update
using (client_id = auth.uid() or public.current_user_is_admin())
with check (client_id = auth.uid() or public.current_user_is_admin());

create policy "admin_audit_log admin only"
on public.admin_audit_log
for all
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "leads public insert"
on public.leads
for insert
to anon, authenticated
with check (true);

create policy "leads admin read"
on public.leads
for select
using (public.current_user_is_admin());

create policy "leads admin update"
on public.leads
for update
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

insert into storage.buckets (id, name, public)
values ('client-assets', 'client-assets', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('quote-documents', 'quote-documents', true)
on conflict (id) do nothing;


create policy "client assets upload own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'client-assets'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "client assets read own folder"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'client-assets'
  and (
    auth.uid()::text = (storage.foldername(name))[1]
    or public.current_user_is_admin()
  )
);

create policy "quote docs public read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'quote-documents');

create policy "quote docs admin upload"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'quote-documents' and public.current_user_is_admin());
