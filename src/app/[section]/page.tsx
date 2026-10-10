import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RadarApp } from '../../components/radar-app';
import { getData } from '../../lib/data';
const sections = ['labs', 'discover', 'deals', 'saved'] as const;
export const dynamicParams = false;
export function generateStaticParams() { return sections.map(section => ({ section })); }
export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> { const { section } = await params; return { title: section === 'labs' ? 'AI Labs Hub' : section === 'discover' ? 'Opportunity Radar' : section === 'deals' ? 'Deals & Free Credits' : 'Saved', alternates: { canonical: `/${section}` }, ...(section === 'saved' ? { robots: { index: false } } : {}) }; }
export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) { const { section } = await params; if (!sections.some(s => s === section)) notFound(); return <RadarApp data={await getData()} view={section as typeof sections[number]} initialNow={new Date().toISOString()}/>; }
