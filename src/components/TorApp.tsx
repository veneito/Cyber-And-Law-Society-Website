import { SolaceStream } from "./SolaceStream";
import { STREAM_URL } from "./rescueChapter";
import { primeMessageAudio } from "./whitehatAudio";
import { FaithfulArchive, CustodyVault } from "./FaithfulArchive";
import { VAULT_URL, FALSE_VAULT_URL } from "./archivePuzzle";
import { SolaceOracle } from "./SolaceOracle";
import "./GlimmrLikes.css";
import { HollowDawn } from "./HollowDawn";
import { useCallback, useEffect, useRef, useState } from "react";
import { t as tr } from "../i18n/language";
import { vpn } from "./VpnApp";

export const ONION_SITES = [
  { url: "hollowdawn7q2ixv.onion", title: "The Hollow Dawn" },
  { url: "solace-oracle4fj9kz.onion", title: "Solace Speaks" },
  { url: "ashfall3m8vtq.onion", title: "The Faithful Archive" },
];

export function TorApp() {
  const nextId = useRef(2);
  const [tabs, setTabs] = useState([{ id: 1, title: 'New tab' }]);
  const [active, setActive] = useState(1);
  const reportTitle = useCallback((id: number, title: string) => setTabs(previous => previous.some(tab => tab.id === id && tab.title !== title) ? previous.map(tab => tab.id === id ? { ...tab, title } : tab) : previous), []);
  const add = () => { const id = nextId.current++; setTabs(previous => [...previous, { id, title: 'New tab' }]); setActive(id); };
  const close = (id: number) => {
    if (tabs.length === 1) { const fresh = nextId.current++; setTabs([{ id: fresh, title: 'New tab' }]); setActive(fresh); return; }
    const index = tabs.findIndex(tab => tab.id === id), remaining = tabs.filter(tab => tab.id !== id);
    setTabs(remaining); if (active === id) setActive(remaining[Math.min(index, remaining.length - 1)].id);
  };
  return <div className="-m-4 flex h-[calc(100%+2rem)] flex-col bg-neutral-950">
    <div className="flex shrink-0 items-center gap-1 border-b border-neutral-700 bg-[#19151f] p-1">
      <div role="tablist" aria-label="Tor browser tabs" className="flex min-w-0 flex-1 gap-1 overflow-x-auto">{tabs.map(tab => <div key={tab.id} className={`flex shrink-0 items-center rounded-t border border-neutral-700 ${active === tab.id ? 'bg-[#30263b]' : 'bg-[#17131c]'}`}><button role="tab" id={`tor-tab-${tab.id}`} aria-controls={`tor-panel-${tab.id}`} aria-selected={active === tab.id} onClick={() => setActive(tab.id)} className="max-w-40 truncate px-3 py-2 text-left text-[10px] text-neutral-200">{tab.title}</button><button aria-label={`Close tab ${tab.title}`} onClick={() => close(tab.id)} className="px-2 py-1 text-xs text-neutral-400 hover:text-white">×</button></div>)}</div>
      <button aria-label="New Tor tab" title="New tab" onClick={add} className="shrink-0 rounded px-3 py-1 text-lg text-[#d0b3df] hover:bg-neutral-800">+</button>
    </div>
    {tabs.map(tab => <div key={tab.id} id={`tor-panel-${tab.id}`} role="tabpanel" aria-labelledby={`tor-tab-${tab.id}`} style={{ display: active === tab.id ? 'flex' : 'none' }} className="min-h-0 flex-1 flex-col"><TorPage id={tab.id} reportTitle={reportTitle} /></div>)}
  </div>;
}

