import Link from 'next/link'
import type { ReactNode } from 'react'

const nav=[
  ['Dashboard','/admin'],
  ['Leads','/admin/leads'],
  ['Projects','/admin/projects'],
  ['Equipment','/admin/equipment'],
  ['Rentals','/admin/rentals'],
  ['Marketing','/admin/marketing'],
  ['Catalog','/admin/catalog'],
]

export function AdminShell({children,active,role}:{children:ReactNode;active:string;role:string}){
  return <main className="admin"><aside className="sidebar"><div className="brand"><span className="brandmark">PRIME CUT</span><span className="brandsub">STUDIOS · OS</span></div><div style={{height:26}}/>{nav.map(([label,href])=><Link key={href} href={href} className={`sideitem ${active===href?'active':''}`}>{label}</Link>)}<div style={{height:20}}/><form action="/auth/signout" method="post"><button className="sideitem" type="submit">Sign out</button></form></aside><section className="adminmain"><div className="eyebrow">PrimeCuts OS · {role}</div>{children}</section></main>
}
