import { NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/public'

function clean(value: FormDataEntryValue | null, max: number) {
  return String(value || '').trim().slice(0, max)
}

export async function POST(request: Request) {
  const form = await request.formData()
  const name = clean(form.get('name'), 120)
  const email = clean(form.get('email'), 254).toLowerCase()
  const phone = clean(form.get('phone'), 50)
  const service = clean(form.get('service'), 160)
  const eventDate = clean(form.get('date'), 10)
  const location = clean(form.get('location'), 300)
  const details = clean(form.get('details'), 5000)

  const redirectUrl = new URL('/book', request.url)

  if (!name || !email || !email.includes('@')) {
    redirectUrl.searchParams.set('error', 'invalid')
    return NextResponse.redirect(redirectUrl, 303)
  }

  try {
    const supabase = createPublicClient()
    const clientId = crypto.randomUUID()

    const { error: clientError } = await supabase.from('clients').insert({
      id: clientId,
      full_name: name,
      email,
      phone: phone || null,
      auth_user_id: null,
      company: null,
      notes: null,
    })

    if (clientError) throw clientError

    const { error: leadError } = await supabase.from('leads').insert({
      client_id: clientId,
      status: 'new',
      service: service || null,
      event_date: eventDate || null,
      location: location || null,
      details: details || null,
      source: 'website',
    })

    if (leadError) throw leadError

    redirectUrl.searchParams.set('submitted', '1')
    const response = NextResponse.redirect(redirectUrl, 303)
    response.cookies.set('primecuts_last_inquiry', name, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 3600,
      secure: process.env.NODE_ENV === 'production',
    })
    return response
  } catch (error) {
    console.error('PrimeCuts inquiry error', error)
    redirectUrl.searchParams.set('error', 'save')
    return NextResponse.redirect(redirectUrl, 303)
  }
}
