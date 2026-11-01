import { runArchiveCommand, archiveProgress } from "./archivePuzzle.ts";
import { oracleProgress } from "./oracleGuidance.ts";
export const ORACLE_FRAGMENT = 'MORROW';
export const ORACLE_RESPONSE = '69b097d113b6491ef7d450eb1f424bd536a52fd2b6d5641e1bb6a4142fed1cd1';
export const ORACLE_FILES: Record<string, string> = {
  'README.txt': `SOLACE SPEAKS // MIRROR KIT 041
These files are captured evidence, not live network access.
1. Find the successful /challenge request belonging to visitor 041 in access.log.
2. Recover that stream's payload from packets.log. Sequence numbers are BYTE offsets.
   Ignore BAD checksums and other streams. Identical retransmissions count once.
3. Check the SHA-256 of the assembled lowercase HEX TEXT against manifest.txt.
4. Find the latest non-expired TXT key for this stream in dns.log. Decode its base64.
5. Decrypt payload using repeating-key XOR with that decoded ASCII key.
6. Extract the fragment and nonce. The page requests a challenge response, NOT the fragment.
   Reply = SHA256(nonce:visitor:fragment), UTF-8, no spaces or trailing newline.
Type help for supported terminal commands. Everything stays in this simulation.`,
  'access.log': `03:11:01 visitor=099 GET /challenge status=200 stream=2F
03:11:03 visitor=041 GET /challenge status=403 stream=9C
03:11:05 visitor=041 GET /favicon.ico status=200 stream=1B
03:11:08 visitor=041 GET /challenge status=200 stream=7A
03:11:12 visitor=041 GET /challenge status=429 stream=4D`,
  'dns.log': `serial=11 name=_key.7a TXT=U0lMRU5DRQ== state=EXPIRED
serial=14 name=_key.2f TXT=TUFTSw== state=ACTIVE
serial=13 name=_key.7a TXT=Vk9JRA== state=EXPIRED
serial=14 name=_key.7a TXT=RUNITw== state=ACTIVE
serial=15 name=_key.9c TXT=RkFMU0U= state=ACTIVE`,
  'packets.log': `stream=7A seq=0016 checksum=OK hex=2b2c262c207e7f7c
stream=2F seq=0000 checksum=OK hex=66616c73652d7369676e616c
stream=7A seq=0008 checksum=BAD hex=780e071d170c1f75
stream=7A seq=0024 checksum=OK hex=7172
stream=9C seq=0000 checksum=OK hex=6e6f742d746869732d6f6e65
stream=7A seq=0000 checksum=OK hex=233129282826263b
stream=7A seq=0008 checksum=OK hex=780e071d170c1f74
stream=7A seq=0000 checksum=OK hex=233129282826263b`,
  'manifest.txt': `FORMAT: SHA256 of assembled lowercase hex text; no newline
stream=7A sha256=be715536b02776b3ebb95476578a0d97e76d3535d8206beb8a6e7367aff49a4a
VISITOR: 041
RESPONSE FORMAT: SHA256(nonce:visitor:fragment)
The fragment is not a valid response by itself.`,
};
let imported = false;
let solved = false;
export const oracleImported = () => imported;
export const oracleSolved = () => solved;
export function importOracleKit() { imported = true; window.dispatchEvent(new Event('oracle-kit')); window.dispatchEvent(new CustomEvent('launch-app', { detail: 'terminal' })); }
export function acceptOracleResponse(response: string) {
  if (response.trim().toLowerCase() !== ORACLE_RESPONSE) return false;
  solved = true;
  return true;
}
export async function sha256(text: string) {
  const result = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(result)].map(value => value.toString(16).padStart(2, '0')).join('');
}
export function reassemble(log: string, stream: string) {
  const chunks = new Map<number, string>();
  for (const line of log.split('\n')) {
    const match = /^stream=(\w+) seq=(\d+) checksum=OK hex=([a-f0-9]+)$/i.exec(line);
    if (!match || match[1].toUpperCase() !== stream.toUpperCase()) continue;
    const offset = Number(match[2]), hex = match[3].toLowerCase();
    if (hex.length % 2) throw new Error('Malformed hex payload.');
    if (chunks.has(offset) && chunks.get(offset) !== hex) throw new Error('Conflicting retransmissions.');
    chunks.set(offset, hex);
  }
  if (!chunks.size) throw new Error('No valid packets for that stream.');
  let offset = 0, payload = '';
  for (const [sequence, hex] of [...chunks].sort((a, b) => a[0] - b[0])) {
    if (sequence !== offset) throw new Error(`Missing or overlapping data at byte ${offset}.`);
    payload += hex; offset += hex.length / 2;
  }
  return payload;
}
export function xorDecode(hex: string, key: string) {
  if (!/^(?:[a-f0-9]{2})+$/i.test(hex) || !key) throw new Error('Usage: xor HEX ASCII_KEY');
  const bytes = new TextEncoder().encode(key);
  return new TextDecoder().decode(Uint8Array.from(hex.match(/../g)!, (pair, index) => parseInt(pair, 16) ^ bytes[index % bytes.length]));
}
const HELP = `Virtual terminal — no system commands or internet access.
help                          show commands
ls                            list imported files
cat FILE                      read a file
grep "TEXT" FILE              filter lines (case-insensitive)
reassemble FILE STREAM        join valid packets in byte order
base64 TEXT                   decode a base64 string
hex TEXT                      decode hexadecimal as UTF-8
xor HEX ASCII_KEY             repeating-key XOR decrypt
sha256 "TEXT"                 hash exact text (no newline)
clear                         clear terminal
Up / Down                     recall previous commands
Use quotes around text with spaces. Copy outputs for the next command.`;
async function executeOracleCommand(command: string, ready = oracleImported()) {
  if (command.length > 4096) return 'ERROR: command too long.';
  const parts = command.trim().match(/"[^"]*"|'[^']*'|\S+/g)?.map(part => part.replace(/^(["'])(.*)\1$/, '$2')) ?? [];
  const [name, ...args] = parts;
  if (!name) return '';
  if (name === 'help') return HELP;
  if (name === 'clear') return '';
  if (!ready) return 'No evidence imported. Open Solace Speaks in Tor and save its mirror kit.';
  const file = (path: string) => { if (!Object.hasOwn(ORACLE_FILES, path)) throw new Error('File not found. Use ls.'); return ORACLE_FILES[path]; };
  try {
    switch (name) {
      case 'ls': return Object.keys(ORACLE_FILES).join('\n');
      case 'cat': if (args.length !== 1) throw new Error('Usage: cat FILE'); return file(args[0]);
      case 'grep': if (args.length !== 2) throw new Error('Usage: grep "TEXT" FILE'); return file(args[1]).split('\n').filter(line => line.toLowerCase().includes(args[0].toLowerCase())).join('\n') || '(no matches)';
      case 'reassemble': if (args.length !== 2) throw new Error('Usage: reassemble FILE STREAM'); return reassemble(file(args[0]), args[1]);
      case 'base64': if (args.length !== 1) throw new Error('Usage: base64 TEXT'); return atob(args[0]);
      case 'hex': if (args.length !== 1 || !/^(?:[a-f0-9]{2})+$/i.test(args[0])) throw new Error('Usage: hex HEX_BYTES'); return new TextDecoder().decode(Uint8Array.from(args[0].match(/../g)!, pair => parseInt(pair, 16)));
      case 'xor': if (args.length !== 2) throw new Error('Usage: xor HEX ASCII_KEY'); return xorDecode(args[0], args[1]);
      case 'sha256': if (args.length !== 1) throw new Error('Usage: sha256 "TEXT"'); return sha256(args[0]);
      default: return `Unknown command: ${name}. Type help.`;
    }
  } catch (error) { return `ERROR: ${error instanceof Error ? error.message : 'Unable to decode input.'}`; }
}

