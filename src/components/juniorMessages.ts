import { juniorGuidance } from './juniorGuidance.ts';
import { whitehatPing, primeMessageAudio } from './whitehatAudio.ts';
export type JuniorMessage = { from: 'investigator' | 'mysterious'; text: string; attachment?: boolean };
let invitationScheduled = false;
let invited = false, pending = 0, nextAt = 0;
const messages: JuniorMessage[] = [];
export const juniorInvited = () => invited;
export const juniorMessages = () => [...messages];
export const juniorTyping = () => pending > 0;
function later(text: string, attachment = false) {
 nextAt = Math.max(Date.now(), nextAt) + 2500; pending++;
 window.setTimeout(() => { messages.push({ from: 'mysterious', text, attachment }); pending--; if (!pending) nextAt = 0; whitehatPing(); window.dispatchEvent(new Event('junior-chat')); }, nextAt - Date.now());
}
export function inviteJunior() {
 if (invited || invitationScheduled) return;
 invitationScheduled = true; primeMessageAudio();
 window.setTimeout(() => {
 invited = true; whitehatPing();
 messages.push({ from: 'mysterious', text: "You found their offering ledger. I'm HatWhiteJr. Mr.WhiteHat and I have been following their money." });
 later("The cult hides its trail behind change outputs and forged mirrors. I've seen that trick before. Don't trust the loudest confession.");
 later('Send me help if you need a hand. I will share my tracing notes and guide you through the evidence without doing it for you.');
 window.dispatchEvent(new CustomEvent('launch-app', { detail: 'browser' })); window.dispatchEvent(new Event('junior-dm'));
 }, 3000);
}
export function sendJuniorMessage(text: string) {
 const input = text.trim().slice(0, 500); if (!invited || !input) return;
 primeMessageAudio(); messages.push({ from: 'investigator', text: input });
 if (/^help(?:\s+(?:time|change|trace))?[.!?]*$/i.test(input)) later('Let’s break it down.\n\n' + juniorGuidance(input), true);
 else later('Send help for my notes and a nudge on the next step. I can explain the method; the evidence has to supply your answers.');
 window.dispatchEvent(new Event('junior-chat'));
}


