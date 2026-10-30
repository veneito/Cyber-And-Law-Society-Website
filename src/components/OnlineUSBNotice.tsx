import { t as tr } from '../i18n/language';

export function OnlineUSBNotice() {
  return <aside className="my-4 rounded-lg border-2 border-green-400/70 bg-green-950/40 p-4 text-sm text-green-100">
    <p className="font-mono font-bold uppercase tracking-wide text-green-300">{tr('Playing online? Use the officer.')}</p>
    <p className="mt-2">{tr('Stay on this website. You do not need to visit Marx Library, find a real USB drive, or upload a physical e-signature file.')}</p>
    <p className="mt-2">{tr('Find the USB in the library simulation and remember its floor and the item underneath it. Choose Dispatch the officer, give those directions, then verify the USB the officer retrieves for you online.')}</p>
  </aside>;
}
