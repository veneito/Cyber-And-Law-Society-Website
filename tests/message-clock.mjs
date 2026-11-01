export function messageClock() {
 globalThis.window = new EventTarget();
 const original = Date.now; let now=10000; const timers=[];
 Date.now=()=>now;
 window.setTimeout=(callback,delay)=>{timers.push({callback,at:now+delay});return timers.length;};
 return { advance(ms){const target=now+ms;for(;;){timers.sort((a,b)=>a.at-b.at);if(!timers.length||timers[0].at>target)break;const timer=timers.shift();now=timer.at;timer.callback();}now=target;},restore(){Date.now=original;} };
}
