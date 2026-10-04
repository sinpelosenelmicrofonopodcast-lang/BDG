import {NextResponse} from 'next/server';
export async function POST(request:Request){const form=await request.formData();const name=String(form.get('name')||'Client');const url=new URL('/book?submitted=1',request.url);const response=NextResponse.redirect(url,303);response.cookies.set('primecuts_last_inquiry',name,{httpOnly:true,sameSite:'lax',maxAge:3600});return response}