export async function runOracleCommand(command: string, ready = oracleImported()) {
  if (command.trim() === "help") return (await executeOracleCommand(command, ready)) + "\n\nArchive tools: sha256file FILE | strings FILE | carve IMAGE NAME | decrypt FILE \"PASSPHRASE\"\nArchive evidence uses archive/ paths; recovered files use recovered/.";
  const archiveResult = await runArchiveCommand(command);
  if (archiveResult !== null) return command.trim() === "ls" && ready ? Object.keys(ORACLE_FILES).join("\n") + "\n" + archiveResult : archiveResult;
  const result = await executeOracleCommand(command, ready || archiveProgress.imported || /^(hex|base64|sha256)\s/.test(command.trim()));
  if (ready && !result.startsWith('ERROR:')) {
    if (/^(cat|grep)\s/.test(command.trim()) && command.includes('access.log') && result.includes('stream=7A')) oracleProgress.inspected = true;
    if (command.trim().startsWith('reassemble ') && result === reassemble(ORACLE_FILES['packets.log'], '7A')) oracleProgress.assembled = true;
    if (command.trim().startsWith('sha256 ') && result === 'be715536b02776b3ebb95476578a0d97e76d3535d8206beb8a6e7367aff49a4a') oracleProgress.verified = true;
    if (command.trim().startsWith('base64 ') && result === 'ECHO') oracleProgress.key = true;
    if (command.trim().startsWith('xor ') && result === 'fragment=MORROW;nonce=7341') oracleProgress.decrypted = true;
    if (command.trim().startsWith('sha256 ') && result === ORACLE_RESPONSE) oracleProgress.response = true;
  }
  return result;
}


