import { primeMessageAudio, whitehatPing } from "./whitehatAudio.ts";
import { archiveProgress, archiveGuidance } from './archivePuzzle.ts';
import { oracleImported, oracleSolved } from './oraclePuzzle.ts';
import { oracleGuidance } from './oracleGuidance.ts';
export type MysteryMessage = { from: 'investigator' | 'mysterious'; text: string; attachment?: boolean };
let invited = false;
let invitationScheduled = false;
let pendingReplies = 0;
const messages: MysteryMessage[] = [];
export const mysteriousInvited = () => invited;
export const mysteryMessages = () => [...messages];
export const whitehatTyping = () => pendingReplies > 0;
const changed = () => window.dispatchEvent(new Event('mystery-chat'));
let nextReplyAt = 0;
function later(text: string, attachment = false) {
  nextReplyAt = Math.max(Date.now(), nextReplyAt) + 2500;
  const delay = nextReplyAt - Date.now();
  pendingReplies++;
  window.setTimeout(() => { messages.push({ from: 'mysterious', text, attachment }); pendingReplies--; if (!pendingReplies) nextReplyAt = 0; whitehatPing(); changed(); }, delay);
}
export function inviteMysterious() {
  if (invited || invitationScheduled) return;
  invitationScheduled = true; primeMessageAudio();
  window.setTimeout(() => {
  invited = true;
  whitehatPing();
  messages.push({ from: 'mysterious', text: 'Hey, I noticed you got into the website.' });
  later("I've dealt with this cult before. I can help you make sense of what they left behind.");
  later('If you need help navigating, I can show you how I deciphered it with a document. Just send me — help.');
  window.dispatchEvent(new CustomEvent('launch-app', { detail: 'browser' }));
  window.dispatchEvent(new Event('mysterious-dm'));
  }, 3000);
}
export function sendMysteryMessage(text: string) {
  primeMessageAudio();
  const input = text.trim().slice(0, 500);
  if (!input || !invited) return;
  messages.push({ from: 'investigator', text: input });
  if (/^help[.!?]*$/i.test(input)) {
    const guidance = archiveProgress.visited ? archiveGuidance() : oracleGuidance(oracleImported(), oracleSolved());
    later("Here are my field notes. They explain the reasoning, not the answers. Take it one step at a time.\n\n" + guidance, true);
  } else later('Send help and I will share my notes. Read them, try a step in Terminal, then ask again if you need another nudge.');
  changed();
}


