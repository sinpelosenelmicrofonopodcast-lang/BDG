'use server'

import { revalidatePath } from 'next/cache'
import { requireStaff } from '@/lib/auth'

const statuses=new Set(['internal','available','reserved','rented','maintenance','retired'])
const cents=(value:FormDataEntryValue|null)=>{const n=Number(String(value||'').replace(/[^0-9.]/g,''));return Number.isFinite(n)&&n>=0?Math.round(n*100):null}

export async function updateEquipment(formData:FormData){
  const id=String(formData.get('id')||'')
  const status=String(formData.get('status')||'internal')
  if(!id||!statuses.has(status)) return

  const rentalEnabled=formData.get('rental_enabled')==='on'
  const dayRate=cents(formData.get('day_rate'))
  const weekendRate=cents(formData.get('weekend_rate'))
  const {supabase}=await requireStaff()

  await supabase.from('equipment').update({
    status,
    rental_enabled:rentalEnabled,
    day_rate_cents:rentalEnabled?dayRate:null,
    weekend_rate_cents:rentalEnabled?weekendRate:null,
  }).eq('id',id)

  revalidatePath('/admin/equipment')
  revalidatePath('/rentals')
  revalidatePath('/admin')
}
