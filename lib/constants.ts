export const projectPlans = [
  {
    slug: "starter-local",
    name: "STARTER",
    setupFee: 199,
    priceMin: 29,
    priceMax: 29,
    billingType: "subscription",
    popular: false,
    description: "Presencia profesional online para empezar con bajo costo mensual.",
    features: [
      "Pagina profesional optimizada para celular",
      "Informacion del negocio (servicios, menu o productos)",
      "Boton de llamada o WhatsApp directo",
      "Google Maps integrado",
      "Integracion con redes sociales",
      "Hosting seguro",
      "Mantenimiento basico",
      "Notificaciones push basicas"
    ]
  },
  {
    slug: "business-local",
    name: "BUSINESS",
    setupFee: 399,
    priceMin: 59,
    priceMax: 59,
    billingType: "subscription",
    popular: true,
    description: "Sistema para recibir clientes con reservas u ordenes automatizadas.",
    features: [
      "Todo lo incluido en Starter",
      "Sistema de ordenes o reservas",
      "Confirmacion automatica al cliente",
      "Panel basico para administrar",
      "Notificaciones push automaticas",
      "Notificaciones por email",
      "SEO local basico",
      "Integracion con redes sociales"
    ]
  },
  {
    slug: "pro-local",
    name: "PRO",
    setupFee: 699,
    priceMin: 99,
    priceMax: 99,
    billingType: "subscription",
    popular: false,
    description: "Negocio automatizado con dashboard, analitica y flujos avanzados.",
    features: [
      "Todo lo incluido en Business",
      "Dashboard completo de clientes",
      "Control de ordenes o reservas",
      "Base de datos de clientes",
      "Promociones automaticas",
      "Analytics del negocio",
      "Landing pages para promociones",
      "Sistema de notificaciones avanzado"
    ]
  },
  {
    slug: "realtors-dealers",
    name: "REALTORS / DEALERS",
    setupFee: 599,
    priceMin: 79,
    priceMax: 79,
    billingType: "subscription",
    popular: false,
    description: "Plan especial para listings y generacion de leads en tiempo real.",
    features: [
      "Pagina profesional",
      "Listados de propiedades o autos",
      "Formularios para leads",
      "Notificaciones de nuevos clientes",
      "Panel para administrar listings",
      "Integracion con redes sociales"
    ]
  }
] as const;

export const retainerPlans = [] as const;

export const addonCatalog = [
  { slug: "seo-local", name: "SEO local", priceMin: 79, priceMax: 79, billingType: "subscription" },
  {
    slug: "social-ads-management",
    name: "Gestion de publicidad (Facebook / Instagram)",
    priceMin: 149,
    priceMax: 149,
    billingType: "subscription"
  },
  { slug: "pro-photography", name: "Fotografia profesional", priceMin: 150, priceMax: 150, billingType: "one_time" },
  { slug: "social-videos-reels", name: "Videos / Reels para redes", priceMin: 120, priceMax: 120, billingType: "one_time" },
  { slug: "marketing-automation", name: "Automatizacion de marketing", priceMin: 59, priceMax: 59, billingType: "subscription" }
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
