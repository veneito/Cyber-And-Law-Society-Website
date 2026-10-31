import { useEffect, useRef, useState } from "react";
import { t as tr } from "../i18n/language";

const SERVERS = [
  { id: "is", name: "Reykjavik, Iceland", ip: "185.112.4.19" },
  { id: "ch", name: "Zurich, Switzerland", ip: "82.220.31.7" },
  { id: "pa", name: "Panama City, Panama", ip: "190.34.88.201" },
];
const HOME_IP = "73.41.206.118"; // the player's pretend real address

// Module-level so closing the window keeps the tunnel up until reload; other apps can import it to gate content.
export const vpn = { connected: false, server: SERVERS[0].id };

type Status = "off" | "connecting" | "on";

export function VpnApp() {
  const [status, setStatus] = useState<Status>(vpn.connected ? "on" : "off");
  const [server, setServer] = useState(vpn.server);
  const timer = useRef<number>(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const pick = SERVERS.find(s => s.id === server)!;
  const toggle = () => {
    if (status === "on") { vpn.connected = false; window.dispatchEvent(new Event("vpn-off")); setStatus("off"); return; }
    setStatus("connecting");
    timer.current = window.setTimeout(() => { vpn.connected = true; vpn.server = server; setStatus("on"); }, 1400);
  };
  return (
    <div className="flex h-full flex-col items-center gap-4 font-mono text-center">
      <p className={`text-lg font-bold ${status === "on" ? "text-green-300" : "text-neutral-400"}`}>
        {status === "on" ? tr("Protected") : status === "connecting" ? tr("Connecting...") : tr("Not protected")}
      </p>
      <p className="text-xs text-neutral-400">{tr("Your IP")}: <span className="text-neutral-200">{status === "on" ? pick.ip : HOME_IP}</span></p>
      <fieldset disabled={status !== "off"} className="w-full space-y-1 text-left text-xs">
        <legend className="mb-1 text-neutral-500">{tr("Server location")}</legend>
        {SERVERS.map(s => (
          <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 hover:bg-neutral-900 has-[:checked]:border-green-500/60">
            <input type="radio" name="vpn-server" checked={server === s.id} onChange={() => setServer(s.id)} className="accent-green-400" />{s.name}
          </label>
        ))}
      </fieldset>
      <button onClick={toggle} disabled={status === "connecting"} className="mt-auto w-full rounded-lg border border-green-500 px-4 py-2 text-green-200 hover:bg-green-950 disabled:opacity-50">
        {status === "on" ? tr("Disconnect") : tr("Connect")}
      </button>
    </div>
  );
}
