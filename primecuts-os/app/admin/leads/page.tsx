import { AdminShell } from '@/components/AdminShell'
import { requireStaff } from '@/lib/auth'
import { updateLeadStatus } from './actions'

const nice=(value:string)=>value.replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase())

export default async function LeadsPage(){
  const {supabase,profile}=await requireStaff()
  const {data:leads}=await supabase.from('leads').select('id,status,service,event_date,location,details,source,created_at,clients(full_name,email,phone)').order('created_at',{ascending:false}).limit(100)

  return <AdminShell active="/admin/leads" role={profile.role}><div className="toprow"><div><h1>Leads</h1><p className="muted">Web inquiries land here automatically.</p></div><a className="btn" href="/book">+ New inquiry</a></div><section style={{paddingTop:24}}><div className="tablewrap"><table><thead><tr><th>Client</th><th>Service</th><th>Date</th><th>Location</th><th>Source</th><th>Status</th></tr></thead><tbody>{leads?.length?leads.map(lead=>{const rel=lead.clients as unknown as {full_name?:string;email?:string|null;phone?:string|null}|{full_name?:string;email?:string|null;phone?:string|null}[]|null;const client=Array.isArray(rel)?rel[0]:rel;return <tr key={lead.id}><td><b>{client?.full_name||'Unknown'}</b><div className="muted">{client?.email||''}{client?.phone?` · ${client.phone}`:''}</div></td><td>{lead.service||'Custom'}</td><td>{lead.event_date?new Date(`${lead.event_date}T12:00:00`).toLocaleDateString():'—'}</td><td>{lead.location||'—'}</td><td>{lead.source||'—'}</td><td><form action={updateLeadStatus} style={{display:'flex',gap:8,alignItems:'center'}}><input type="hidden" name="id" value={lead.id}/><select name="status" defaultValue={lead.status}>{['new','qualified','quoted','won','lost','archived'].map(s=><option key={s} value={s}>{nice(s)}</option>)}</select><button className="pill" type="submit">Save</button></form></td></tr>}):<tr><td colSpan={6}><span className="muted">No leads yet.</span></td></tr>}</tbody></table></div></section></AdminShell>
}
