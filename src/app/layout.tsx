import type { Metadata } from 'next';
import './globals.css';
import { siteUrl } from '../lib/data';
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl), title: { default: 'AI Radar — Your AI Intelligence Hub', template: '%s | AI Radar' },
  description: 'Track 20 global AI labs, models, coding agents, emerging tools, and free credits from official sources. Your AI intelligence hub, without the noise.',
  openGraph: { title: 'AI Radar — Your AI Intelligence Hub', description: '20 labs. One clear picture. Global AI signals from official sources.', locale: 'en_US', type: 'website', images: [{ url: '/og.svg', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: 'AI Radar — Your AI Intelligence Hub' }, icons: { icon: '/favicon.svg' }, robots: { index: true, follow: true }
};
const themeScript = "try{document.documentElement.dataset.theme=localStorage.getItem('radar-theme')||'dark'}catch(e){document.documentElement.dataset.theme='dark'}";
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }}/></head><body>{children}</body></html>; }
