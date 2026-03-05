import { getServerLocale } from "@/lib/i18n/server";
import { SectionTitle } from "@/components/marketing/section-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const postsByLocale = {
  en: [
    {
      title: "How service businesses turn websites into sales systems",
      excerpt: "A practical framework for local service funnels with measurable conversion metrics."
    },
    {
      title: "When to move from brochure site to client portal",
      excerpt: "Signals your operation is ready for role-based dashboards and automation."
    },
    {
      title: "Stripe checkout architecture for digital agencies",
      excerpt: "How to model one-time, subscriptions and proposal-based payments securely."
    }
  ],
  es: [
    {
      title: "Cómo negocios de servicios convierten su web en sistema de ventas",
      excerpt: "Framework práctico para funnels locales con métricas de conversión medibles."
    },
    {
      title: "Cuándo pasar de un sitio brochure a un portal de clientes",
      excerpt: "Señales de que tu operación ya está lista para dashboards por roles y automatización."
    },
    {
      title: "Arquitectura de Stripe Checkout para agencias digitales",
      excerpt: "Cómo modelar pagos one-time, suscripciones y depósitos de propuesta de forma segura."
    }
  ]
} as const;

const copy = {
  en: {
    eyebrow: "Insights",
    title: "Growth blog",
    description: "Technical and strategic notes for scaling digital services."
  },
  es: {
    eyebrow: "Insights",
    title: "Blog de crecimiento",
    description: "Notas técnicas y estratégicas para escalar servicios digitales."
  }
} as const;

export default async function BlogPage() {
  const locale = await getServerLocale();
  const c = copy[locale];
  const posts = postsByLocale[locale];

  return (
    <div className="container-shell space-y-8 py-14">
      <SectionTitle eyebrow={c.eyebrow} title={c.title} description={c.description} />
      <div className="grid gap-5 md:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.title}>
            <CardHeader>
              <CardTitle className="text-xl">{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{post.excerpt}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
