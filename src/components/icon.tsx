import type { CSSProperties } from 'react';
export function Icon({ name, size = 18, style }: { name: string; size?: number; style?: CSSProperties }) {
  const paths: Record<string, React.ReactNode> = {
    radar: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/><path d="m12 12 6-6"/></>,
    today: <><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M7 2v4m10-4v4M3 9h18m-14 4h3m4 0h3m-10 4h3"/></>,
    labs: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    discover: <><circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5 5-3Z"/></>,
    deals: <><path d="M3 4h8l10 10-7 7L3 10V4Z"/><circle cx="7" cy="8" r="1"/></>,
    saved: <path d="M6 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-6-4-6 4V4Z"/>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5"/>, external: <><path d="M14 3h7v7m0-7L10 14"/><path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/></>,
    spark: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/><path d="m20 2 .5 1.5L22 4l-1.5.5L20 6l-.5-1.5L18 4l1.5-.5L20 2Z"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></>,
    moon: <path d="M20.5 14.5A9 9 0 0 1 9.5 3.5a9 9 0 1 0 11 11Z"/>,
    check: <path d="m5 12 4 4L19 6"/>, filter: <><path d="M3 5h18M6 12h12M9 19h6"/><circle cx="8" cy="5" r="2" fill="currentColor" stroke="none"/><circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    github: <><path d="M9 20v-3c-4 .5-4-2-5-2m11 5v-3c0-1-.2-1.5-.7-2 3-.3 5-1.4 5-5 0-1-.4-2-1-2.5.3-1 .3-2 0-3-2 0-3 1-3 1a12 12 0 0 0-7 0s-1-1-3-1c-.3 1-.3 2 0 3-.6.5-1 1.5-1 2.5 0 3.6 2 4.7 5 5-.5.5-.7 1-.7 2v3"/></>,
    chevron: <path d="m9 5 7 7-7 7"/>, close: <path d="m6 6 12 12M6 18 18 6"/>, menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
    signal: <><path d="M4 18v-3m5 3V11m5 7V7m5 11V3"/></>, refresh: <><path d="M20 7V3l-3 3a8 8 0 1 0 3 12M20 3h-5"/></>,
    bolt: <path d="m13 2-8 12h6l-1 8 9-13h-6l0-7Z"/>,
    globe: <><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>{paths[name] || paths.radar}</svg>;
}
