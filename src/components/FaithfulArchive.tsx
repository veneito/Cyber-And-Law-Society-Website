import { useEffect, useState } from 'react';
import { archiveProgress, TRANSACTIONS, searchTransactions, importArchiveKit, VAULT_URL, FALSE_VAULT_URL } from './archivePuzzle';
import { inviteJunior } from './juniorMessages';
import './FaithfulArchive.css';

export function FaithfulArchive() {
 const [selected, setSelected] = useState<string | null>(null);
 const [search, setSearch] = useState('');
 const [visited, setVisited] = useState<string[]>([]);
 const [results, setResults] = useState<string[] | null>(null);
 const inspect = (id: string) => { setSelected(id); setVisited(value => value.includes(id) ? value : [...value, id]); if (id === 'tx-884-c') archiveProgress.traced = true; };
 useEffect(() => { archiveProgress.visited = true; inviteJunior(); }, []);
 const tx = TRANSACTIONS.find(transaction => transaction.id === selected);
 return <div className="faithful-site"><header><small>THE HOLLOW DAWN / FINANCIAL MIRROR 03</small><h1>THE FAITHFUL ARCHIVE</h1><span className="offering-seal">◬ THE LEDGER OF FLESH ◬</span><p>Money remembers what people delete.</p></header><nav><a href="#archive-notes">[ EVIDENCE NOTES ]</a><a href="#archive-ledger">[ BLOCK EXPLORER ]</a><a href="#archive-notes">[ WEBMASTER NOTES ]</a></nav><div className="faithful-notice">OFFLINE TRAINING LEDGER · fictional addresses, transactions and funds · no real wallet connection</div>
 <section id="archive-ledger"><h2>THE OFFERING TRACE / custodial surveillance</h2><div className="offering-watch"><span>◬</span><p>EVERY TRANSFER IS A VOW.<br />EVERY VOW LEAVES A WITNESS.</p><small>private ledger · query required · watcher online</small></div>{visited.length > 0 && <OfferingGraph selected={selected} visited={visited} inspect={inspect} />}<form onSubmit={e => { e.preventDefault(); const matches = searchTransactions(search); setResults(matches.map(item => item.id)); setVisited(value => [...new Set([...value, ...matches.map(item => item.id)])]); setSelected(matches.length === 1 ? matches[0].id : matches.length ? null : 'missing'); if (matches.some(item => item.id === 'tx-884-c')) archiveProgress.traced = true; }}><label htmlFor="ledger-search">Transaction ID or wallet address</label><div><input id="ledger-search" value={search} onChange={e => setSearch(e.target.value)} /><button>SEARCH</button></div></form>{results === null && <p className="offering-search-start">Open the receipt file in deity_drive. Search its sender wallet here to begin tracing.</p>}<div className="faithful-ledger">{TRANSACTIONS.filter(item => results?.includes(item.id)).map(item => <button key={item.id} onClick={() => { inspect(item.id); }}><b>{item.id}</b><span>{item.time}</span><small>{item.from}</small></button>)}</div>
 {selected === 'missing' && <p role="status">No cached transaction matches.</p>}{tx && <article className="faithful-transaction"><h3>{tx.id}</h3><p>{tx.time}</p><p>INPUT: {tx.from} / {tx.input.toLocaleString('en-US')} sat</p><h4>VESSELS / OUTPUTS</h4>{tx.outputs.map((output, index) => <div key={index}><span>vout {index} → {output.address}<br /><b>{output.value.toLocaleString('en-US')} sat</b></span>{output.spent ? <button onClick={() => { inspect(output.spent); }}>SPENT BY {output.spent} »</button> : <small>Unspent in this snapshot</small>}</div>)}<p>FEE: {tx.fee.toLocaleString('en-US')} sat</p>{tx.op && <><h4>THE INSCRIPTION / OP_RETURN hex</h4><code>{tx.op}</code><p>Non-spendable data. Decode in Terminal with <b>hex HEX_BYTES</b>.</p></>}</article>}</section>
 <section id="archive-notes"><h2>Notes taped to the monitor</h2><ul><li>Amounts are satoshis, not BTC. Every input equals outputs plus the fee.</li><li>The receipt uses local UTC-05:00; ledger/server times use UTC.</li><li>Change may return to a fresh address. Track the exact payment first; later returning outputs use the same sender address.</li><li>The final transaction may carry data instead of another payment lead.</li><li>Public mirrors can be forged. Preserve the original receipt and verify file hashes.</li></ul><button onClick={() => window.dispatchEvent(new CustomEvent("launch-app", { detail: "terminal" }))}>OPEN TERMINAL TOOLS</button><small>Use hex to decode transaction data. The hidden custody site holds the server snapshot.</small></section><footer>ANOTHER FINE HOMEPAGE ON THE SIGNAL WEBRING · 000041 visitors</footer></div>;
}
export function CustodyVault({ forged = false }: { forged?: boolean }) {
 const [mounted, setMounted] = useState(false);
 return <div className="custody-site"><header><small>{forged ? FALSE_VAULT_URL : VAULT_URL}</small><h1>Index of /{forged ? 'public-confession' : 'case/RELAY-884'}</h1></header>{forged ? <><p>PUBLIC MIRROR / CONFESSION</p><pre>receipt=HD-884;case=CLOSED;custodian=UNKNOWN</pre><p>The subject left voluntarily. Nothing remains to investigate.</p><p className="custody-warning">This mirror provides no original signed receipt. Compare its record with the original manifest; its content does not match.</p></> : <><p>Custody snapshot. Authentication damaged. Original ledger preserved.</p><table><thead><tr><th>Name</th><th>Last modified</th><th>State</th></tr></thead><tbody><tr><td>custodian.txt</td><td>28-Oct 00:00</td><td>VERIFY HASH</td></tr><tr><td>access.log / auth.log</td><td>29-Oct 03:24</td><td>RECOVERED</td></tr><tr><td>vessel.cfg</td><td>29-Oct 03:23</td><td>DELETED</td></tr><tr><td>disk.img</td><td>29-Oct 03:25</td><td>UNALLOCATED DATA</td></tr><tr><td>sealed.json</td><td>29-Oct 03:19</td><td>AES-256-GCM</td></tr></tbody></table><button onClick={() => { importArchiveKit(); setMounted(true); }}>{mounted ? 'REOPEN EVIDENCE IN TERMINAL' : 'SAVE SNAPSHOT TO TERMINAL'}</button><p>Read <b>archive/README.txt</b>. File times may be forged. The original receipt and event logs determine the key.</p></>}<footer>Apache/1.3.27 (forgotten) · evidence mirror · simulated service</footer></div>;
}




