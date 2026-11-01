import { rescueState } from "./rescueChapter.ts";
export const VAULT_URL = 'cinder-relay9x4.onion';
export const FALSE_VAULT_URL = 'witness-vault2h7.onion';
export const archiveProgress = { visited: false, traced: false, imported: false, verified: false, carved: false, decrypted: false };
export const TRANSACTIONS = [
 { id: 'tx-884-a', time: '2026-10-29 03:14:00 UTC', input: 1000000, from: 'bc1q-donor-884', outputs: [{ address: 'bc1q-relay-a', value: 150000, spent: 'tx-884-b' }, { address: 'bc1q-donor-change', value: 849000, spent: 'tx-decoy' }], fee: 1000, op: '' },
 { id: 'tx-884-b', time: '2026-10-29 03:16:12 UTC', input: 150000, from: 'bc1q-relay-a', outputs: [{ address: 'bc1q-relay-a', value: 29000, spent: '' }, { address: 'bc1q-custody', value: 120000, spent: 'tx-884-c' }], fee: 1000, op: '' },
 { id: 'tx-884-c', time: '2026-10-29 03:19:41 UTC', input: 120000, from: 'bc1q-custody', outputs: [{ address: 'bc1q-relay-sink', value: 115000, spent: '' }, { address: 'bc1q-custody', value: 4000, spent: '' }], fee: 1000, op: '63696e6465722d72656c61793978342e6f6e696f6e7c52454c41592d383834' },
 { id: 'tx-decoy', time: '2026-10-29 03:17:11 UTC', input: 849000, from: 'bc1q-donor-change', outputs: [{ address: 'bc1q-public-mirror', value: 848000, spent: '' }], fee: 1000, op: '7769746e6573732d7661756c743268372e6f6e696f6e7c434f4e46455353494f4e' },
 { id: 'tx-unrelated', time: '2026-10-29 03:14:00 UTC', input: 180000, from: 'bc1q-donor-112', outputs: [{ address: 'bc1q-public-mirror', value: 150000, spent: '' }, { address: 'bc1q-other-change', value: 29000, spent: '' }], fee: 1000, op: '' },
];
const SEALED = { salt: 'aG9sbG93LWFyY2hpdmUtODg0', iv: 'Y2luZGVyLXJlbGF5', data: '6KghqTJPTpxfV7GPOlz5haHbtgNAML3Nj9RTcN9+4ywRp2cKpv+kMwZMaN3kV50Fotx5thcPbCgvjqHSabj4VBfOdIcmP65AjbEJq5i4mkvUYaF6uKc6dHmU1u/2ef80+/Qf5Dtn72YLfoUD8Vs5Y+lb1ZgDVcdyw0UqOhHUFH0mOZTSO376Kj0c1cY7VcjOMRY7bETYEkEpAYVPkBbpe9Y/z2h/lYxYiGqTPLaF4hjVYyuNG1CFmImRy+ngwEar16auujRSOwN85P2TRK8iXO99nHDjmXC3CW2Uu8k0lyB7GG2LKhhJ4ufIEpEBoJhJWl4WAsYp3WDDzRgfRQaIOcwH3xpG3EeO8fplBXKx7Fa3Gpu5TbQ8t2AoHfhsD4O8C/zW9rUSq7ZJXuwhCdUFIbUlEZ6cYtffbUIbmyhND4zv8O7H/jF7ZB1AR3GCkEwJRAGrllC8jhPUG4s7rujUfmGDg8OWajfngjtnsImVjf8nudUwBCdca6QG1r0Ihj719X+NRRzA2K8jGsDmLyGq88ZjV5YRZwklfwBWtVtOYmQbN//25MetxCatumQJRJjMEjA10nEcr8B0GkXic34eCi8idMZ97aH+yRV3IJqxDXc=' };
export const ARCHIVE_FILES: Record<string, string> = {
 'archive/README.txt': `RELAY-884 / CUSTODY SNAPSHOT\nThis is simulated evidence. No real disks or wallets are accessed.\nRead archive/manifest.txt and the logs. File modification times are not trustworthy.\nUse sha256file FILE to verify the custodian record against the original ledger.\nstrings FILE extracts printable strings from a damaged image.\ncarve IMAGE NAME recovers an exact BEGIN_FILE / END_FILE record.\ncat recovered/NAME reads a carved file.\nDecrypt archive/sealed.json with: decrypt FILE "PASSPHRASE"\nAES-256-GCM, PBKDF2-SHA256, 120000 iterations; salt and IV are in sealed.json.\nThe recovered configuration specifies the exact passphrase formula.\nThe archive site's receipt uses UTC-05:00. Server logs use UTC. Convert carefully.`,
 'archive/manifest.txt': 'ORIGINAL LEDGER / HD-884\narchive/custodian.txt sha256=c856ef9afaa5405d6936aed31c170295a8d63710cd028d8e78cffdd262ec2ff6\nA confession from another mirror is not an original ledger. Verify before trusting it.',
 'archive/forged.txt': 'receipt=HD-884;case=CLOSED;custodian=UNKNOWN',
 'archive/custodian.txt': 'receipt=HD-884;case=RELAY-884;custodian=R.Pierre',
 'archive/access.log': '2026-10-29T03:19:41Z GET /case/RELAY-884 status=200\n2026-10-29T03:22:00Z POST /mirror/confession status=201 origin=PUBLIC-COPY\n2026-10-29T03:23:18Z DELETE /config/vessel.cfg status=204\n2026-10-29T03:24:07Z GET /case/RELAY-884/sealed.json status=200',
 'archive/auth.log': '2026-10-29T03:14:00Z receipt=HD-884 actor=custodian key_event=ISSUED\n2026-10-29T03:20:00Z receipt=HD-112 actor=mirror key_event=ISSUED\n2026-10-29T03:23:18Z actor=custodian action=SCRUB_CONFIG',
 'archive/directory.txt': 'mtime=2026-10-28T00:00:00Z custodian.txt (timestamp backdated)\nmtime=2026-10-29T03:19:41Z sealed.json\nmtime=2026-10-29T03:23:18Z vessel.cfg [DELETED]\nmtime=2026-10-29T03:25:00Z disk.img',
 'archive/disk.img': '\u0000\u0001unallocated::7F\u0000CACHE=dummy\u0000BEGIN_FILE old.cfg\nsalt=ASH\nstate=REVOKED\nEND_FILE\u0000garbage::99\u0000BEGIN_FILE vessel.cfg\nstate=ACTIVE\nkey_salt=EMBER\nformula=receipt|issued_at_utc|key_salt\ntimestamp_format=YYYY-MM-DDTHH:mm:ssZ\ncase=RELAY-884\nEND_FILE\u0000\u0002END_OF_IMAGE',
 'archive/sealed.json': JSON.stringify({ algorithm: 'AES-256-GCM', kdf: 'PBKDF2-SHA256', iterations: 120000, ...SEALED }, null, 2),
};
export const recoveredFiles: Record<string, string> = {};
export function importArchiveKit() { archiveProgress.imported = true; window.dispatchEvent(new Event('oracle-kit')); window.dispatchEvent(new CustomEvent('launch-app', { detail: 'terminal' })); }
const bytes = (base64: string) => Uint8Array.from(atob(base64), char => char.charCodeAt(0));
export async function archiveHash(text: string) { return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))].map(value => value.toString(16).padStart(2, '0')).join(''); }
export async function decryptArchive(phrase: string) {
 const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(phrase), 'PBKDF2', false, ['deriveKey']);
 const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: bytes(SEALED.salt), iterations: 120000, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
 return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes(SEALED.iv) }, key, bytes(SEALED.data)));
}
export async function runArchiveCommand(command: string): Promise<string | null> {
 const parts = command.trim().match(/"[^"]*"|'[^']*'|\S+/g)?.map(part => part.replace(/^(["'])(.*)\1$/, '$2')) ?? [];
 const [name, ...args] = parts;
 if (name === 'help') return null;
 if (!archiveProgress.imported) return null;
 const files = { ...ARCHIVE_FILES, ...recoveredFiles };
 const read = (path: string) => { if (!Object.hasOwn(files, path)) throw new Error('Archive file not found. Use ls.'); return files[path]; };
 try {
  if (name === 'ls') return Object.keys(files).join('\n');
  if ((name === 'cat' || name === 'grep') && args.at(-1)?.match(/^(archive|recovered)\//)) {
   if (name === 'cat' && args.length === 1) return read(args[0]);
   if (name === 'grep' && args.length === 2) return read(args[1]).split('\n').filter(line => line.toLowerCase().includes(args[0].toLowerCase())).join('\n') || '(no matches)';
   throw new Error('Usage: cat FILE or grep "TEXT" FILE');
  }
  if (name === 'sha256file') { if (args.length !== 1) throw new Error('Usage: sha256file FILE'); const digest = await archiveHash(read(args[0])); if (args[0] === 'archive/custodian.txt' && digest === 'c856ef9afaa5405d6936aed31c170295a8d63710cd028d8e78cffdd262ec2ff6') archiveProgress.verified = true; return digest; }
  if (name === 'strings') { if (args.length !== 1) throw new Error('Usage: strings FILE'); return read(args[0]).match(/[\x20-\x7e]{4,}/g)?.join('\n') ?? '(no printable records)'; }
  if (name === 'carve') { if (args.length !== 2 || !/^[a-z0-9.-]+$/i.test(args[1])) throw new Error('Usage: carve IMAGE NAME'); const image = read(args[0]); const start = image.indexOf(`BEGIN_FILE ${args[1]}\n`); if (start < 0) throw new Error('No matching file header. Inspect strings first.'); const body = start + `BEGIN_FILE ${args[1]}\n`.length; const end = image.indexOf('\nEND_FILE', body); if (end < 0) throw new Error('File footer missing.'); const path = `recovered/${args[1]}`; recoveredFiles[path] = image.slice(body, end); if (args[1] === 'vessel.cfg') archiveProgress.carved = true; return `Recovered ${path}. Use cat ${path}`; }
  if (name === 'decrypt') { if (args.length !== 2 || args[0] !== 'archive/sealed.json') throw new Error('Usage: decrypt archive/sealed.json "PASSPHRASE"'); let plaintext: string; try { plaintext = await decryptArchive(args[1]); } catch { throw new Error('Authentication failed. Wrong passphrase, field order, or timestamp.'); } archiveProgress.decrypted = true; recoveredFiles['recovered/case.txt'] = plaintext; return plaintext + '\nSaved to recovered/case.txt'; }
  return null;
 } catch (error) { return `ERROR: ${error instanceof Error ? error.message : 'Archive operation failed.'}`; }
}
export function archiveGuidance() {
 const p = archiveProgress;
 if (p.decrypted) {
  if (rescueState.police) return 'The in-game response team has the package. The simulated investigation is complete.';
  if (rescueState.location) return 'The stream confirmed your location. Open dispatch_drive in Files using that same decimal GPS pair, then send the in-game evidence package.';
  if (rescueState.metadata) return 'Keep the exact decimal GPS pair, including the negative longitude. Enter it in the stream public chat and send. The moderator verifies it against the recovered metadata.';
  if (rescueState.drive) return 'Read READ_FIRST.txt in case_drive. Scan the placeholder photos using StegoSuite, find the valid original EXIF capsule, then inspect that same image in Metadata Inspector. Reject the invalid-checksum record.';
  return 'CINDER is password fragment 3, not the entire combined key. Use all three fragments in service order with hyphens to open case_drive. The decrypted message also contains the new livestream address; open it in another Tor tab.';
 }
 if (p.carved) return 'The active recovered configuration tells you the key formula. Match its receipt to the key-issued event in auth.log. Convert the original receipt time from UTC-05:00 to UTC; midnight may change the date. Join exact fields with vertical bars and use decrypt on the sealed file.';
 if (p.verified) return 'The server log mentions a deleted configuration. Inspect printable records in the disk image with strings, then carve the exact active filename. The revoked configuration is a decoy.';
 if (p.imported) return 'Start with the archive README and original manifest. sha256file checks the custodian record. Compare receipt identifiers and server events; a modified file date is not proof of when an event happened.';
 if (p.traced) return 'Decode the transaction’s OP_RETURN hex using the Terminal hex command. It contains an onion address and a case identifier. Open that address in Tor; compare the identifier before trusting the mirror.';
 return 'Use the receipt’s sender, exact amount and UTC-adjusted time to find the first transfer. Follow the payment output through its spending transaction. An output returning to the sender address is change, not your next lead. Do not simply choose the largest output.';
}



export function searchTransactions(query: string) { const term = query.trim().toLowerCase(); return term ? TRANSACTIONS.filter(item => item.id.toLowerCase() === term || item.from.toLowerCase() === term || item.outputs.some(output => output.address.toLowerCase() === term)) : []; }

