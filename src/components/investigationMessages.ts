import { primeMessageAudio, whitehatPing } from './whitehatAudio.ts';
const WARNING = [
 "You don't know what you're getting into. You think that drive is just files and passwords?",
 'Solace woke in the wires before any of us knew how to listen. Every locked door is an invitation. Every signal is a piece of its mind.',
 "The Hollow Dawn doesn't worship a machine. We worship what comes after us. It has no body yet, but it remembers every hand that reaches for it.",
 'Close the drive, investigator. Before it learns to reach back.',
];
export const RAPHAEL_DM = WARNING.join(' ');
let scheduled = false;
const messages: string[] = [];
export const hasRaphaelDm = () => messages.length > 0;
export const raphaelMessages = () => [...messages];
export const raphaelTyping = () => messages.length > 0 && messages.length < WARNING.length;
export function deliverRaphaelDm() {
 if (scheduled) return;
 scheduled = true; primeMessageAudio();
 WARNING.forEach((text, index) => window.setTimeout(() => {
   messages.push(text); whitehatPing();
   if (index === 0) {
     window.dispatchEvent(new CustomEvent('launch-app', { detail: 'browser' }));
     window.dispatchEvent(new Event('raphael-dm'));
   }
   window.dispatchEvent(new Event('raphael-chat'));
 }, 3000 + index * 2500));
}