function TorPage({ id, reportTitle }: { id: number; reportTitle: (id: number, title: string) => void }) {
  const [url, setUrl] = useState("");
  const [page, setPage] = useState<string | null>(null); // null = start page, "" = not found, "vpn" = blocked, else a site url
  const [pending, setPending] = useState<{ url: string; request: number } | null>(null);
  const request = useRef(0);
  const pageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => {
      setPage(vpn.connected ? pending.url : "vpn");
      setPending(null);
      pageRef.current?.scrollTo({ top: 0 });
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [pending]);
  useEffect(() => { // dropping the VPN kicks an open page back to the blocked notice
    const kick = () => { setPending(null); setPage("vpn"); };
    window.addEventListener("vpn-off", kick);
    return () => window.removeEventListener("vpn-off", kick);
  }, []);
  const go = (e: React.FormEvent) => {
    e.preventDefault(); primeMessageAudio();
    if (!vpn.connected) { setPending(null); setPage("vpn"); return; } // links only open through the VPN
    const typed = url.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
    setPending({ url: ONION_SITES.some(s => s.url === typed) || typed === VAULT_URL || typed === FALSE_VAULT_URL || typed === STREAM_URL ? typed : "", request: ++request.current });
  };
  const site = !pending && ONION_SITES.find(s => s.url === page);
  useEffect(() => { reportTitle(id, pending ? "Loading…" : ONION_SITES.find(site => site.url === page)?.title ?? (page === null ? "New tab" : page === "vpn" ? "Connection blocked" : page || "Unavailable")); }, [id, page, pending, reportTitle]);
  return (
    <div className="flex min-h-0 flex-1 flex-col font-sans text-sm">
      <form onSubmit={go} className="flex shrink-0 items-center gap-2 border-b border-neutral-800 bg-neutral-900 px-2 py-1.5">
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder={tr("Search or enter an .onion address")} aria-label={tr("Address")} spellCheck={false} className="min-w-0 flex-1 rounded-full bg-black px-3 py-1 font-mono text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline focus:outline-[#bca4b8]" />
      </form>
      <div className="relative h-0.5 shrink-0 overflow-hidden bg-neutral-800" aria-hidden="true">{pending && <div key={pending.request} className="glimmr-page-progress h-full w-full origin-left bg-gradient-to-r from-[#a98acb] to-[#ddbadf]" />}</div>
      <div ref={pageRef} aria-busy={pending !== null} className={`min-h-0 flex-1 overflow-auto text-center text-neutral-300 ${!pending && page === ONION_SITES[0].url ? "bg-[#100305]" : !pending && page === ONION_SITES[1].url ? "bg-[#bacce0]" : !pending && (page === ONION_SITES[2].url || page === VAULT_URL || page === FALSE_VAULT_URL || page === STREAM_URL) ? "bg-[#110d05]" : "bg-[#11140f] p-6"}`}>
        {pending && <p role="status" className="mt-10 font-mono text-xs text-[#bca4b8]">Establishing onion connection…</p>}
        {!pending && page === null && <p className="mt-10 text-neutral-500">{tr("Connected to the Tor network. Enter an .onion address to browse.")}</p>}
        {!pending && page === "vpn" && <p role="alert" className="mt-10 text-red-400">{tr("Your connection is not protected. Connect to a VPN before opening onion links.")}</p>}
        {!pending && page === "" && <p className="mt-10 text-red-400">{tr("Unable to connect to the onionsite. It may be offline.")}</p>}
        {!pending && page === STREAM_URL && <SolaceStream />}
        {!pending && page === VAULT_URL && <CustodyVault />}
        {!pending && page === FALSE_VAULT_URL && <CustodyVault forged />}
        {site && (site.url === ONION_SITES[0].url ? <HollowDawn /> : site.url === ONION_SITES[1].url ? <SolaceOracle /> : site.url === ONION_SITES[2].url ? <FaithfulArchive /> : <><h2 className="mt-8 font-mono text-lg text-[#bca4b8]">{site.title}</h2><p className="mt-2 text-neutral-500">{tr("This hidden service is not built yet.")}</p></>)}
      </div>
    </div>
  );
}






