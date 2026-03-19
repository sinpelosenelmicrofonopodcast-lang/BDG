create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'facebook' check (provider in ('facebook')),
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  facebook_user_id text,
  facebook_page_id text,
  page_name text,
  access_token_encrypted text,
  token_type text,
  scopes text[] not null default array[]::text[],
  token_last_validated_at timestamptz,
  token_expires_at timestamptz,
  connection_status text not null default 'disconnected' check (connection_status in ('disconnected', 'connected', 'reconnect_required', 'error')),
  reconnect_required boolean not null default false,
  last_error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, admin_user_id)
);

create table if not exists public.social_pages (
  id uuid primary key default gen_random_uuid(),
  social_account_id uuid not null references public.social_accounts(id) on delete cascade,
  provider text not null default 'facebook' check (provider in ('facebook')),
  facebook_page_id text not null,
  page_name text not null,
  access_token_encrypted text not null,
  token_type text,
  scopes text[] not null default array[]::text[],
  tasks jsonb not null default '[]'::jsonb,
  is_selected boolean not null default false,
  connection_status text not null default 'connected' check (connection_status in ('connected', 'reconnect_required', 'error')),
  reconnect_required boolean not null default false,
  token_last_validated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (social_account_id, facebook_page_id)
);

create table if not exists public.social_post_templates (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'facebook' check (provider in ('facebook')),
  slug text not null unique,
  title text not null,
  category text not null,
  hook text not null,
  problem text not null,
  solution text not null,
  necessity text not null,
  cta text not null,
  short_copy text not null,
  medium_copy text not null,
  long_copy text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  bucket text not null,
  path text not null,
  mime_type text,
  file_size bigint,
  title text,
  alt_text text,
  width integer,
  height integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'facebook' check (provider in ('facebook')),
  social_account_id uuid not null references public.social_accounts(id) on delete cascade,
  social_page_id uuid not null references public.social_pages(id) on delete cascade,
  template_id uuid references public.social_post_templates(id) on delete set null,
  media_asset_id uuid references public.media_assets(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  caption text not null,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'publishing', 'published', 'failed', 'paused', 'canceled')),
  scheduled_for timestamptz,
  published_at timestamptz,
  facebook_post_id text,
  error_message text,
  is_automated boolean not null default false,
  cta_used text,
  timezone text not null default 'America/Chicago',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_post_logs (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.social_posts(id) on delete cascade,
  social_account_id uuid references public.social_accounts(id) on delete cascade,
  action text not null,
  status text not null default 'info' check (status in ('info', 'success', 'warning', 'error')),
  message text not null,
  provider_response jsonb not null default '{}'::jsonb,
  retry_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.automation_settings (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'facebook' check (provider in ('facebook')),
  social_account_id uuid not null unique references public.social_accounts(id) on delete cascade,
  enabled boolean not null default false,
  daily_posts_count integer not null default 1 check (daily_posts_count between 1 and 10),
  timezone text not null default 'America/Chicago',
  scheduled_times jsonb not null default '["09:00"]'::jsonb,
  use_images boolean not null default true,
  content_categories text[] not null default array[]::text[],
  rotate_templates boolean not null default true,
  avoid_repeat_template boolean not null default true,
  aggressive_cta_enabled boolean not null default true,
  cta_label text not null default 'Request a demo',
  cta_url text not null default '/contact',
  tone text not null default 'premium',
  offer text,
  market text,
  urgency_level text not null default 'high',
  includes_demo boolean not null default true,
  active_services jsonb not null default '[]'::jsonb,
  last_automation_run_at timestamptz,
  last_successful_post_at timestamptz,
  pause_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists social_accounts_set_updated_at on public.social_accounts;
create trigger social_accounts_set_updated_at
before update on public.social_accounts
for each row
execute function public.set_updated_at();

drop trigger if exists social_pages_set_updated_at on public.social_pages;
create trigger social_pages_set_updated_at
before update on public.social_pages
for each row
execute function public.set_updated_at();

drop trigger if exists social_post_templates_set_updated_at on public.social_post_templates;
create trigger social_post_templates_set_updated_at
before update on public.social_post_templates
for each row
execute function public.set_updated_at();

drop trigger if exists media_assets_set_updated_at on public.media_assets;
create trigger media_assets_set_updated_at
before update on public.media_assets
for each row
execute function public.set_updated_at();

drop trigger if exists social_posts_set_updated_at on public.social_posts;
create trigger social_posts_set_updated_at
before update on public.social_posts
for each row
execute function public.set_updated_at();

drop trigger if exists automation_settings_set_updated_at on public.automation_settings;
create trigger automation_settings_set_updated_at
before update on public.automation_settings
for each row
execute function public.set_updated_at();

alter table public.social_accounts enable row level security;
alter table public.social_pages enable row level security;
alter table public.social_post_templates enable row level security;
alter table public.media_assets enable row level security;
alter table public.social_posts enable row level security;
alter table public.social_post_logs enable row level security;
alter table public.automation_settings enable row level security;

drop policy if exists "social_accounts admin only" on public.social_accounts;
create policy "social_accounts admin only"
on public.social_accounts
for all
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "social_pages admin only" on public.social_pages;
create policy "social_pages admin only"
on public.social_pages
for all
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "social_post_templates admin read" on public.social_post_templates;
create policy "social_post_templates admin read"
on public.social_post_templates
for select
using (public.current_user_is_admin());

drop policy if exists "social_post_templates admin mutate" on public.social_post_templates;
create policy "social_post_templates admin mutate"
on public.social_post_templates
for all
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "media_assets admin only" on public.media_assets;
create policy "media_assets admin only"
on public.media_assets
for all
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "social_posts admin only" on public.social_posts;
create policy "social_posts admin only"
on public.social_posts
for all
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "social_post_logs admin only" on public.social_post_logs;
create policy "social_post_logs admin only"
on public.social_post_logs
for all
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "automation_settings admin only" on public.automation_settings;
create policy "automation_settings admin only"
on public.automation_settings
for all
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create index if not exists idx_social_accounts_provider_status on public.social_accounts (provider, connection_status);
create index if not exists idx_social_pages_account_selected on public.social_pages (social_account_id, is_selected);
create index if not exists idx_social_templates_provider_category on public.social_post_templates (provider, category) where active = true;
create index if not exists idx_media_assets_owner_created on public.media_assets (owner_id, created_at desc);
create index if not exists idx_social_posts_page_status_schedule on public.social_posts (social_page_id, status, scheduled_for);
create index if not exists idx_social_posts_account_created on public.social_posts (social_account_id, created_at desc);
create index if not exists idx_social_post_logs_post_created on public.social_post_logs (post_id, created_at desc);

insert into storage.buckets (id, name, public)
values ('social-media', 'social-media', false)
on conflict (id) do nothing;

drop policy if exists "social media admin upload" on storage.objects;
create policy "social media admin upload"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'social-media' and public.current_user_is_admin());

drop policy if exists "social media admin read" on storage.objects;
create policy "social media admin read"
on storage.objects
for select
to authenticated
using (bucket_id = 'social-media' and public.current_user_is_admin());

insert into public.social_post_templates (
  slug,
  title,
  category,
  hook,
  problem,
  solution,
  necessity,
  cta,
  short_copy,
  medium_copy,
  long_copy
)
values
  (
    'automation-stop-losing-leads',
    'Stop losing leads',
    'lead-generation',
    '{{brand_name}} sees local businesses lose leads every day.',
    'Messages arrive, nobody follows up fast enough, and the customer buys somewhere else.',
    '{{brand_name}} builds one system for lead capture, instant replies and follow-up.',
    'If your business still depends on manual replies, you are paying for growth leaks every week.',
    '{{cta}}',
    '{{brand_name}} helps you stop losing leads with instant follow-up and one dashboard. {{cta}}',
    'Most local businesses do not need more traffic first. They need a better system. {{brand_name}} centralizes leads, replies and follow-up so every inquiry moves faster and converts better. {{cta}}',
    'Every week a local business pays for ads, gets messages and still loses the sale because the process is manual. {{brand_name}} turns that chaos into a system: capture the lead, reply fast, track the conversation and move the prospect toward the next step from one dashboard. If you want consistent demand without living in your inbox, {{cta}}'
  ),
  (
    'automation-phone-prison',
    'Leave the phone prison',
    'automation',
    'Stop running your business from notifications.',
    'When every sale depends on answering messages all day, growth stalls and operations become exhausting.',
    '{{brand_name}} automates responses, bookings and lead routing so your team can work, not chase chats.',
    'The longer you stay glued to the phone, the harder it is to scale profitably.',
    '{{cta}}',
    'Leave the phone prison. {{brand_name}} automates replies, bookings and follow-up. {{cta}}',
    'If your business only moves when someone is watching WhatsApp, Instagram and Facebook all day, you do not have a system. {{brand_name}} helps local teams automate customer flow and regain control. {{cta}}',
    'A business that depends on constant manual replies feels busy but stays fragile. {{brand_name}} turns scattered messages into an organized operating system with automation, bookings and visibility from one dashboard. That means fewer missed opportunities and more room to grow without burnout. {{cta}}'
  ),
  (
    'automation-daily-demand',
    'Daily demand system',
    'automation',
    'Growth should not depend on random good days.',
    'Without a repeatable acquisition system, some weeks look full and others look empty.',
    '{{brand_name}} creates daily demand systems with automation, content and conversion flows.',
    'If demand is inconsistent, planning, staffing and cash flow suffer.',
    '{{cta}}',
    'Build daily demand with automation, content and follow-up from {{brand_name}}. {{cta}}',
    'Random growth is stressful growth. {{brand_name}} helps local businesses create a repeatable demand system with stronger digital presence, automation and smarter customer follow-up. {{cta}}',
    'A serious business cannot depend on luck, referrals and slow replies. {{brand_name}} builds the engine behind daily demand: better visibility, stronger conversion flow and automation that keeps prospects moving even when the team is busy. If you want predictable momentum, {{cta}}'
  ),
  (
    'websites-mobile-first',
    'Mobile-first sites that convert',
    'websites',
    'Your website should bring customers, not just look acceptable.',
    'Many local businesses have slow sites, weak structure and no clear next action.',
    '{{brand_name}} builds mobile-first pages designed to convert calls, bookings and inquiries.',
    'When the first impression looks weak, trust and conversion drop immediately.',
    '{{cta}}',
    'Upgrade to a mobile-first site built to convert. {{cta}}',
    'A local website should do one thing well: turn attention into action. {{brand_name}} designs mobile-first pages with clearer structure, stronger trust and better conversion paths. {{cta}}',
    'A website that only exists as a digital brochure is costing you money. {{brand_name}} creates mobile-first experiences that help local businesses look credible, respond faster and convert more visitors into booked calls, orders or leads. If your current site is just sitting there, {{cta}}'
  ),
  (
    'websites-first-impression',
    'First impression matters',
    'websites',
    'People judge your business before they ever talk to you.',
    'An outdated site makes the business feel slower, smaller and less trustworthy.',
    '{{brand_name}} gives local brands a sharper digital presence backed by systems that convert.',
    'A weak first impression can kill deals before the conversation starts.',
    '{{cta}}',
    'Give your business a stronger first impression online. {{cta}}',
    'Your digital presence says a lot before a customer ever sends a message. {{brand_name}} helps local businesses show up with a cleaner website, stronger credibility and better conversion flow. {{cta}}',
    'Customers decide fast. If your website feels outdated, confusing or unfinished, they assume the business works the same way. {{brand_name}} helps you present a stronger brand online and back it with systems that make the next step easy. If you need a presence that sells with confidence, {{cta}}'
  ),
  (
    'websites-system-not-brochure',
    'Website as system',
    'websites',
    'A serious website is not a brochure. It is part of your sales system.',
    'Most sites fail because they are disconnected from follow-up, messaging and operations.',
    '{{brand_name}} turns websites into connected systems for leads, bookings and customer flow.',
    'If the site is disconnected, you create manual work and lose speed.',
    '{{cta}}',
    'Turn your website into part of the sales system. {{cta}}',
    'A website should not live on an island. {{brand_name}} connects pages, forms, bookings and follow-up so the site becomes part of how the business grows. {{cta}}',
    'Too many businesses invest in a website and then stop there. The real value comes when that site connects to automation, customer tracking and operational follow-up. {{brand_name}} builds websites that behave like sales infrastructure, not decoration. If you want a site that actually works, {{cta}}'
  ),
  (
    'dashboards-one-place',
    'One dashboard',
    'dashboards',
    'What changes when everything lives in one dashboard? Speed.',
    'When bookings, leads, campaigns and updates live in separate tools, nothing feels clear.',
    '{{brand_name}} centralizes the operation so the business sees what matters in one place.',
    'Without visibility, teams react late and opportunities disappear.',
    '{{cta}}',
    'See customers, campaigns and operations in one dashboard. {{cta}}',
    'Local businesses move faster when information stops living in five different places. {{brand_name}} gives you one dashboard for leads, campaigns, bookings and customer activity. {{cta}}',
    'A fragmented operation creates slow decisions, weak follow-up and missed revenue. {{brand_name}} gives local businesses one dashboard to track customers, orders, campaigns and next actions with far less friction. If you want more control and less chaos, {{cta}}'
  ),
  (
    'dashboards-operational-control',
    'Operational control',
    'dashboards',
    'Control is a growth advantage.',
    'If you cannot see what is happening with customers, campaigns and tasks, the business stays reactive.',
    '{{brand_name}} helps teams operate with cleaner visibility and faster decisions.',
    'Growth without control creates wasted spend, delays and confusion.',
    '{{cta}}',
    'Get operational control from one clear dashboard. {{cta}}',
    'Better growth starts with better visibility. {{brand_name}} gives local businesses the control layer needed to track customers, manage activity and act faster. {{cta}}',
    'Many businesses try to grow first and organize later. That usually creates more stress than scale. {{brand_name}} gives you the operational control to see customer activity, monitor campaigns and run the business with more confidence from one dashboard. If clarity matters, {{cta}}'
  ),
  (
    'dashboards-management-without-chaos',
    'Management without chaos',
    'dashboards',
    'You should not need five tools to know what is happening today.',
    'Scattered systems create delayed answers and messy handoffs.',
    '{{brand_name}} simplifies management with a dashboard built around real business actions.',
    'The more disconnected the stack becomes, the slower the business moves.',
    '{{cta}}',
    'Simplify management with one operating dashboard. {{cta}}',
    'If you are checking one tool for leads, another for bookings and another for campaigns, you are losing momentum. {{brand_name}} helps local businesses operate from one practical dashboard. {{cta}}',
    'Growth becomes easier when visibility is simple. {{brand_name}} replaces fragmented updates with one operational view for customers, campaigns and bookings so the team can stop guessing and start executing faster. If you want less chaos and more control, {{cta}}'
  ),
  (
    'branding-look-expensive',
    'Look premium',
    'branding',
    'If the brand looks cheap, the customer expects cheap.',
    'Weak branding lowers trust before the offer even gets a chance.',
    '{{brand_name}} helps local businesses present themselves with more clarity, authority and premium perception.',
    'Perception affects conversion, pricing power and close rate.',
    '{{cta}}',
    'Upgrade how your business looks and feels online. {{cta}}',
    'A stronger brand does not just look better. It sells better. {{brand_name}} helps local businesses improve perception, trust and conversion through sharper presentation and systems. {{cta}}',
    'Branding is not about vanity. It is about making the business feel credible, modern and worth contacting. {{brand_name}} helps local businesses raise perceived value with stronger positioning, cleaner visuals and systems that support the sale. If your brand needs to feel more serious, {{cta}}'
  ),
  (
    'branding-trust-faster',
    'Earn trust faster',
    'branding',
    'Better branding shortens the trust gap.',
    'Prospects hesitate when a business feels inconsistent or unclear online.',
    '{{brand_name}} aligns your presentation, messaging and digital experience to build trust faster.',
    'Trust is not optional when competition is one click away.',
    '{{cta}}',
    'Build trust faster with a stronger brand presence. {{cta}}',
    'Customers do not only compare prices. They compare confidence. {{brand_name}} helps local businesses build a stronger online presence that earns trust faster. {{cta}}',
    'When your digital presence feels inconsistent, customers hesitate and the sale gets harder. {{brand_name}} helps you look sharper, communicate more clearly and create a brand experience that moves faster toward the sale. If you want the business to feel more premium, {{cta}}'
  ),
  (
    'branding-position-like-leader',
    'Position like a leader',
    'branding',
    'You do not need to be the biggest to look like the best option.',
    'Many strong businesses look smaller online than they really are.',
    '{{brand_name}} helps local operators present themselves like category leaders.',
    'A weak position online makes every sale harder and every ad less efficient.',
    '{{cta}}',
    'Position your business like a category leader. {{cta}}',
    'The market decides quickly who feels established. {{brand_name}} helps local businesses show up with the clarity and confidence of a stronger brand. {{cta}}',
    'You can deliver excellent work and still lose attention if the business looks average online. {{brand_name}} helps local brands position themselves with stronger authority, better design and clearer messaging so the market sees a leader, not another option. If that matters to your growth, {{cta}}'
  ),
  (
    'social-content-that-sells',
    'Content that sells',
    'social-management',
    'Posting without strategy is noise.',
    'Many businesses post regularly and still fail to create demand because the content has no sales direction.',
    '{{brand_name}} builds content systems with stronger hooks, positioning and calls to action.',
    'If content is not moving people toward action, it is just consuming time.',
    '{{cta}}',
    'Turn content into a demand tool, not a chore. {{cta}}',
    'Social media should support sales, not distract from them. {{brand_name}} helps local businesses create content that looks sharper and drives clearer action. {{cta}}',
    'A lot of businesses are active on social media but passive in strategy. {{brand_name}} helps local brands build content systems that attract attention, create urgency and move people toward the next step. If your content needs to sell harder, {{cta}}'
  ),
  (
    'social-consistency-without-chaos',
    'Consistency without chaos',
    'social-management',
    'Consistency matters, but chaos is not a strategy.',
    'Trying to post manually every day usually leads to gaps, rushed content and weak messaging.',
    '{{brand_name}} gives businesses a cleaner content system with templates, scheduling and stronger CTA direction.',
    'When consistency breaks, visibility and momentum drop.',
    '{{cta}}',
    'Stay consistent with a smarter content system. {{cta}}',
    'Content works better when the process is organized. {{brand_name}} helps local businesses stay visible with clearer scheduling, stronger copy and better consistency. {{cta}}',
    'Most teams do not need more motivation to post. They need a system that makes good content easier to ship. {{brand_name}} helps local businesses organize templates, scheduling and CTA strategy so content keeps moving without daily chaos. If you want consistency without the scramble, {{cta}}'
  ),
  (
    'social-stop-random-posting',
    'Stop random posting',
    'social-management',
    'Random posting creates random results.',
    'Without a content plan tied to your offer, social media becomes activity without direction.',
    '{{brand_name}} aligns posting, positioning and calls to action around business goals.',
    'A weak social strategy wastes attention you already paid to earn.',
    '{{cta}}',
    'Stop random posting and build a clearer social strategy. {{cta}}',
    'If social media feels busy but unproductive, the issue is usually strategy. {{brand_name}} helps local businesses post with clearer structure, stronger intent and better conversion potential. {{cta}}',
    'A random content calendar creates random business outcomes. {{brand_name}} helps local businesses connect social posting to real growth goals with better hooks, better CTA and a stronger offer narrative. If you want social media that actually supports the business, {{cta}}'
  ),
  (
    'leads-more-qualified-inquiries',
    'More qualified inquiries',
    'lead-generation',
    'More leads only help if the right leads actually convert.',
    'A weak intake flow creates slow follow-up and low-quality conversations.',
    '{{brand_name}} improves lead generation with better capture, better routing and stronger conversion flow.',
    'Bad lead handling wastes ad spend and sales energy.',
    '{{cta}}',
    'Get more qualified inquiries with a stronger intake system. {{cta}}',
    'Lead generation works better when the path from inquiry to action is clear. {{brand_name}} helps local businesses capture and convert better leads. {{cta}}',
    'The goal is not just more leads. The goal is better leads with a faster path to action. {{brand_name}} helps local businesses improve inquiries through clearer capture, stronger follow-up and a tighter conversion system. If you want higher-intent demand, {{cta}}'
  ),
  (
    'leads-response-speed',
    'Speed closes deals',
    'lead-generation',
    'Response speed is a conversion weapon.',
    'When leads wait too long, trust drops and competitors win the conversation.',
    '{{brand_name}} helps local businesses respond faster with automation and better routing.',
    'The sale often goes to the business that moves first with clarity.',
    '{{cta}}',
    'Increase response speed and capture more deals. {{cta}}',
    'Many leads do not disappear because of price. They disappear because nobody followed up fast enough. {{brand_name}} helps you move first with automation and better lead flow. {{cta}}',
    'A slow response can erase the value of every marketing dollar you spend. {{brand_name}} helps local businesses automate early replies, route leads faster and keep conversations moving while the intent is still high. If speed matters to your growth, {{cta}}'
  ),
  (
    'leads-built-for-local-demand',
    'Built for local demand',
    'lead-generation',
    'Local businesses need demand systems built for local behavior.',
    'Generic funnels often ignore how fast local customers decide and how easily they move on.',
    '{{brand_name}} builds lead systems around real local buying behavior and urgency.',
    'If your process feels generic, conversion usually follows.',
    '{{cta}}',
    'Build lead generation around real local demand. {{cta}}',
    'Local growth needs local logic. {{brand_name}} helps businesses capture intent faster with systems built for how nearby customers actually buy. {{cta}}',
    'A local customer does not want a complicated funnel. They want confidence, speed and a clear next step. {{brand_name}} helps businesses build lead systems that match that behavior so more inquiries become real opportunities. If you want a demand engine built for your market, {{cta}}'
  ),
  (
    'authority-show-you-are-serious',
    'Show you are serious',
    'authority',
    'Authority is built before the first conversation.',
    'When your digital presence looks average, prospects assume the business is average too.',
    '{{brand_name}} helps businesses communicate authority through systems, presentation and positioning.',
    'If the market does not feel your authority, you compete harder on price.',
    '{{cta}}',
    'Show the market you are serious. {{cta}}',
    'Authority makes the sale easier. {{brand_name}} helps local businesses look sharper, move faster and communicate more confidence online. {{cta}}',
    'A business with stronger authority earns more trust, better attention and often better margins. {{brand_name}} helps local operators build that authority with cleaner positioning, stronger design and systems that make the experience feel premium. If you want the market to take you more seriously, {{cta}}'
  ),
  (
    'authority-modern-operator',
    'Modern operator',
    'authority',
    'Modern businesses do not run on guesswork.',
    'If the operation looks manual and messy, prospects feel the friction before they buy.',
    '{{brand_name}} helps local businesses operate and present themselves like modern operators.',
    'The market rewards businesses that feel organized and current.',
    '{{cta}}',
    'Operate and present like a modern business. {{cta}}',
    'Today''s customer expects a smoother experience. {{brand_name}} helps local businesses deliver that with better systems, stronger visibility and cleaner presentation. {{cta}}',
    'Customers can feel when a business is modern and when it is stuck in manual mode. {{brand_name}} helps local operators look and function like a serious modern company, with automation, dashboards and digital systems that support growth. If you want that edge, {{cta}}'
  ),
  (
    'authority-premium-positioning',
    'Premium positioning',
    'authority',
    'Premium positioning changes the conversation before price comes up.',
    'If the brand feels generic, people compare you as a commodity.',
    '{{brand_name}} helps businesses create a more premium position through design, systems and messaging.',
    'Stronger positioning protects your value and improves conversion quality.',
    '{{cta}}',
    'Build a more premium position in your market. {{cta}}',
    'Premium does not mean flashy. It means clear, credible and worth contacting. {{brand_name}} helps local businesses position themselves that way online. {{cta}}',
    'When the business feels premium, customers expect a better experience and a stronger result. {{brand_name}} helps local brands raise perceived value through sharper presentation, stronger systems and clearer messaging so they stop looking interchangeable. If premium positioning is the next move, {{cta}}'
  ),
  (
    'urgency-dont-wait-to-fix',
    'Do not wait to fix the leak',
    'urgency',
    'The longer you wait to fix a broken customer flow, the more revenue leaks out.',
    'Slow replies, weak pages and disconnected tools create daily losses that become normal.',
    '{{brand_name}} helps businesses fix the leak with a smarter system.',
    'What feels like a minor delay today can become thousands in missed demand over time.',
    '{{cta}}',
    'Fix the leak before more demand slips away. {{cta}}',
    'Every day you stay manual, you keep paying the cost in missed leads and slower growth. {{brand_name}} helps local businesses tighten the system and move faster. {{cta}}',
    'Most businesses do not notice how much revenue they lose through small operational leaks: missed messages, slow follow-up, weak pages and scattered tools. {{brand_name}} helps you fix that before another month disappears into avoidable friction. If you are ready to stop bleeding demand, {{cta}}'
  ),
  (
    'urgency-market-moving',
    'The market is moving',
    'urgency',
    'Your market is not waiting for you to get organized.',
    'Competitors who respond faster and look sharper capture attention first.',
    '{{brand_name}} helps local businesses modernize before they lose more ground.',
    'Delay makes catch-up harder and more expensive.',
    '{{cta}}',
    'Modernize now before the gap gets bigger. {{cta}}',
    'Customers keep moving toward the business that feels easier to trust and easier to buy from. {{brand_name}} helps you close that gap with better systems and stronger digital presence. {{cta}}',
    'The market does not pause while you figure things out. Customers keep choosing the business that looks more professional, responds faster and feels more organized. {{brand_name}} helps local businesses build that edge now, before more momentum shifts elsewhere. If you want to move sooner instead of later, {{cta}}'
  ),
  (
    'urgency-manual-cost',
    'Manual has a cost',
    'urgency',
    'Manual work always looks cheaper until growth slows down.',
    'What seems manageable now becomes expensive when the team is overloaded and customers wait.',
    '{{brand_name}} replaces avoidable manual work with smarter automation and control.',
    'The cost of manual operations compounds quietly.',
    '{{cta}}',
    'Reduce the hidden cost of manual operations. {{cta}}',
    'Manual work is not free. It costs speed, consistency and sales. {{brand_name}} helps local businesses remove that drag with stronger systems. {{cta}}',
    'A business can survive on manual operations for a while, but scaling that way gets expensive fast. Missed follow-up, rushed responses and operational confusion all carry a cost. {{brand_name}} helps you replace those weak points with automation and structure before they slow growth further. {{cta}}'
  ),
  (
    'problem-solution-scattered-tools',
    'Scattered tools',
    'problem-solution',
    'Too many tools. Not enough control.',
    'When your business runs on disconnected apps, visibility drops and execution slows down.',
    '{{brand_name}} brings the key pieces into one system that is easier to manage.',
    'Complex stacks create simple problems: slower action, weaker follow-up and less clarity.',
    '{{cta}}',
    'Replace tool chaos with one clearer system. {{cta}}',
    'If your operation depends on jumping between tools all day, the system is already costing you. {{brand_name}} helps local businesses simplify and centralize control. {{cta}}',
    'Scattered tools make businesses feel busier than they are effective. {{brand_name}} helps local teams centralize the important parts of customer flow, content and visibility into one cleaner system so they can act faster with less friction. If you are tired of tool chaos, {{cta}}'
  ),
  (
    'problem-solution-no-follow-up',
    'No follow-up',
    'problem-solution',
    'The problem is not always lead volume. Sometimes it is follow-up.',
    'Businesses often blame marketing when the real issue is that prospects are not being moved forward.',
    '{{brand_name}} closes the gap with automation, reminders and stronger next steps.',
    'Without structured follow-up, good leads quietly die.',
    '{{cta}}',
    'Fix follow-up and recover more demand. {{cta}}',
    'A surprising number of lost sales come from weak follow-up, not weak interest. {{brand_name}} helps local businesses tighten that gap with better automation and clearer next steps. {{cta}}',
    'It is easy to ask for more leads. It is harder and smarter to ask what happens after a lead arrives. {{brand_name}} helps local businesses improve that middle layer with automation, reminders and better customer flow so more intent actually turns into revenue. If that is the bottleneck, {{cta}}'
  ),
  (
    'problem-solution-no-system',
    'No system no scale',
    'problem-solution',
    'Without a system, growth feels heavier every month.',
    'Teams work harder, but results stay inconsistent because the business is still running reactively.',
    '{{brand_name}} helps local businesses turn operations into a repeatable system.',
    'If there is no system, every new customer adds pressure instead of leverage.',
    '{{cta}}',
    'Turn growth into a system instead of a scramble. {{cta}}',
    'When every sale depends on manual effort, the business stays fragile. {{brand_name}} helps local teams build systems that support real scale. {{cta}}',
    'A business without systems can still grow, but it usually grows in a painful way. More customers create more pressure, more notifications and more missed details. {{brand_name}} helps local businesses convert that pressure into structure with automation, dashboards and a stronger operating model. If scale needs to feel lighter, {{cta}}'
  ),
  (
    'direct-sell-request-demo',
    'Request a demo',
    'direct-sale',
    'If you want a faster business, start with a better system.',
    'Manual workflows, weak pages and slow follow-up are holding back too many local teams.',
    '{{brand_name}} builds the digital systems that make growth easier to manage.',
    'The sooner the system improves, the sooner revenue friction starts dropping.',
    '{{cta}}',
    'Request a demo and see how {{brand_name}} can tighten your operation. {{cta}}',
    'If your business needs a cleaner growth system, better visibility and stronger automation, {{brand_name}} is built for that. Request a demo and see what the next version can look like. {{cta}}',
    'If you are ready to stop improvising your growth stack, {{brand_name}} can help. We build the digital systems local businesses use to look sharper, reply faster and convert more demand with less manual drag. If you want to see how that would look for your business, request a demo today. {{cta}}'
  ),
  (
    'direct-sell-book-growth-call',
    'Book a growth call',
    'direct-sale',
    'Your business does not need more noise. It needs a system.',
    'Without one, lead flow, content and operations keep fighting each other.',
    '{{brand_name}} organizes the customer journey into something faster and more profitable.',
    'If the system is the bottleneck, more effort will not fix it.',
    '{{cta}}',
    'Book a growth call with {{brand_name}}. {{cta}}',
    'A cleaner system changes how a business looks, responds and grows. {{brand_name}} helps local businesses build that upgrade with automation, dashboards and stronger digital presence. {{cta}}',
    'Too many businesses are trying to scale on top of messy systems. {{brand_name}} helps local teams clean that up with automation, sharper positioning and one dashboard to manage growth more intelligently. If you want to see what that looks like in practice, book a growth call. {{cta}}'
  ),
  (
    'direct-sell-limited-slots',
    'Limited onboarding slots',
    'direct-sale',
    'We only take on a limited number of buildouts at a time.',
    'Strong execution requires focus, and rushed projects create weak systems.',
    '{{brand_name}} works with local businesses ready to move on automation, presence and growth systems.',
    'If you have been waiting to fix the stack, this is the moment to act.',
    '{{cta}}',
    'If you want in, request your demo now. {{cta}}',
    '{{brand_name}} only opens a limited number of onboarding slots for businesses that want stronger systems, clearer visibility and more consistent client flow. {{cta}}',
    'We do not stack unlimited projects because the work only matters if it is built well. {{brand_name}} works with local businesses that are ready to upgrade how they attract, manage and convert customers through automation and digital systems. If you want to claim one of the current onboarding spots, request your demo now. {{cta}}'
  ),
  (
    'authority-demo-proof',
    'Demo beats explanation',
    'authority',
    'A live system explains the value faster than a long sales pitch.',
    'Most businesses understand the problem but still need to see how the solution works in practice.',
    '{{brand_name}} can show the dashboard, automation flow and customer journey in a clear demo.',
    'Clarity shortens decision cycles.',
    '{{cta}}',
    'Request a demo and see the system in action. {{cta}}',
    'If you want to understand what better automation and operational control actually look like, the fastest path is a live demo. {{brand_name}} can show you. {{cta}}',
    'A lot of business owners know they need stronger systems but still have trouble visualizing the upgrade. That is why {{brand_name}} focuses on showing the real workflow: lead capture, automation, dashboard visibility and next-step control. If you want to see the system instead of guessing, request a demo. {{cta}}'
  ),
  (
    'automation-content-machine',
    'Content machine',
    'automation',
    'Content should not stop because the team got busy.',
    'Manual content creation is one of the first systems to break when operations get heavy.',
    '{{brand_name}} helps businesses systemize social content with templates, scheduling and CTA direction.',
    'When visibility drops, demand usually softens after it.',
    '{{cta}}',
    'Systemize content before visibility slips. {{cta}}',
    'A business that disappears from social media usually feels smaller than it is. {{brand_name}} helps local teams build a content machine that keeps moving even during busy weeks. {{cta}}',
    'When content depends entirely on spare time, consistency never lasts. {{brand_name}} helps local businesses build a better content machine with templates, scheduling, automation and stronger calls to action so visibility keeps supporting growth instead of fading whenever the team gets busy. {{cta}}'
  ),
  (
    'lead-generation-demo-offer',
    'See the flow before you buy',
    'lead-generation',
    'You should be able to see the growth flow before committing.',
    'Many providers sell vague promises instead of showing the operating model.',
    '{{brand_name}} can walk you through how leads, automation and follow-up work together.',
    'Confidence goes up when the process is clear.',
    '{{cta}}',
    'See the flow in a live demo. {{cta}}',
    'If you want to understand how a stronger lead system actually works, {{brand_name}} can show you the flow live: capture, reply, follow-up and control. {{cta}}',
    'A lot of businesses know they need more structure but hesitate because they have never seen the full growth flow explained clearly. {{brand_name}} can show how lead capture, automation, content and dashboard visibility work together so you can evaluate the system with confidence. If you want to see it before making the move, {{cta}}'
  )
on conflict (slug) do update
set
  title = excluded.title,
  category = excluded.category,
  hook = excluded.hook,
  problem = excluded.problem,
  solution = excluded.solution,
  necessity = excluded.necessity,
  cta = excluded.cta,
  short_copy = excluded.short_copy,
  medium_copy = excluded.medium_copy,
  long_copy = excluded.long_copy,
  active = true,
  updated_at = now();
