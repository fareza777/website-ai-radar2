import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { labs } from '../../../config/labs';
import { RadarApp } from '../../../components/radar-app';
import { getData } from '../../../lib/data';
export const dynamicParams = false;
export function generateStaticParams() { return labs.map(lab => ({ slug: lab.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const lab = labs.find(l => l.slug === slug); return { title: lab ? `${lab.name} — Update Timeline` : 'Lab not found', description: lab ? `All ${lab.name} updates: ${lab.tagline}. Official-source timeline, practical context, and clear English summaries.` : undefined, alternates: { canonical: `/labs/${slug}` } }; }
export default async function LabPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; if (!labs.some(l => l.slug === slug)) notFound(); return <RadarApp data={await getData()} view="labs" labSlug={slug} initialNow={new Date().toISOString()}/>; }
