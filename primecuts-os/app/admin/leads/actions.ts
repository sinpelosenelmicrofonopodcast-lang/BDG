'use server'

import { revalidatePath } from 'next/cache'
import { requireStaff } from '@/lib/auth'

const statuses=new Set(['new','qualified','quoted','won','lost','archived'])

export async function updateLeadStatus(formData:FormData){
  const id=String(formData.get('id')||'')
  const status=String(formData.get('status')||'')
  if(!id||!statuses.has(status)) return
  const {supabase}=await requireStaff()
  await supabase.from('leads').update({status}).eq('id',id)
  revalidatePath('/admin/leads')
  revalidatePath('/admin')
}
