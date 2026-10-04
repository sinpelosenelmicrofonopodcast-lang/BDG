'use server'

import { revalidatePath } from 'next/cache'
import { requireStaff } from '@/lib/auth'

const statuses=new Set(['inquiry','quote','contract','deposit','pre_production','scheduled','shooting','editing','client_review','final','delivered','archived'])

export async function updateProjectStatus(formData:FormData){
  const id=String(formData.get('id')||'')
  const status=String(formData.get('status')||'')
  if(!id||!statuses.has(status)) return
  const {supabase}=await requireStaff()
  await supabase.from('projects').update({status,updated_at:new Date().toISOString()}).eq('id',id)
  revalidatePath('/admin/projects')
  revalidatePath('/admin')
}
