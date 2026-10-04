import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { pipeline } from '@/lib/data'

const nav=['Dashboard','Leads','Projects','Calendar','Quotes','Contracts','Invoices','Delivery','Equipment','Rentals','Marketing','Catalog','Settings']
const staffRoles=new Set(['owner','admin','producer','editor','finance'])
const money=(cents:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format((cents||0)/100)
const nice=(value:string)=>value.replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase())

export default async function Admin(){
  const supabase=await createClient()
  const {data:claimsData}=await supabase.auth.getClaims()
  const userId=claimsData?.claims?.sub
  if(!userId) redirect('/login?next=/admin')

  const {data:profile}=await supabase.from('profiles').select('full_name,role').eq('id',String(userId)).maybeSingle()
  if(!profile||!staffRoles.has(profile.role)) redirect('/client')

  const [{count:leadCount},{count:equipmentCount},{count:rentableCount},{data:projects},{count:contentReady}]=await Promise.all([
    supabase.from('leads').select('id',{count:'exact',head:true}).in('status',['new','qualified','quoted']),
    supabase.from('equipment').select('id',{count:'exact',head:true}),
    supabase.from('equipment').select('id',{count:'exact',head:true}).eq('rental_enabled',true),
    supabase.from('projects').select('id,title,status,total_cents,paid_cents,delivery_due_at,event_date,clients(full_name)').neq('status','archived').order('updated_at',{ascending:false}).limit(20),
    supabase.from('marketing_posts').select('id',{count:'exact',head:true}).eq('status','ready'),
  ])

  const activeProjects=projects?.length||0
  const outstanding=(projects||[]).reduce((sum,p)=>sum+Math.max(0,(p.total_cents||0)-(p.paid_cents||0)),0)

  return <main className="admin"><aside className="sidebar"><div className="brand"><span className="brandmark">PRIME CUT</span><span className="brandsub">STUDIOS · OS</span></div><div style={{height:26}}/>{nav.map((n,i)=><a href={`#${n.toLowerCase().replaceAll(' ','-')}`} key={n} className={`sideitem ${i===0?'active':''}`}>{n}</a>)}</aside><section className="adminmain"><div className="toprow"><div><div className="eyebrow">PrimeCuts OS · {profile.role}</div><h1>Operations</h1><p className="muted">Signed in as {profile.full_name||'PrimeCuts staff'}.</p></div><div style={{display:'flex',gap:10}}><a className="btn" href="/book">+ New inquiry</a><form action="/auth/signout" method="post"><button className="btn ghost" type="submit">Sign out</button></form></div></div><div className="cards4"><div className="dashmetric"><span className="muted">Active projects</span><b>{activeProjects}</b></div><div className="dashmetric"><span className="muted">Outstanding</span><b>{money(outstanding)}</b></div><div className="dashmetric"><span className="muted">Open leads</span><b>{leadCount||0}</b></div><div className="dashmetric"><span className="muted">Content ready</span><b>{contentReady||0}</b></div></div><section style={{padding:'38px 0 0'}}><div className="eyebrow">Production pipeline</div><div className="pipeline">{pipeline.map(s=><div className="stage" key={s}>{s}</div>)}</div></section><section style={{padding:'34px 0 0'}}><div className="tablewrap"><table><thead><tr><th>Client</th><th>Project</th><th>Status</th><th>Total</th><th>Paid</th><th>Balance</th><th>Delivery</th></tr></thead><tbody>{projects?.length?projects.map(p=>{const rel=p.clients as unknown as {full_name?:string}|{full_name?:string}[]|null;const client=Array.isArray(rel)?rel[0]:rel;const due=Math.max(0,(p.total_cents||0)-(p.paid_cents||0));return <tr key={p.id}><td>{client?.full_name||'Client'}</td><td>{p.title}</td><td><span className="pill">{nice(p.status)}</span></td><td>{money(p.total_cents)}</td><td>{money(p.paid_cents)}</td><td>{money(due)}</td><td>{p.delivery_due_at?new Date(p.delivery_due_at).toLocaleDateString():'—'}</td></tr>}):<tr><td colSpan={7}><span className="muted">No active projects yet. New inquiries will feed this system.</span></td></tr>}</tbody></table></div></section><section style={{padding:'34px 0 70px'}}><div className="two"><div className="panel"><div className="eyebrow">Equipment control</div><h3>{equipmentCount||0} assets · {rentableCount||0} rentable</h3><p className="muted">Equipment defaults to Internal Only. Nothing becomes publicly rentable until explicitly enabled in Admin.</p></div><div className="panel"><div className="eyebrow">Billing</div><h3>Tracking active. Processing off.</h3><p className="muted">Invoices and balances can be managed now. Online payment processing remains disabled until you approve activation.</p></div></div></section></section></main>
}
