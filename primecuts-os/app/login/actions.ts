'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const next = String(formData.get('next') || '/client')

  if (!email || email.length > 254 || !email.includes('@')) {
    redirect(`/login?error=invalid-email&next=${encodeURIComponent(next)}`)
  }

  const headerStore = await headers()
  const origin = headerStore.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || ''
  const supabase = await createClient()
  const emailRedirectTo = origin
    ? `${origin}/auth/confirm?next=${encodeURIComponent(next)}`
    : undefined

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo,
    },
  })

  if (error) {
    redirect(`/login?error=send-failed&next=${encodeURIComponent(next)}`)
  }

  redirect(`/login?sent=1&email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`)
}
