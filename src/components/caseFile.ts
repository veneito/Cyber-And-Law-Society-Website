import { seen } from './caseSeen.ts';
import { archiveProgress } from './archivePuzzle.ts';
import { oracleSolved, acceptOracleResponse, ORACLE_RESPONSE } from './oraclePuzzle.ts';
import { rescueState, CARRIER } from './rescueChapter.ts';

// The Case File tab in Notes: what the player still needs to learn, in order. Each line unlocks as the
// game progresses and is checked against what the player types, so the notes "know" the evidence.
export type Field = { id: string; group: string; label: string; hint: string; lock: string; match: RegExp; example: string; open: () => boolean };
const always = () => true;
export const FIELDS: Field[] = [
  { id: 'a-victim', group: 'THE VICTIM', label: 'Missing woman', hint: 'The README names her.', lock: '', match: /julieta/, example: 'Julieta Dubois', open: always },
  { id: 'a-place', group: 'THE VICTIM', label: 'Last known location', hint: 'Her most recent post says where.', lock: '', match: /kauai|hawaii/, example: 'Kauai, Hawaii', open: always },
  { id: 'a-suspect', group: 'THE VICTIM', label: 'Prime suspect', hint: 'Who was last seen with her?', lock: '', match: /raphael/, example: 'Raphael Pierre', open: always },
  { id: 'b-group', group: 'THE CULT', label: 'Group behind the drive', hint: 'Raphael\'s post and the drive agree.', lock: 'Open the drive from her room first.', match: /hollowdawn/, example: 'The Hollow Dawn', open: () => seen.drive },
  { id: 'b-deity', group: 'THE CULT', label: 'What they worship', hint: 'It was your password.', lock: 'Open the drive from her room first.', match: /solace/, example: 'Solace', open: () => seen.drive },
  { id: 'c-1', group: 'THE KEY', label: 'Key fragment 1 (initiation)', hint: 'The receipt you get after the vow.', lock: 'Finish the initiation.', match: /^vesper$/, example: 'VESPER', open: () => seen.hollow },
  { id: 'c-2', group: 'THE KEY', label: 'Key fragment 2 (signal gate)', hint: 'Prove you can recover the message.', lock: 'Pass the signal gate.', match: /^morrow$/, example: 'MORROW', open: () => oracleSolved() },
  { id: 'c-3', group: 'THE KEY', label: 'Key fragment 3 (archive)', hint: 'Inside the sealed file.', lock: 'Open the sealed archive.', match: /^cinder$/, example: 'CINDER', open: () => archiveProgress.decrypted },
  { id: 'd-invoice', group: 'THE MONEY', label: 'Receipt number', hint: 'On the receipt in the drive.', lock: 'Find where the money went.', match: /^hd884$/, example: 'HD-884', open: () => archiveProgress.visited },
  { id: 'd-wallet', group: 'THE MONEY', label: 'Wallet that paid', hint: 'Search it in the ledger to begin the trace.', lock: 'Find where the money went.', match: /^bc1qdonor884$/, example: 'bc1q-donor-884', open: () => archiveProgress.visited },
  { id: 'd-final', group: 'THE MONEY', label: 'Transaction carrying the order note', hint: 'The last hop holds an inscription.', lock: 'Follow the payments to the end.', match: /^tx884c$/, example: 'tx-884-c', open: () => archiveProgress.traced },
  { id: 'd-purchase', group: 'THE MONEY', label: 'What was being bought', hint: 'Read the tags on each payment.', lock: 'Follow the payments to the end.', match: /vessel|body|shell/, example: 'A vessel', open: () => archiveProgress.traced },
  { id: 'e-custodian', group: 'THE ARCHIVE', label: 'Original custodian', hint: 'Only the record that matches the hash counts.', lock: 'Verify a record in the custody snapshot.', match: /pierre/, example: 'R. Pierre', open: () => archiveProgress.verified },
  { id: 'e-liar', group: 'THE ARCHIVE', label: 'Mirror that lied', hint: 'It offered a confession with no signed receipt.', lock: 'Save the custody snapshot.', match: /witness|vault2h7|public/, example: 'witness-vault2h7', open: () => archiveProgress.imported },
  { id: 'e-file', group: 'THE ARCHIVE', label: 'File recovered from the wiped disk', hint: 'The active one, not the revoked decoy.', lock: 'Recover something from the disk image.', match: /vessel/, example: 'vessel.cfg', open: () => archiveProgress.carved },
  { id: 'e-issued', group: 'THE ARCHIVE', label: 'Key issued at (UTC, from the log)', hint: 'The ISSUED line for your receipt.', lock: 'Recover something from the disk image.', match: /0314/, example: '2026-10-29T03:14:00Z', open: () => archiveProgress.carved },
  { id: 'f-image', group: 'THE PHOTO', label: 'Image with the original metadata', hint: 'The only one with a valid capsule.', lock: 'Scan the camera set.', match: /0214/, example: 'IMG_0214.png', open: () => rescueState.scanned.has(CARRIER) },
  { id: 'f-camera', group: 'THE PHOTO', label: 'Camera marker', hint: 'Read it in the Metadata Inspector.', lock: 'Inspect the verified image.', match: /^relay884$/, example: 'RELAY-884', open: () => rescueState.metadata },
  { id: 'f-gps', group: 'THE PHOTO', label: 'Verified coordinates', hint: 'Keep the minus sign.', lock: 'Inspect the verified image.', match: /1234567.*4567890/, example: '12.34567, -45.67890', open: () => rescueState.metadata },
  { id: 'g-accounts', group: 'DOES NOT ADD UP', label: 'When were these accounts really created?', hint: 'Compare her post dates with her profile.', lock: 'Spend time on the social network.', match: /oct(ober)?29|20261029|1029/, example: 'Oct 29, 2026', open: () => seen.glimmr },
  { id: 'g-feed', group: 'DOES NOT ADD UP', label: 'What is the live feed really?', hint: 'Watch the frames change. Does anything move?', lock: 'Watch the stream.', match: /same|one(image|picture)|render|still|ascii|fake/, example: 'One image re-rendered', open: () => seen.stream },
  { id: 'g-gps', group: 'DOES NOT ADD UP', label: 'What is odd about the coordinates?', hint: 'Read the digits. Read the error radius.', lock: 'Inspect the verified image.', match: /sequen|count|inorder|too(perfect|neat|clean)|pattern|fake/, example: 'The digits are sequential', open: () => rescueState.metadata },
  { id: 'g-time', group: 'DOES NOT ADD UP', label: 'What do the receipt, the ledger and the key log share?', hint: 'Convert the receipt to UTC, then compare all three.', lock: 'Save the custody snapshot.', match: /same|identical|exact|second|0314|031400/, example: 'The exact same second, 03:14:00 UTC', open: () => archiveProgress.imported },
  { id: 'g-record', group: 'DOES NOT ADD UP', label: 'Which record has a false date?', hint: 'Check the directory listing.', lock: 'Save the custody snapshot.', match: /custodian|backdate|oct28|1028/, example: 'custodian.txt is backdated', open: () => archiveProgress.imported },
  { id: 'g-helpers', group: 'DOES NOT ADD UP', label: 'Who always knew your next step?', hint: 'Who writes to you right after each new site?', lock: 'Accept help from someone.', match: /whitehat|junior|jr/, example: 'Mr.WhiteHat and HatWhiteJr', open: () => seen.helpers },
];
export const GROUPS = [...new Set(FIELDS.map(field => field.group))];

