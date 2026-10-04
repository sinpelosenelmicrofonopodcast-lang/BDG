import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const STAFF_ROLES = new Set(['owner','admin','producer','editor','finance'])

export async function requireStaff() {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub

  if (!userId) redirect('/login?next=/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name,role')
    .eq('id', String(userId))
    .maybeSingle()

  if (!profile || !STAFF_ROLES.has(profile.role)) redirect('/client')

  return { supabase, profile, userId: String(userId) }
}
