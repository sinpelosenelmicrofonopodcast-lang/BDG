create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  company_name text,
  company_role text,
  quote_en text,
  quote_es text,
  sort_order integer not null default 100,
  is_featured boolean not null default true,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint testimonials_quote_present check (
    coalesce(nullif(trim(quote_en), ''), nullif(trim(quote_es), '')) is not null
  )
);

drop trigger if exists testimonials_set_updated_at on public.testimonials;

create trigger testimonials_set_updated_at
before update on public.testimonials
for each row
execute function public.set_updated_at();

alter table public.testimonials enable row level security;

drop policy if exists "testimonials public read" on public.testimonials;
drop policy if exists "testimonials admin mutate" on public.testimonials;

create policy "testimonials public read"
on public.testimonials
for select
to anon, authenticated
using (active = true and is_featured = true);

create policy "testimonials admin mutate"
on public.testimonials
for all
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());
