import { AdminShell } from '@/components/AdminShell'
import { requireStaff } from '@/lib/auth'
import { updateProjectStatus } from './actions'

const money=(cents:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format((cents||0)/100)
const nice=(value:string)=>value.replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase())
const statuses=['inquiry','quote','contract','deposit','pre_production','scheduled','shooting','editing','client_review','final','delivered','archived']

export default async function ProjectsPage(){
  const {supabase,profile}=await requireStaff()
  const {data:projects}=await supabase.from('projects').select('id,title,status,event_date,location,total_cents,paid_cents,delivery_due_at,marketing_allowed,clients(full_name,email)').order('updated_at',{ascending:false}).limit(100)

  return <AdminShell active="/admin/projects" role={profile.role}><div className="toprow"><div><h1>Projects</h1><p className="muted">Move work through the production pipeline without spreadsheets.</p></div></div><section style={{paddingTop:24}}><div className="tablewrap"><table><thead><tr><th>Client</th><th>Project</th><th>Shoot</th><th>Total</th><th>Balance</th><th>Delivery</th><th>Status</th></tr></thead><tbody>{projects?.length?projects.map(project=>{const rel=project.clients as unknown as {full_name?:string;email?:string|null}|{full_name?:string;email?:string|null}[]|null;const client=Array.isArray(rel)?rel[0]:rel;const balance=Math.max(0,(project.total_cents||0)-(project.paid_cents||0));return <tr key={project.id}><td><b>{client?.full_name||'Client'}</b><div className="muted">{client?.email||''}</div></td><td><b>{project.title}</b><div className="muted">{project.location||'Location pending'}</div></td><td>{project.event_date?new Date(project.event_date).toLocaleDateString():'—'}</td><td>{money(project.total_cents)}</td><td>{money(balance)}</td><td>{project.delivery_due_at?new Date(project.delivery_due_at).toLocaleDateString():'—'}</td><td><form action={updateProjectStatus} style={{display:'flex',gap:8,alignItems:'center'}}><input type="hidden" name="id" value={project.id}/><select name="status" defaultValue={project.status}>{statuses.map(s=><option key={s} value={s}>{nice(s)}</option>)}</select><button className="pill" type="submit">Save</button></form></td></tr>}):<tr><td colSpan={7}><span className="muted">No projects yet.</span></td></tr>}</tbody></table></div></section></AdminShell>
}
