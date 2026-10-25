import { t as tr } from '../i18n/language';

type Contact = { x: number; y: number; distance: number };
export default function LibraryRadar({ usb, dog, dogFloor, floor, heat }: { usb: Contact; dog: Contact; dogFloor: number; floor: number; heat: number }) {
  const bearing = Math.atan2(usb.x - 50, 50 - usb.y) * 180 / Math.PI;
  const pulseDuration = `${2 - heat * 1.3}s`;
  return <div aria-label={tr('Directional radar')} className="pointer-events-none absolute bottom-3 right-3 w-36 rounded border border-green-700 bg-black/95 p-2 font-mono text-green-400">
    <p className="text-center text-[9px]">{tr('AHEAD')}</p>
    <svg viewBox="0 0 100 100" className="w-full" aria-hidden>
      <circle cx="50" cy="50" r="46" fill="#001509" stroke="#176637" />
      <circle cx="50" cy="50" r="23" fill="none" stroke="#103c25" />
      <path d="M4 50H96M50 4V96" stroke="#176637" />
      <path d="M50 45L46 55L54 55Z" fill="#e5fff0" />
      <circle cx="50" cy="50" r="12" fill="none" stroke="#54ffc0" className="library-sonar-pulse" style={{ animationDuration: pulseDuration }} />
      <g transform={`rotate(${bearing} 50 50)`} className="library-sonar-bearing" style={{ animationDuration: pulseDuration }}>
        <path d="M34 13Q50 5 66 13" fill="none" stroke="#54ffc0" strokeWidth="3" />
        <path d="M46 18L50 12L54 18" fill="none" stroke="#b0ffe1" strokeWidth="1.5" />
      </g>
      <circle cx={dog.x} cy={dog.y} r="3.5" fill="#ff4545" />
    </svg>
    <p className="text-[9px] text-emerald-200">{tr('SIGNAL BEARING')} · F2 {floor === 0 ? '↑' : ''}</p>
    <p className="mt-1 text-[9px] text-red-400">● {tr('HUNTER')} {dog.distance.toFixed(1)}m · F{dogFloor} {dogFloor > floor + 1 ? '↑' : dogFloor < floor + 1 ? '↓' : ''}</p>
    <p className="mt-1 text-[9px]">50m · {Math.round(heat * 100)}% {tr('SIGNAL')}</p>
  </div>;
}

export function LibraryRespawn({ progress }: { progress: number }) {
  const percent = Math.floor(progress * 100);
  const message = 'PS > ' + tr('Connection lost. Respawning in room 181…');
  return <div role="status" aria-label={tr('Respawning')} className="absolute inset-0 flex items-center justify-center bg-black p-5 font-mono text-green-300">
    <div className="w-full max-w-md rounded border border-green-900 p-4 text-sm">
      <p className="mb-5 text-neutral-500">PowerShell // SONAR RECOVERY</p>
      <p className="min-h-12 whitespace-pre-wrap">{message.slice(0, 5 + Math.floor(progress * message.length * 2))}<span aria-hidden>▌</span></p>
      <p className="my-4 text-xs" aria-hidden>[{'█'.repeat(Math.floor(progress * 20))}{'░'.repeat(20 - Math.floor(progress * 20))}] {percent}%</p>
      <div role="progressbar" aria-label={tr('Respawning')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="h-2 bg-green-950"><div className="h-full bg-green-400" style={{ width: percent + '%' }} /></div>
      <p className="mt-4 text-xs text-neutral-400">{tr('Hunter reset: floor 2 // safe restart')}</p>
    </div>
  </div>;
}
