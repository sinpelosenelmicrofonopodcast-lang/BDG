import { AdminShell } from '@/components/AdminShell'
import { requireStaff } from '@/lib/auth'
import { updateEquipment } from './actions'

const nice=(value:string)=>value.replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase())
const dollars=(cents:number|null)=>cents==null?'':(cents/100).toFixed(2)
const statuses=['internal','available','reserved','rented','maintenance','retired']

export default async function EquipmentPage(){
  const {supabase,profile}=await requireStaff()
  const {data:equipment}=await supabase.from('equipment').select('id,name,category,status,rental_enabled,day_rate_cents,weekend_rate_cents,serial_number,notes').order('category').order('name')

  return <AdminShell active="/admin/equipment" role={profile.role}><div className="toprow"><div><h1>Equipment</h1><p className="muted">Internal by default. Rental visibility only turns on when you explicitly enable it.</p></div></div><section style={{paddingTop:24}}><div className="rentalgrid">{equipment?.map(item=><form className="rental" key={item.id} action={updateEquipment}><input type="hidden" name="id" value={item.id}/><span className="tag">{item.category||'Equipment'}</span><h3>{item.name}</h3><div className="field"><label>Status</label><select name="status" defaultValue={item.status}>{statuses.map(s=><option key={s} value={s}>{nice(s)}</option>)}</select></div><div className="field"><label style={{display:'flex',gap:8,alignItems:'center'}}><input name="rental_enabled" type="checkbox" defaultChecked={item.rental_enabled}/> Public rental enabled</label></div><div className="field"><label>Day rate</label><input name="day_rate" inputMode="decimal" defaultValue={dollars(item.day_rate_cents)} placeholder="0.00"/></div><div className="field"><label>Weekend rate</label><input name="weekend_rate" inputMode="decimal" defaultValue={dollars(item.weekend_rate_cents)} placeholder="0.00"/></div><button className="btn ghost" type="submit">Save equipment</button><p className="muted">{item.rental_enabled?'Visible on rentals when status is Available.':'Internal Only'}</p></form>)}</div></section></AdminShell>
}
