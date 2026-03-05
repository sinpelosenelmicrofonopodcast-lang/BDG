export const projectPlans = [
  {
    slug: "starter-landing",
    name: "Starter Landing",
    priceMin: 499,
    priceMax: 899,
    billingType: "one_time",
    popular: false,
    description: "Ideal para empezar rapido y vender desde una sola pagina.",
    features: ["1 pagina", "WhatsApp", "Formulario", "SEO basico", "Responsive", "Tracking basico"]
  },
  {
    slug: "business-website",
    name: "Business Website",
    priceMin: 1499,
    priceMax: 2999,
    billingType: "one_time",
    popular: true,
    description: "Sitio profesional para empresas que quieren escalar clientes.",
    features: ["5-8 paginas", "SEO tecnico", "Performance", "Blog opcional", "Analytics"]
  },
  {
    slug: "small-business-quote",
    name: "Small Business Custom",
    priceMin: 0,
    priceMax: 0,
    billingType: "quote_only",
    popular: false,
    description: "Plan flexible para negocios pequenos, cotizado segun necesidad real.",
    features: ["Scope por necesidad", "Roadmap por fases", "Prioridad a conversion", "Implementacion modular"]
  },
  {
    slug: "growth-system",
    name: "Growth System",
    priceMin: 3500,
    priceMax: 6500,
    billingType: "one_time",
    popular: false,
    description: "Sistema de conversion con automatizaciones y control comercial.",
    features: ["Web premium", "Booking", "CRM simple", "Automations", "Dashboard basico"]
  },
  {
    slug: "app-platform",
    name: "App Platform",
    priceMin: 4000,
    priceMax: 10000,
    billingType: "one_time",
    popular: false,
    description: "Producto digital con usuarios, roles y operaciones internas.",
    features: ["Login", "Roles", "Admin dashboard", "Pagos", "Integraciones"]
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    priceMin: 10000,
    priceMax: 0,
    billingType: "quote_only",
    popular: false,
    description: "Arquitectura enterprise a medida.",
    features: ["Cotizacion personalizada", "Arquitectura dedicada", "Soporte prioritario"]
  }
] as const;

export const retainerPlans = [
  {
    slug: "care-plan",
    name: "Care Plan",
    priceMin: 149,
    priceMax: 149,
    billingType: "subscription",
    popular: true,
    description: "Mantenimiento tecnico mensual y monitoreo.",
    features: ["Mantenimiento", "Backups", "Soporte mensual"]
  },
  {
    slug: "seo-growth",
    name: "SEO Growth",
    priceMin: 399,
    priceMax: 799,
    billingType: "subscription",
    popular: false,
    description: "Crecimiento organico para leads continuos.",
    features: ["SEO tecnico", "Contenido", "Reporte mensual"]
  },
  {
    slug: "automation-crm",
    name: "Automation CRM",
    priceMin: 699,
    priceMax: 1500,
    billingType: "subscription",
    popular: false,
    description: "Automatiza ventas, seguimiento y pipeline.",
    features: ["CRM", "Automations", "Funnel optimization"]
  }
] as const;

export const addonCatalog = [
  { slug: "seo-pro", name: "SEO Pro", priceMin: 300, priceMax: 800, billingType: "one_time" },
  { slug: "blog", name: "Blog", priceMin: 200, priceMax: 500, billingType: "one_time" },
  { slug: "booking-system", name: "Booking System", priceMin: 300, priceMax: 900, billingType: "one_time" },
  { slug: "payments-stripe", name: "Payments Stripe", priceMin: 300, priceMax: 700, billingType: "one_time" },
  { slug: "admin-dashboard", name: "Admin Dashboard", priceMin: 500, priceMax: 1500, billingType: "one_time" },
  { slug: "whatsapp-automation", name: "WhatsApp Automation", priceMin: 200, priceMax: 600, billingType: "one_time" },
  { slug: "social-integrations", name: "Social Integrations", priceMin: 150, priceMax: 400, billingType: "one_time" },
  { slug: "user-accounts", name: "User Accounts", priceMin: 600, priceMax: 1500, billingType: "one_time" },
  { slug: "pwa-app", name: "PWA App", priceMin: 500, priceMax: 1200, billingType: "one_time" },
  { slug: "hosting-managed", name: "Hosting Managed", priceMin: 20, priceMax: 80, billingType: "subscription" }
] as const;

export const nameYourPlanOptions = {
  budget: [150, 250, 400, 600, 900],
  industry: ["Barberia", "Nail Salon", "Restaurante", "Realtor", "Servicios HVAC", "Podcast Creator"],
  needs: ["Landing", "3 paginas", "Logo", "SEO", "Booking", "Pagos", "Blog"]
} as const;

export const analyticsEvents = {
  VIEW_PRICING: "view_pricing",
  START_NAME_YOUR_PLAN: "start_name_your_plan",
  SUBMIT_NAME_YOUR_PLAN: "submit_name_your_plan",
  CLICK_WHATSAPP: "click_whatsapp",
  START_CHECKOUT: "start_checkout",
  PURCHASE_COMPLETED: "purchase_completed",
  OPEN_TICKET: "open_ticket",
  REQUEST_ADDON: "request_addon"
} as const;
