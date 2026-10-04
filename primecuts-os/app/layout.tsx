import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata={title:'Prime Cut Studios | PrimeCuts OS',description:'Photography, video, events, commercial production and client delivery in Central Texas.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
