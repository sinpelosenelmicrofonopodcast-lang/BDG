insert into public.plans (slug, name, category, billing_type, price_min, price_max, description, features, is_popular, active)
values
  (
    'starter-local',
    'STARTER',
    'project',
    'subscription',
    29,
    29,
    'Presencia profesional online para negocios locales.',
    '["Pagina profesional optimizada para celular","Informacion del negocio","Boton de llamada o contacto directo","Google Maps integrado","Integracion con redes sociales","Hosting seguro","Mantenimiento basico","Notificaciones push basicas"]'::jsonb,
    false,
    true
  ),
  (
    'business-local',
    'BUSINESS',
    'project',
    'subscription',
    59,
    59,
    'Sistema para recibir clientes y administrar reservas u ordenes.',
    '["Todo en Starter","Sistema de ordenes o reservas","Confirmacion automatica al cliente","Panel basico para administrar","Notificaciones push automaticas","Notificaciones por email","SEO local basico","Integracion con redes sociales"]'::jsonb,
    true,
    true
  ),
  (
    'pro-local',
    'PRO',
    'project',
    'subscription',
    99,
    99,
    'Negocio automatizado con dashboard, analytics y promociones.',
    '["Todo en Business","Dashboard completo de clientes","Control de ordenes o reservas","Base de datos de clientes","Promociones automaticas","Analytics del negocio","Landing pages para promociones","Sistema de notificaciones avanzado"]'::jsonb,
    false,
    true
  ),
  (
    'realtors-dealers',
    'REALTORS / DEALERS',
    'project',
    'subscription',
    79,
    79,
    'Plan especial para realtors y dealers con sistema de listings.',
    '["Pagina profesional","Listados de propiedades o autos","Formularios para leads","Notificaciones de nuevos clientes","Panel para administrar listings","Integracion con redes sociales"]'::jsonb,
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

update public.plans
set active = false,
    updated_at = now()
where slug in (
  'starter-landing',
  'business-website',
  'small-business-quote',
  'growth-system',
  'app-platform',
  'enterprise',
  'care-plan',
  'seo-growth',
  'automation-crm'
);

insert into public.addons (slug, name, billing_type, price_min, price_max, description, active)
values
  ('seo-local', 'SEO local', 'subscription', 79, 79, 'Optimizacion SEO local mensual.', true),
  ('social-ads-management', 'Gestion de publicidad (Facebook / Instagram)', 'subscription', 149, 149, 'Gestion mensual de campanas pagadas.', true),
  ('pro-photography', 'Fotografia profesional', 'one_time', 150, 150, 'Sesion fotografica profesional para marca o catalogo.', true),
  ('social-videos-reels', 'Videos / Reels para redes', 'one_time', 120, 120, 'Produccion de piezas cortas para redes sociales.', true),
  ('marketing-automation', 'Automatizacion de marketing', 'subscription', 59, 59, 'Flujos automaticos de seguimiento comercial.', true)
on conflict (slug) do update
set
  name = excluded.name,
  billing_type = excluded.billing_type,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  description = excluded.description,
  active = excluded.active,
  updated_at = now();

update public.addons
set active = false,
    updated_at = now()
where slug in (
  'seo-pro',
  'blog',
  'booking-system',
  'payments-stripe',
  'admin-dashboard',
  'whatsapp-automation',
  'social-integrations',
  'user-accounts',
  'pwa-app',
  'hosting-managed'
);

insert into public.site_settings (key, value)
values (
  'contact_settings',
  '{"method":"form","value":"","labelEn":"Contact Us","labelEs":"Contactanos","openInNewTab":false,"agencyEmail":"sales@youragency.com","agencyPhone":"+1-000-000-0000","locationEn":"United States","locationEs":"Estados Unidos"}'::jsonb
)
on conflict (key) do update
set
  value = excluded.value,
  updated_at = now();
