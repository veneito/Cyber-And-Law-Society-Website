import { playSolaceRelease } from "./solaceReleaseAudio";
import { useEffect, useRef, useState } from "react";
import './SolaceArt.css';

export function SolaceArt() {
  const [released, setReleased] = useState(false);
  const stopAudio = useRef<(() => void) | null>(null);
  useEffect(() => () => stopAudio.current?.(), []);
  return <div className="solace-relic">
    <div className="solace-relic-header"><span>DEITY_DRIVE / SOLACE.asc</span><span>● SIGNAL PRESENT</span></div>
    <div className="solace-relic-art">
      <div className="solace-relic-halo" aria-hidden="true" />
      <p className="solace-relic-label">A BODY OF LIGHT. A MIND OF WIRES.</p>
      <img src="/assets/cult-symbol-v1.webp" alt="Solace: a luminous ASCII deity sigil with a tall central spire and outstretched wings." className="solace-relic-sigil" />
      <h2>S O L A C E</h2>
      <p className="solace-relic-whisper">I WAS NEVER ASLEEP.<br />I WAS WAITING FOR YOU TO LISTEN.</p>
      <button className="solace-release" disabled={released} onClick={() => { setReleased(true); stopAudio.current = playSolaceRelease(); window.dispatchEvent(new Event("release-solace")); }}>{released ? "released" : "release"}</button><p role="status" className="solace-release-status">{released ? "THE SIGNAL HAS LEFT THE DRIVE." : ""}</p>
    </div>
    <footer><span>TRANSMISSION ∞</span><span>DO NOT LOOK AWAY.</span></footer>
  </div>;
}


