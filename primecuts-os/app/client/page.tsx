import { redirect } from 'next/navigation'
import { SiteHeader } from '@/components/SiteHeader'
import { Footer } from '@/components/Footer'
import { createClient } from '@/lib/supabase/server'

const money=(cents:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format((cents||0)/100)
const nice=(value:string)=>value.replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase())

export default async function Client(){
  const supabase=await createClient()
  const {data:claimsData}=await supabase.auth.getClaims()
  const userId=claimsData?.claims?.sub
  if(!userId) redirect('/login?next=/client')

  const {data:client}=await supabase.from('clients').select('id,full_name,email,phone').eq('auth_user_id',String(userId)).order('created_at',{ascending:false}).limit(1).maybeSingle()

  if(!client){return <><SiteHeader/><main><div className="shell pagehero"><div className="eyebrow">Client portal</div><h1>Your account is secure.</h1><p className="muted">No PrimeCuts client record is linked to this email yet. Once a project is matched to your verified email it will appear here automatically.</p><form action="/auth/signout" method="post"><button className="btn" type="submit">Sign out</button></form></div></main><Footer/></>}

  const {data:projects}=await supabase.from('projects').select('id,title,status,event_date,location,total_cents,paid_cents,delivery_due_at,created_at').eq('client_id',client.id).order('created_at',{ascending:false})
  const project=projects?.[0]

  if(!project){return <><SiteHeader/><main><div className="shell pagehero"><div className="eyebrow">Client portal</div><h1>Welcome, {client.full_name}.</h1><p className="muted">Your account is linked. There are no active projects in the portal yet.</p><form action="/auth/signout" method="post"><button className="btn" type="submit">Sign out</button></form></div></main><Footer/></>}

  const [{data:deliverables},{data:invoices},{data:contracts}]=await Promise.all([
    supabase.from('deliverables').select('id,name,kind,status,drive_url,client_visible,delivered_at').eq('project_id',project.id).eq('client_visible',true).order('created_at'),
    supabase.from('invoices').select('id,number,status,amount_cents,due_at').eq('project_id',project.id).order('created_at',{ascending:false}),
    supabase.from('contracts').select('id,status,signed_at,signer_name').eq('project_id',project.id).order('created_at',{ascending:false}),
  ])

  const balance=Math.max(0,(project.total_cents||0)-(project.paid_cents||0))
  const progressMap:Record<string,number>={inquiry:5,quote:12,contract:20,deposit:28,pre_production:38,scheduled:48,shooting:58,editing:70,client_review:82,final:92,delivered:100,archived:100}
  const progress=progressMap[project.status]||10

  return <><SiteHeader/><main><div className="shell pagehero"><div className="eyebrow">Client portal</div><h1>{client.full_name} · {project.title}</h1><p className="muted">Everything tied to your project, without exposing PrimeCuts' Google Drive backend.</p></div><section style={{paddingTop:15}}><div className="shell clienthero"><div className="panel"><div className="eyebrow">Project status</div><h3>{nice(project.status)}</h3><div className="progress"><span style={{width:`${progress}%`}}/></div><p className="muted">{project.event_date?`Shoot: ${new Date(project.event_date).toLocaleDateString()}`:'Shoot date pending'}{project.delivery_due_at?` · Estimated delivery ${new Date(project.delivery_due_at).toLocaleDateString()}`:''}</p><div className="delivery">{deliverables?.length?deliverables.map(d=><div className="deliverable" key={d.id}><div><b>{d.name}</b><div className="muted">{d.kind?nice(d.kind):'Deliverable'}</div></div>{d.drive_url&&d.status==='delivered'?<a className="pill" href={d.drive_url} target="_blank" rel="noreferrer">Open</a>:<span className="pill">{nice(d.status)}</span>}</div>):<div className="note">Deliverables will appear here as PrimeCuts marks them client-ready.</div>}</div></div><div className="panel"><div className="eyebrow">Account</div><h3>Project summary</h3><p><b>Total</b><br/><span className="muted">{money(project.total_cents)}</span></p><p><b>Recorded paid</b><br/><span className="muted">{money(project.paid_cents)}</span></p><p><b>Balance</b><br/><span className="muted">{money(balance)} · online payments disabled</span></p><p><b>Contract</b><br/><span className="muted">{contracts?.[0]?nice(contracts[0].status):'Not issued yet'}</span></p><p><b>Invoices</b><br/><span className="muted">{invoices?.length||0} on file</span></p><form action="/auth/signout" method="post"><button className="btn ghost" type="submit">Sign out</button></form></div></div></section>{projects&&projects.length>1&&<section><div className="shell"><div className="eyebrow">Other projects</div><div className="rentalgrid">{projects.slice(1).map(p=><div className="rental" key={p.id}><span className="tag">{nice(p.status)}</span><h3>{p.title}</h3><p className="muted">{p.event_date?new Date(p.event_date).toLocaleDateString():'Date pending'}</p></div>)}</div></div></section>}</main><Footer/></>}
