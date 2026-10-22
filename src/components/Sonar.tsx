import { lazy, Suspense } from "react";
const LibraryExplore = lazy(() => import("./LibraryExplore"));
type Ping = (x: number, y: number) => Promise<{ strength: number; found: boolean } | null>;
export function Sonar({ onPing, onKey }: { onPing: Ping; onKey: () => void }) {
  return <Suspense fallback={<p className="text-green-400">Loading library…</p>}><LibraryExplore onPing={onPing} onKey={onKey} /></Suspense>;
}
