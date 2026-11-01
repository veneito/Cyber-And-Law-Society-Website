import { archiveProgress, archiveGuidance } from './archivePuzzle.ts';
let walletHints = 0;
const timeHint = 'Time check: UTC-05:00 is five hours behind UTC. Add five hours to the receipt clock. If you pass midnight, move the date forward too. Example only: Monday 21:30 at UTC-05:00 becomes Tuesday 02:30 UTC. Now do the same with YOUR receipt, then compare the ledger time.';
const changeHint = 'Think of change like paying at a shop. Example only: spend an input of 50,000 sat; pay someone 12,000, get 37,000 back, and pay a 1,000 fee. The 37,000 is not another purchase. In this puzzle’s later transfers, compare each output address with the INPUT address: the one returning to that same address is change. Inspect the other output’s SPENT BY link.';
export function juniorGuidance(topic: string) {
 if (/\btime\b/i.test(topic)) return timeHint;
 if (/\bchange\b/i.test(topic)) return changeHint;
 if (/\btrace\b/i.test(topic)) return 'Click a transaction node, then scroll BELOW the map. That opens its evidence panel. Read INPUT, then each OUTPUT’s address and amount. SPENT BY opens the next transaction that spent that exact output. The boxes on the map alone are not the whole clue. Keep following the payment until its evidence panel contains OP_RETURN.';
 if (archiveProgress.imported || archiveProgress.traced) return archiveGuidance() + (archiveProgress.traced && !archiveProgress.imported ? '\n\nYou can select and copy the complete OP_RETURN string from the evidence panel. Open Terminal, consult help for the hex decoder, and give that decoder the copied string. The result contains an address and a case identifier separated by a vertical bar. Only the address belongs in Tor’s address bar.' : '');
 const hints = [
 'Start with the receipt file inside deity_drive, not the graph. Write down its SENDER, PAYMENT and ISSUED time. Then click a transaction and scroll below the map to read its INPUT address and timestamp. Find the one matching the receipt’s sender AND converted time. You do not need Terminal yet. Send help time if the clock conversion is confusing.',
 timeHint,
 'Once the starting transaction matches the receipt, inspect its OUTPUTS below the map. Find the output matching the receipt’s PAYMENT amount. Click the SPENT BY button beside THAT output. The larger output may be money returned to the sender; following the biggest number is not the rule.',
 changeHint,
 'Repeat at the next transfer: read its INPUT address and compare it with the OUTPUT addresses. Ignore the returning change and follow the other spent payment. The payment can get smaller as money is retained or fees are paid. It does not need to keep matching the original receipt amount forever.',
 'Your stopping clue is OP_RETURN in a transaction’s lower evidence panel. This is a data inscription, not a payment. Copy its full hex string and use the Terminal’s hex decoder. Then open only the decoded onion address in a new Tor tab, keeping the ledger tab open for reference.',
 ];
 return hints[Math.min(walletHints++, hints.length - 1)] + '\n\nYou can also send help trace, help time, or help change for a focused explanation.';
}

