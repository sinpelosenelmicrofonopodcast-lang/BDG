import { AdminShell } from '@/components/AdminShell'
import { requireStaff } from '@/lib/auth'
import { pipeline } from '@/lib/data'

const money=(cents:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format((cents||0)/100)
const nice=(value:string)=>value.replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase())

export default async function Admin(){
  const {supabase,profile}=await requireStaff()
  const [{count:leadCount},{count:equipmentCount},{count:rentableCount},{data:projects},{count:contentReady}]=await Promise.all([
    supabase.from('leads').select('id',{count:'exact',head:true}).in('status',['new','qualified','quoted']),
    supabase.from('equipment').select('id',{count:'exact',head:true}),
    supabase.from('equipment').select('id',{count:'exact',head:true}).eq('rental_enabled',true),
    supabase.from('projects').select('id,title,status,total_cents,paid_cents,delivery_due_at,event_date,clients(full_name)').neq('status','archived').order('updated_at',{ascending:false}).limit(20),
    supabase.from('marketing_posts').select('id',{count:'exact',head:true}).eq('status','ready'),
  ])

  const activeProjects=projects?.length||0
  const outstanding=(projects||[]).reduce((sum,p)=>sum+Math.max(0,(p.total_cents||0)-(p.paid_cents||0)),0)

  return <AdminShell active="/admin" role={profile.role}><div className="toprow"><div><h1>Operations</h1><p className="muted">Signed in as {profile.full_name||'PrimeCuts staff'}.</p></div><a className="btn" href="/book">+ New inquiry</a></div><div className="cards4"><div className="dashmetric"><span className="muted">Active projects</span><b>{activeProjects}</b></div><div className="dashmetric"><span className="muted">Outstanding</span><b>{money(outstanding)}</b></div><div className="dashmetric"><span className="muted">Open leads</span><b>{leadCount||0}</b></div><div className="dashmetric"><span className="muted">Content ready</span><b>{contentReady||0}</b></div></div><section style={{padding:'38px 0 0'}}><div className="eyebrow">Production pipeline</div><div className="pipeline">{pipeline.map(s=><div className="stage" key={s}>{s}</div>)}</div></section><section style={{padding:'34px 0 0'}}><div className="tablewrap"><table><thead><tr><th>Client</th><th>Project</th><th>Status</th><th>Total</th><th>Paid</th><th>Balance</th><th>Delivery</th></tr></thead><tbody>{projects?.length?projects.map(p=>{const rel=p.clients as unknown as {full_name?:string}|{full_name?:string}[]|null;const client=Array.isArray(rel)?rel[0]:rel;const due=Math.max(0,(p.total_cents||0)-(p.paid_cents||0));return <tr key={p.id}><td>{client?.full_name||'Client'}</td><td>{p.title}</td><td><span className="pill">{nice(p.status)}</span></td><td>{money(p.total_cents)}</td><td>{money(p.paid_cents)}</td><td>{money(due)}</td><td>{p.delivery_due_at?new Date(p.delivery_due_at).toLocaleDateString():'—'}</td></tr>}):<tr><td colSpan={7}><span className="muted">No active projects yet.</span></td></tr>}</tbody></table></div></section><section style={{padding:'34px 0 70px'}}><div className="two"><div className="panel"><div className="eyebrow">Equipment control</div><h3>{equipmentCount||0} assets · {rentableCount||0} rentable</h3><p className="muted">Equipment defaults to Internal Only.</p></div><div className="panel"><div className="eyebrow">Billing</div><h3>Tracking active. Processing off.</h3><p className="muted">Invoices and balances can be managed now. Online payment processing remains disabled.</p></div></div></section></AdminShell>
}