const mapNodes = [
 { id: 'tx-884-a', label: 'OFFERING 884', x: 15, y: 22 },
 { id: 'tx-884-b', label: 'RELAY VESSEL', x: 48, y: 22 },
 { id: 'tx-884-c', label: 'CUSTODY SEAL', x: 81, y: 22 },
 { id: 'tx-decoy', label: 'PUBLIC MIRROR', x: 48, y: 65 },
 { id: 'tx-unrelated', label: 'OFFERING 112', x: 81, y: 65 },
];
function OfferingGraph({ selected, visited, inspect }: { selected: string | null; visited: string[]; inspect: (id: string) => void }) {
 return <div className="offering-map" aria-label="Interactive transaction network"><div className="offering-map-label">FOLLOW THE OFFERING / SELECT A VESSEL</div><svg viewBox="0 0 800 280" preserveAspectRatio="none" aria-hidden="true">{visited.includes("tx-884-a") && visited.includes("tx-884-b") && <><path d="M120 90H384"/><text x="252" y="48" textAnchor="middle">150,000 sat</text></>}{visited.includes("tx-884-b") && visited.includes("tx-884-c") && <><path d="M384 90H648"/><text x="516" y="48" textAnchor="middle">120,000 sat</text></>}{visited.includes("tx-884-a") && visited.includes("tx-decoy") && <><path d="M120 90V210H384"/><text x="252" y="170" textAnchor="middle">849,000 sat</text></>}</svg>{mapNodes.filter(node=>visited.includes(node.id)).map(node=><button key={node.id} aria-pressed={selected===node.id} className={`${selected===node.id?'offering-current':''} ${visited.includes(node.id)?'offering-seen':''}`} style={{left:`${node.x}%`,top:`${node.y}%`}} onClick={()=>inspect(node.id)}><span>◈</span><b>{node.label}</b><small>{node.id}</small></button>)}<small className="offering-map-warning">Branches are evidence, not verdicts. Change is still money. Choose carefully.</small></div>;
}


