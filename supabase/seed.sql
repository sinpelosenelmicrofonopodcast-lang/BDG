insert into public.plans (slug, name, category, billing_type, price_min, price_max, description, features, is_popular, active)
values
  (
    'starter-landing',
    'Starter Landing',
    'project',
    'one_time',
    499,
    899,
    '1-page conversion landing for quick launch.',
    '["1 page","WhatsApp","Form","Basic SEO","Responsive","Basic tracking"]'::jsonb,
    false,
    true
  ),
  (
    'business-website',
    'Business Website',
    'project',
    'one_time',
    1499,
    2999,
    'Professional website for established service businesses.',
    '["5-8 pages","SEO","Performance","Optional blog","Analytics"]'::jsonb,
    true,
    true
  ),
  (
    'small-business-quote',
    'Small Business Custom',
    'project',
    'quote_only',
    0,
    0,
    'Flexible quote plan for small businesses based on real scope.',
    '["Scope by need","Phased roadmap","Conversion-first approach","Modular execution"]'::jsonb,
    false,
    true
  ),
  (
    'growth-system',
    'Growth System',
    'project',
    'one_time',
    3500,
    6500,
    'Growth-focused stack with automation and dashboards.',
    '["Premium web","Booking","Simple CRM","Automations","Basic dashboard"]'::jsonb,
    false,
    true
  ),
  (
    'app-platform',
    'App Platform',
    'project',
    'one_time',
    4000,
    10000,
    'App platform with auth, roles, payments and integrations.',
    '["Login","Roles","Admin dashboard","Payments","Integrations"]'::jsonb,
    false,
    true
  ),
  (
    'enterprise',
    'Enterprise',
    'project',
    'quote_only',
    10000,
    0,
    'Enterprise architecture and custom roadmap.',
    '["Custom scope","Dedicated architecture","Priority support"]'::jsonb,
    false,
    true
  ),
  (
    'care-plan',
    'Care Plan',
    'retainer',
    'subscription',
    149,
    149,
    'Monthly maintenance and preventive support.',
    '["Maintenance","Backups","Monthly support"]'::jsonb,
    true,
    true
  ),
  (
    'seo-growth',
    'SEO Growth',
    'retainer',
    'subscription',
    399,
    799,
    'SEO and content growth retainer.',
    '["Technical SEO","Content","Monthly report"]'::jsonb,
    false,
    true
  ),
  (
    'automation-crm',
    'Automation CRM',
    'retainer',
    'subscription',
    699,
    1500,
    'CRM and automation workflows for pipeline velocity.',
    '["CRM setup","Automation flows","Pipeline optimization"]'::jsonb,
    false,
    true
  )
on conflict (slug) do update
set
  name = excluded.name,
  category = excluded.category,
  billing_type = excluded.billing_type,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  description = excluded.description,
  features = excluded.features,
  is_popular = excluded.is_popular,
  active = excluded.active,
  updated_at = now();

insert into public.addons (slug, name, billing_type, price_min, price_max, description, active)
values
  ('seo-pro', 'SEO Pro', 'one_time', 300, 800, 'Advanced SEO implementation.', true),
  ('blog', 'Blog', 'one_time', 200, 500, 'Blog setup and structure.', true),
  ('booking-system', 'Booking System', 'one_time', 300, 900, 'Appointment scheduling module.', true),
  ('payments-stripe', 'Payments Stripe', 'one_time', 300, 700, 'Stripe checkout and billing setup.', true),
  ('admin-dashboard', 'Admin Dashboard', 'one_time', 500, 1500, 'Operations and KPI dashboard.', true),
  ('whatsapp-automation', 'WhatsApp Automation', 'one_time', 200, 600, 'Automated WhatsApp flows.', true),
  ('social-integrations', 'Social Integrations', 'one_time', 150, 400, 'Instagram/Facebook integrations.', true),
  ('user-accounts', 'User Accounts', 'one_time', 600, 1500, 'Auth and user profile module.', true),
  ('pwa-app', 'PWA App', 'one_time', 500, 1200, 'Progressive Web App support.', true),
  ('hosting-managed', 'Hosting Managed', 'subscription', 20, 80, 'Managed hosting and uptime checks.', true)
on conflict (slug) do update
set
  name = excluded.name,
  billing_type = excluded.billing_type,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  description = excluded.description,
  active = excluded.active,
  updated_at = now();
