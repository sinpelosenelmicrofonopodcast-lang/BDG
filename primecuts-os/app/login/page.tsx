import { SiteHeader } from '@/components/SiteHeader'
import { Footer } from '@/components/Footer'
import { sendMagicLink } from './actions'

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const sent = params.sent === '1'
  const error = typeof params.error === 'string' ? params.error : ''
  const email = typeof params.email === 'string' ? params.email : ''
  const next = typeof params.next === 'string' ? params.next : '/client'

  return <><SiteHeader/><main><div className="shell pagehero"><div className="eyebrow">Secure access</div><h1>PrimeCuts Portal</h1><p className="muted">Clients and staff use passwordless email access. Your session only exposes records allowed by PrimeCuts security rules.</p></div><section style={{paddingTop:18}}><div className="shell two"><form className="panel form" action={sendMagicLink}><input type="hidden" name="next" value={next}/><div className="field"><label>Email</label><input name="email" type="email" required defaultValue={email} placeholder="you@example.com" autoComplete="email"/></div><button className="btn" type="submit">Email me a secure link</button>{sent && <div className="note">Secure link sent. Check your inbox and open it on this device.</div>}{error && <div className="note">We couldn't start your sign-in. Verify the email and try again.</div>}</form><div className="panel"><div className="eyebrow">One login</div><h3>Client portal + staff OS</h3><p className="muted">Client accounts only see their own projects, contracts, invoices and approved deliveries. Staff permissions are controlled separately in PrimeCuts OS.</p><span className="pill">Payments remain disabled</span></div></div></section></main><Footer/></>
}
