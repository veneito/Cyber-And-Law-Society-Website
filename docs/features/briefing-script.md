# Team Briefing Script (Codec Call)

Plays after a valid team code is entered, before the 3-2-1-GO countdown (`Countdown` in `Ambient.tsx`, shown from `Gate` in `Case.tsx`). Recorded by the organizer, so it is written to be spoken aloud. Style: Metal Gear Solid codec call. A commander briefs a rookie: calm, gruff, a little dramatic, short lines, pauses between them. About 45 to 60 seconds.

Facts used: Bea F. Wellington set up a fake open Wi-Fi network posing as the University of South Alabama, harvested logins, and planted ransomware on university computers. The team must track her down while she counterhacks them, and bring her to justice.

`(pause)` = a beat of silence. Ad-lib freely; the lines are a skeleton.

---

## Script

**Opening (static crackle, codec ring)**

> Rookie. Can you hear me? Good. Keep your eyes on the screen.
> (pause)
> I'll make this quick. We don't have much time.

**The situation**

> Her name is Bea F. Wellington. Hacker. Dangerous.
> (pause)
> She set up a fake open Wi-Fi network. Made it look like the University of South Alabama.
> Students and staff connected. Every login they typed, she stole.
> (pause)
> Then she used those logins to plant ransomware on the university's computers.
> (pause)
> And now she's gone.

**The mission**

> Your mission: track Bea F. Wellington down.
> Follow her trail. Find the evidence. Prove what she did.
> (pause)
> Then bring her to justice.

**The warning**

> But listen carefully. She knows you're coming.
> She'll fight back. Expect her to counterhack you.
> When she does, stay calm. Think fast. Don't let her win.

**Sign-off**

> This is your moment, rookie. The whole team is counting on you.
> (pause)
> Good luck, soldier.
> (codec click, then straight into 3, 2, 1)

---

## Screen and audio notes

- **Screen:** classic codec layout. Dark green frame, two portraits left and right (commander on the left, a silhouette of the player on the right), a frequency readout in the middle, and the subtitle line under it. The commander's mouth or portrait flickers while the voice plays. Optional header: `CODEC // 140.85`.
- **Subtitles:** type out each line in sync with the recording. Small "Skip" link in the corner.
- **Audio:** codec ring tone at the start (the iconic double chirp), faint radio static under the voice, a click at the end, then the countdown beeps. The recording can be lightly radio-filtered (high-pass, a little distortion) to sound like a transmission.
- **Sound is off by default on the site**, so the briefing needs its own "Answer call" button. That click also unlocks audio, then plays the ring and the recording.
- **Optional extra lines** if you want the rules spelled out (cut them to keep it tight): "You have ninety minutes." / "Wrong answers lock you out, and the wait grows." / "The scoreboard is live, so the other teams can see you."

## Not in the script on purpose

- The Marx Library name (answer to step 1), cipher types, point values, hack and legal-check details.

---

# Call 2: Building found

Plays right after the "LOCATION CONFIRMED" animation, once the team enters the Marx Library. Same codec screen (`FoundBuilding` in `Briefing.tsx`). Audio: `public/case/found-building.mp3`. Until the file exists the screen shows the text with a Continue button. Re-time `BUILDING_LINES` to the recording.

> Well done, rookie. You found the building.
> (pause)
> The Marx Library. Bea was there.
> But the building is only the start.
> Now it's time to find the precise location.
> (pause)
> Something is hidden inside. Search every corner. Good luck.

---

# Key found (audio only)

No popup and no animation. When the team clicks "Key Obtained" on the sonar step, the page moves to the flash drive step and plays `public/case/found-key.mp3` in the background: "You found it, plug it in." Until the file exists nothing plays.

---

# Call 3: To court

Plays when the team clicks "Make your accusation" (all six messages decoded), before the accusation screen opens. Same codec screen (`ToCourt` in `Briefing.tsx`). Audio: `public/case/to-court.mp3`; until it exists the screen shows the text with a Continue button. Re-time `COURT_LINES` to the recording.

> You got all the evidence.
> Now let's take this porker to court.

---

# Call 4: After the arrest (final)

Plays after the arrest animation, before the victory screen (`EndCall` in `Briefing.tsx`). Audio: `public/case/end-call.mp3` (not recorded yet; until then the text shows with a Continue button). Placeholder script, edit freely:

> Great work, detectives.
> Bea F. Wellington is behind bars.
> The university is safe. Case closed.

The arrest animation itself plays `public/case/talk-layer.mp3` (Bea: "I want to talk to my lawyer") from its "Click." cuffing scene.
