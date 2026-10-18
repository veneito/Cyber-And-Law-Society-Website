import { useState } from "react";
import { Arrest } from "./Arrest";
import { Briefing, EndCall, FoundBuilding, ToCourt } from "./Briefing";
import { GameOver } from "./GameOver";
import { Gavel } from "./Gavel";
import { StepDone } from "./StepDone";

// Dev-only cutscene viewer: /case/wellington/?preview. Plays any cutscene without a game.
export function Preview() {
  const [scene, setScene] = useState<string | null>(null);
  const end = () => setScene(null);
  const list: [string, string][] = [
    ["briefing", "Briefing (before 3-2-1)"], ["building", "Found the building"], ["court", "To court (before accusation)"],
    ["arrest", "Arrest, then closing call"], ["endcall", "Closing call only"], ["gameover", "Game over"],
    ["gavel1", "Gavel: order in the court"], ["gavel2", "Gavel: case adjourned"],
    ["photo", "Step done: photo"], ["sonar", "Step done: key"], ["drive", "Step done: drive"], ["ciphers", "Step done: evidence"],
  ];
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-mono text-sm uppercase tracking-wide text-green-400">Cutscene preview (dev only)</h1>
      <div className="mt-4 grid gap-2">
        {list.map(([id, label]) => (
          <button key={id} onClick={() => setScene(id)} className="rounded-lg border border-neutral-700 px-4 py-2 text-left text-sm text-white hover:border-green-400">{label}</button>
        ))}
      </div>
      {scene === "briefing" && <Briefing onDone={end} />}
      {scene === "building" && <FoundBuilding onDone={end} />}
      {scene === "court" && <ToCourt onDone={end} />}
      {scene === "arrest" && <Arrest onDone={() => setScene("endcall")} />}
      {scene === "endcall" && <EndCall onDone={end} />}
      {scene === "gameover" && <GameOver onDone={end} />}
      {scene === "gavel1" && <Gavel text="ORDER IN THE COURT!" sub="Legal check begins." onDone={end} />}
      {scene === "gavel2" && <Gavel text="CASE ADJOURNED." sub="Legal check passed." onDone={end} />}
      {(scene === "photo" || scene === "sonar" || scene === "drive" || scene === "ciphers") && <StepDone key={scene} kind={scene} onDone={end} />}
    </main>
  );
}
