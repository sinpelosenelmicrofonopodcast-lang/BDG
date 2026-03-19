export const projectPlans = [
  {
    slug: "starter-local",
    name: "STARTER",
    setupFee: 199,
    priceMin: 39,
    priceMax: 39,
    billingType: "subscription",
    popular: false,
    description: "Sistema base para que tu negocio se vea profesional y empiece a captar clientes.",
    features: [
      "Pagina profesional optimizada para celular",
      "Boton de llamada directa",
      "Google Maps integrado",
      "Integracion con redes sociales",
      "Hosting seguro",
      "Notificaciones basicas",
      "Panel simple de contacto"
    ]
  },
  {
    slug: "business-local",
    name: "BUSINESS",
    setupFee: 399,
    priceMin: 79,
    priceMax: 79,
    billingType: "subscription",
    popular: false,
    description: "Sistema automatico para recibir clientes, reservas y pedidos desde un solo flujo.",
    features: [
      "Todo lo incluido en Starter",
      "Sistema de reservas o pedidos",
      "Confirmaciones automaticas",
      "Panel de administracion",
      "Notificaciones push",
      "Notificaciones por email",
      "SEO local basico",
      "Integracion completa con redes"
    ]
  },
  {
    slug: "pro-local",
    name: "PRO",
    setupFee: 699,
    priceMin: 129,
    priceMax: 129,
    billingType: "subscription",
    popular: true,
    description: "Sistema de crecimiento automatizado con dashboard, datos y campanas para escalar.",
    features: [
      "Todo lo incluido en Business",
      "Dashboard completo de clientes",
      "Base de datos de clientes",
      "Control total de pedidos o reservas",
      "Promociones automaticas",
      "Analytics del negocio",
      "Landing pages promocionales",
      "Sistema avanzado de notificaciones"
    ]
  },
  {
    slug: "realtors-dealers",
    name: "LISTINGS",
    setupFee: 599,
    priceMin: 99,
    priceMax: 99,
    billingType: "subscription",
    popular: false,
    description: "Sistema para negocios que venden inventario o listados y necesitan captar leads rapido.",
    features: [
      "Pagina profesional",
      "Listados de autos o propiedades",
      "Formularios de leads",
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
  { slug: "marketing-automation", name: "Automatizacion de marketing", priceMin: 59, priceMax: 59, billingType: "subscription" },
  { slug: "pro-photography", name: "Fotografia profesional", priceMin: 150, priceMax: 150, billingType: "one_time" },
  { slug: "social-videos-reels", name: "Videos / Reels para redes", priceMin: 120, priceMax: 120, billingType: "one_time" }
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
  START_CHECKOUT: "start_checkout",
  PURCHASE_COMPLETED: "purchase_completed",
  OPEN_TICKET: "open_ticket",
  REQUEST_ADDON: "request_addon"
} as const;
