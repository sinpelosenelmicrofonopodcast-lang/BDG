import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const tokenHash = params.get('token_hash')
  const type = params.get('type') as EmailOtpType | null
  const code = params.get('code')
  const next = params.get('next') || '/client'
  const supabase = await createClient()

  let error: unknown = null

  if (code) {
    const result = await supabase.auth.exchangeCodeForSession(code)
    error = result.error
  } else if (tokenHash && type) {
    const result = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    error = result.error
  } else {
    error = new Error('Missing authentication token')
  }

  const target = request.nextUrl.clone()
  target.search = ''
  target.pathname = error ? '/login' : next.startsWith('/') ? next : '/client'
  if (error) target.searchParams.set('error', 'auth-failed')

  return NextResponse.redirect(target)
}