const STORAGE_KEY = 'cls-case-file-v1';
let answers: Record<string, string> = {};
try { const raw = typeof localStorage === 'undefined' ? null : localStorage.getItem(STORAGE_KEY); if (raw) answers = JSON.parse(raw) as Record<string, string>; } catch { /* Fall back to this session only. */ }
const norm = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '');
export const getAnswer = (id: string) => answers[id] ?? '';
export function setAnswer(id: string, text: string) {
  answers = { ...answers, [id]: text };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(answers)); } catch { /* Keep the session copy. */ }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('case-progress'));
}
export const confirmed = (field: Field) => field.open() && field.match.test(norm(getAnswer(field.id)));
export const confirmedFields = () => FIELDS.filter(confirmed);
export const nextLead = () => FIELDS.find(field => field.open() && !confirmed(field));
// Dev preview only: open every lock and fill in the whole case file.
export function devFillCaseFile() {
  for (const key of Object.keys(seen) as (keyof typeof seen)[]) seen[key] = true;
  Object.assign(archiveProgress, { visited: true, traced: true, imported: true, verified: true, carved: true, decrypted: true });
  Object.assign(rescueState, { drive: true, metadata: true });
  rescueState.scanned.add(CARRIER); acceptOracleResponse(ORACLE_RESPONSE);
  for (const field of FIELDS) answers[field.id] = field.example;
  answers = { ...answers };
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('case-progress'));
}

// The final trial: each charge is answered by presenting the one exhibit from the player's own case file that disproves it.
export type Charge = { id: string; title: string; claim: string; proof: string[]; rebuttal: string };
export const CHARGES: Charge[] = [
  { id: 'abduction', title: 'COUNT 1 / ABDUCTION', claim: 'The defendant abducted Julieta Dubois, a physician assistant last seen with them in Kauai. Exhibit P1: her profile, seven photographs from 2024 to 2026.', proof: ['g-accounts', 'g-feed'], rebuttal: 'Every Glimmr account, hers included, was created on the same day. A woman with a 2024 graduation photo cannot have joined in 2026. Her history was written in one sitting.' },
  { id: 'presence', title: 'COUNT 2 / PRESENCE AT THE SCENE', claim: 'The defendant\'s own device reported the coordinates 12.34567, -45.67890. Exhibit P2: the original camera record.', proof: ['g-gps'], rebuttal: 'The digits count upward and the error radius is zero. No receiver on Earth reports that. The coordinates were typed, not measured, and they land in open water.' },
  { id: 'financing', title: 'COUNT 3 / FINANCING', claim: 'The defendant paid for the vessel at 03:14:00 UTC. Exhibit P3: the signed receipt HD-884 and the ledger.', proof: ['g-time'], rebuttal: 'The receipt, the ledger and the server\'s key log agree to the exact second. Independent systems never do. One author wrote all three.' },
  { id: 'tampering', title: 'COUNT 4 / TAMPERING', claim: 'The defendant deleted, recovered and altered server records. Exhibit P4: the terminal history and recovered/vessel.cfg.', proof: ['g-record'], rebuttal: 'The custodian record\'s date was backdated, and the "deleted" configuration sat intact, waiting to be carved. The evidence was planted for you to find.' },
  { id: 'conspiracy', title: 'COUNT 5 / CONSPIRACY', claim: 'The defendant acted alone and planned every step. Exhibit P5: access.log, visitor 041.', proof: ['g-helpers'], rebuttal: 'Two helpers appeared seconds after each site opened and always knew your next move. They are the same hand that wrote the cult. You were steered.' },
];
export const exhibitProves = (charge: Charge, fieldId: string) => charge.proof.includes(fieldId) && confirmedFields().some(field => field.id === fieldId);
