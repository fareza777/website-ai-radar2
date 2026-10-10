import { RadarApp } from '../components/radar-app';
import { getData } from '../lib/data';
export default async function HomePage() { return <RadarApp data={await getData()} initialNow={new Date().toISOString()}/>; }
