import { useEffect, useState } from "react";
import { t as tr } from "../i18n/language";
import { vpn } from "./VpnApp";

export const ONION_SITES = [
  { url: "hollowdawn7q2ixv.onion", title: "The Hollow Dawn" },
  { url: "solace-oracle4fj9kz.onion", title: "Solace Speaks" },
  { url: "ashfall3m8vtq.onion", title: "The Faithful Archive" },
];

export function TorApp() {
  const [url, setUrl] = useState("");
  const [page, setPage] = useState<string | null>(null); // null = start page, "" = not found, "vpn" = blocked, else a site url
  useEffect(() => { // dropping the VPN kicks an open page back to the blocked notice
    const kick = () => setPage(p => (p === null ? p : "vpn"));
    window.addEventListener("vpn-off", kick);
    return () => window.removeEventListener("vpn-off", kick);
  }, []);
  const go = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vpn.connected) { setPage("vpn"); return; } // links only open through the VPN
    const typed = url.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
    setPage(ONION_SITES.some(s => s.url === typed) ? typed : "");
  };
  const site = ONION_SITES.find(s => s.url === page);
  return (
    <div className="-m-4 flex h-[calc(100%+2rem)] flex-col font-sans text-sm">
      <form onSubmit={go} className="flex shrink-0 items-center gap-2 border-b border-neutral-800 bg-neutral-900 px-2 py-1.5">
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder={tr("Search or enter an .onion address")} aria-label={tr("Address")} spellCheck={false} className="min-w-0 flex-1 rounded-full bg-black px-3 py-1 font-mono text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline focus:outline-[#bca4b8]" />
      </form>
      <div className="min-h-0 flex-1 overflow-auto bg-[#11140f] p-6 text-center text-neutral-300">
        {page === null && <p className="mt-10 text-neutral-500">{tr("Connected to the Tor network. Enter an .onion address to browse.")}</p>}
        {page === "vpn" && <p role="alert" className="mt-10 text-red-400">{tr("Your connection is not protected. Connect to a VPN before opening onion links.")}</p>}
        {page === "" && <p className="mt-10 text-red-400">{tr("Unable to connect to the onionsite. It may be offline.")}</p>}
        {site && <><h2 className="mt-8 font-mono text-lg text-[#bca4b8]">{site.title}</h2><p className="mt-2 text-neutral-500">{tr("This hidden service is not built yet.")}</p></>}
      </div>
    </div>
  );
}
