export const oracleProgress = { inspected: false, assembled: false, verified: false, key: false, decrypted: false, response: false };
const hints = [
  ['Start with the blue page’s Save Mirror Kit button. It puts evidence in the desktop Terminal. Open that app, type help, and press Enter. Nothing here needs your real computer’s terminal.', 'In Terminal, ls lists the evidence files. cat README.txt reads the kit instructions. You can copy output with your normal copy shortcut. Start by understanding what the gate asks you to prove.'],
  ['Look at access.log. You need the successful challenge request for the visitor number printed on the page. HTTP status 200 means the request succeeded. But a successful favicon request is a distraction: check the visitor and /challenge path too.', 'Use cat to read the log, or grep to narrow it by visitor. Compare the path and status on each matching line; the stream label on the right is what you need next.'],
  ['The packet file is shuffled. Follow only the stream from that successful challenge. BAD checksums are damaged; repeated identical packets are not extra data.', 'The terminal has a reassemble command. help shows its arguments. Give it the packet filename and the stream you identified. It sorts byte offsets and ignores corrupt packets. Keep its hex output.'],
  ['Before decrypting, prove your assembled evidence is intact. Read manifest.txt. It tells you exactly which representation to hash.', 'Use sha256 on the assembled hex text and compare every character with the manifest. Hash the lowercase hex characters themselves, not their decoded bytes. No extra spaces.'],
  ['The stream’s key is hiding in dns.log. Match the record name to your stream and check whether its key is active. A newer record for a different stream does not help.', 'The TXT value is encoded, not encrypted. help includes a base64 decoder. Decode only the active value for your stream; save the resulting text as your XOR key.'],
  ['Now combine your authenticated packet payload with the decoded key. Repeating-key XOR reverses itself when the same key is applied.', 'Use the xor command with the assembled HEX first and the decoded ASCII key second. The output should be readable fields, not random symbols. If it is nonsense, revisit your key and stream.'],
  ['The decrypted message gives you two fields. The website still wants a response, not just the recovered fragment. Look carefully at its nonce:visitor:fragment formula.', 'Substitute your recovered values into that formula. Keep the visitor’s leading zero, use literal colons, and add no spaces. sha256 hashes the exact quoted string; submit the resulting digest on the blue page.'],
  ['You have produced the response. Copy the digest into the blue page’s 64-character response field and press Verify. Do not paste the decrypted message or the fragment alone.', 'If the gate rejects it, inspect the text you hashed: nonce first, visitor second, fragment last. Colons only; preserve case and the leading zero.'],
];
const counts = new Map<number, number>();
export function oracleGuidance(imported: boolean, solved: boolean) {
  if (solved) return 'You made it through. Record the fragment in service order. The last archive is your next destination.';
  const p = oracleProgress;
  const stage = p.response ? 7 : p.decrypted ? 6 : p.key ? 5 : p.verified ? 4 : p.assembled ? 3 : p.inspected ? 2 : imported ? 1 : 0;
  const count = counts.get(stage) ?? 0;
  counts.set(stage, count + 1);
  return hints[stage][Math.min(count, hints[stage].length - 1)];
}

