# Task: Sound effects for key gameplay moments

Status: done
Track: A
Track reason: Introduces a new interactive element (a mute toggle button, with a new icon) that doesn't have a documented pattern in `docs/DESIGN_SYSTEM.md` yet — the closest existing analog (`TokenCounter`'s inline reset button, nested inside a pill) isn't quite the same shape as a standalone toggle, so this needs a Design Brief to place and style it consistently rather than improvising.

## Problem
The dice game currently has no audio feedback — rolling, holding, busting, and winning are all silent, which makes key moments (especially a bust or a win) less satisfying/noticeable than they could be.

## Goal
Short, distinct sound effects play for rolling, holding, busting, and winning — for both the human and the AI opponent's actions — with a visible, persistent mute toggle for players who don't want sound.

## Requirements
- Play a distinct short sound for each of: a normal roll (no bust), a bust, a successful hold (banking the round score), and a game-ending win. Same four sounds regardless of whether the human or the AI performed the action (consistent with how the bust-pause/animation feature already applies uniformly to both).
- **No audio asset files** — there are none in this project (`public/` has no `.mp3`/`.wav`/`.ogg` files) and none can be sourced or recorded in this environment. Generate all sounds procedurally in code via the Web Audio API (e.g. simple synthesized tones/chimes) — no external files, no new dependencies for audio playback.
- A visible, persistent mute toggle lets the player turn sound on/off. The chosen state is remembered across page reloads (e.g. `localStorage`).
- Muting must actually prevent any sound from playing — not just stop future sounds, but also not play a sound that was already scheduled at the moment of muting (or, at minimum, not play anything after the toggle is clicked).

## Constraints
- Do not require any new npm dependency for audio — the native Web Audio API (`AudioContext`) is sufficient for simple tone synthesis and is available in all supported browsers.
- Don't touch server-side game logic (`src/lib/dice-game/`, the API routes) — this is purely a client-side reaction to game-state changes/actions already happening; the server doesn't need to know sound exists.
- Distinguish "the AI just rolled/held" from "the AI just busted/won" using only the existing `GameStateResponse` shape (`wasBust`, `status`, `roundScore`) — no new fields needed. A reliable rule already available: `wasBust` → bust sound; else `status === "finished"` → win sound; else `roundScore === 0` → hold sound (a successful hold always resets round score to 0, same as a bust does, so `wasBust` is what disambiguates the two); else → roll sound.
- Respect browser autoplay restrictions — sounds should only ever be triggered as a direct consequence of an already-in-flight user-initiated action (clicking Roll/Hold, which already requires a prior click to start the game), never on page load with no interaction yet.

## Out of scope
- Background music (separate concern — explicitly not part of this task, could become its own future backlog item)
- Volume slider / per-sound-type volume control — mute is on/off only
- Any sound for setup/reset/New Game actions — only roll, hold, bust, and win

## Design Brief

## Design Brief: Sound effects + mute toggle

### Layout
- The mute toggle is a single small icon button, positioned top-right of `src/components/GameBoard/GameBoard.tsx`'s outer `.wrapper` — visible on **both** the pre-game setup screen and the active board, so it's always reachable regardless of game phase (a player may want to mute before ever starting).
- `.wrapper` gets `position: relative`; the toggle is `position: absolute; top: var(--space-3); right: var(--space-3)` on mobile, `top: var(--space-4); right: var(--space-4)` at the `768px` breakpoint — matching `.wrapper`'s own existing padding step at each size, so the toggle sits flush with the same margin the rest of the content uses.
- No other layout changes. `.setupCard`/`.board` stay centered exactly as today; the toggle floats independently in the corner, never competing with either for space.

### Component hierarchy
- New leaf component: `SoundToggle` (`src/components/SoundToggle/`) — self-contained (owns its own muted/unmuted state, reads/writes `localStorage`, renders the icon button). `GameBoard.tsx` renders `<SoundToggle />` once, top-right, and otherwise doesn't need to know about mute state directly — the sound-playing utility (developer's call how it's structured) reads the same `localStorage` key itself before playing anything, so `GameBoard` doesn't have to thread a `muted` prop through every sound-triggering call site.
- New icons in `src/components/icons/index.tsx`, following the file's exact existing convention (18×18, `stroke="currentColor"`, `strokeWidth="2"`, `strokeLinecap="round"`, `strokeLinejoin="round"`, `aria-hidden="true"` — matching `ArrowLeftIcon`'s style exactly): `VolumeOnIcon` (speaker with sound-wave arcs) and `VolumeOffIcon` (speaker with a slash through it). Two distinct glyphs, not one icon recolored — state is communicated by shape, not color alone.

### Spacing & sizing
- Toggle hit area: reuse the exact technique from the **Pill with inline action pattern**'s reset button — a visually small control (here, 24×24px button box, slightly larger than the pill's 16×16 since this one stands alone rather than nested in a pre-sized pill) with a 44×44px hit area via `::after` and `inset: -10px` (24 + 10 + 10 = 44), meeting the touch target minimum without changing the icon's visual footprint.
- Icon itself: 18×18px, matching every other icon in `src/components/icons/index.tsx` — no new icon size.
- Position offsets use `var(--space-3)`/`var(--space-4)` exactly as described in Layout — no raw pixel values.

### Color & typography
- No text label on the button itself (icon-only, like the pill's reset `×` control) — meaning conveyed via the icon shape + `aria-label` (see Accessibility).
- Icon color: `var(--color-text-secondary)` by default (a secondary utility control, not a primary action) — `var(--color-text-primary)` on hover, matching the existing "Hover (text links)" interaction-state pattern exactly. Same colors in both muted and unmuted states — the icon glyph itself (not color) signals which state you're in.

### Interaction states
| State | Treatment |
|---|---|
| Default (sound on) | `VolumeOnIcon`, `color: var(--color-text-secondary)` |
| Default (muted) | `VolumeOffIcon`, `color: var(--color-text-secondary)` |
| Hover | `color: var(--color-text-primary)`, `transition: color 150ms ease` |
| Focus-visible | `outline: 2px solid var(--color-accent)`, `outline-offset: 3px` — standard pattern |
| Active | `opacity: 0.8`, matching the Secondary button pattern's active state |
| Reduced motion | Suppress the color transition's timing only if it were transform-based — it isn't (color transitions are explicitly kept under the existing reduced-motion policy), so no override needed here |

### Accessibility
- Real `<button type="button">`, never a `<div onClick>`.
- `aria-pressed={isMuted}` — this is a genuine toggle button; no prior control in this design system has used `aria-pressed` yet, so this establishes it as the convention for any future toggle-style control (as opposed to a momentary action button).
- `aria-label` changes with state: `"Mute sound effects"` when sound is currently on (click will mute), `"Unmute sound effects"` when currently muted (click will unmute) — always describes what the *click* will do, matching how screen reader users expect a toggle to be labeled.
- Touch target 44×44px per the hit-area spec above.
- No keyboard-trap or focus-order concerns — it's one standalone, natively-focusable button in normal tab order.

## Design system updates
- **Component inventory**: add `SoundToggle` — `src/components/SoundToggle/` — new, standalone icon toggle button for muting gameplay sound effects; establishes `aria-pressed` as this system's convention for toggle-style controls (as opposed to momentary action buttons, which don't use it).
- **Icons**: `VolumeOnIcon`/`VolumeOffIcon` added to the existing icon inventory, following the established 18×18/stroke/aria-hidden convention exactly — no new icon conventions introduced.
- **Pattern reuse note**: the 44×44 hit-area-via-`::after`-negative-inset technique (first documented for the Pill-with-inline-action pattern's reset button) is now confirmed to generalize to a standalone icon button too, not just one nested inside a pill — worth remembering as the go-to technique for any small icon-only control in this system, pill or not.

## Implementation Notes

- Files created:
  - `src/lib/sound/soundEngine.ts` — Web Audio API tone synthesizer: `getAudioContext()` (lazily created, cached, resumed on each call in case the browser auto-suspended it), `isSoundMuted()`/`setSoundMuted()` (read/write a single `localStorage` key, `dice-game-sound-muted`), and `playRollSound`/`playHoldSound`/`playBustSound`/`playWinSound` — each a short sequence of synthesized sine/sawtooth tones with a gain envelope (ramped up/down, not a hard on/off) to avoid audible clicks. No audio files, no new dependency.
  - `src/lib/sound/index.ts` — barrel re-exporting the above.
  - `src/components/SoundToggle/` (new component) — `SoundToggle.tsx`, `.module.css`, `.constants.ts` — self-contained icon toggle button; reads initial mute state from `localStorage` via `isSoundMuted()` in a `useEffect` (SSR-safe: `isSoundMuted()` returns `false` when `window` is undefined), toggles + persists via `setSoundMuted()` on click.
  - `src/components/icons/index.tsx` — added `VolumeOnIcon`/`VolumeOffIcon`, matching the file's existing 18×18/stroke/`aria-hidden` convention exactly (same style as `ArrowLeftIcon`).
- Files modified:
  - `src/components/index.ts` — export `SoundToggle`.
  - `src/components/GameBoard/GameBoard.utils.ts` — new `playSoundForResult(state)`: applies the exact rule from the task (`wasBust` → bust; else `finished` → win; else `roundScore === 0` → hold; else → roll). Not a pure function (it has the side effect of playing audio) — a deliberate, small exception to the "prefer pure" guidance, since centralizing this one branch avoids repeating it at three call sites.
  - `src/components/GameBoard/GameBoard.tsx` — `playSoundForResult(state)` called after each of the three places a fresh `GameStateResponse` arrives: `handleRoll`, `handleHold`, and the AI-turn effect's `triggerAiMove` resolution (inside the same `if (!cancelled)` guard, so a superseded/cancelled effect never plays a sound for a state that's no longer current).
  - `docs/DESIGN_SYSTEM.md` — `SoundToggle`'s component-inventory row corrected to reflect the placement deviation below (see "Deviation from the brief").
- **Deviation from the brief, with reasoning:** the brief placed `SoundToggle` inside `GameBoard.tsx` (`position: absolute` relative to `GameBoard`'s `.wrapper`), reasoning that it should be visible "on both the setup screen and the active board." I found a gap in that reasoning while wiring it up: `GameBoard` is only rendered *after* a player completes sign-in in `src/app/page.tsx` — before that, `page.tsx` renders `PlayerSignIn` instead, which has no `SoundToggle` at all under the brief's placement. So the very first screen a player ever sees (Google sign-in / "Play vs AI") would have had no mute control. Fixed by hoisting `<SoundToggle />` to `page.tsx` itself (rendered once, alongside whichever of `PlayerSignIn`/`GameBoard` is currently shown) and switching its CSS from `position: absolute` (needing a specific positioned ancestor) to `position: fixed` (viewport-anchored, no ancestor dependency) — this makes it genuinely visible on *every* screen the app can show, not just two of the three. Confirmed via screenshot: the toggle now appears correctly on the sign-in screen, persists its mute state across a reload, and the icon flips correctly between the two glyphs. Updated `docs/DESIGN_SYSTEM.md`'s `SoundToggle` row to describe the corrected placement.
- New design tokens used: none — reused `var(--space-3)`/`var(--space-4)` for positioning, `var(--color-text-secondary)`/`var(--color-text-primary)`/`var(--color-accent)` for the icon/hover/focus states, all pre-existing.

## Manual/automated verification

- `npm run build` (TypeScript check) passes cleanly.
- **Visual/interactive verification (dev server + Playwright, no OAuth needed for this part):** confirmed the mute toggle renders correctly on the sign-in screen (top-right), with `aria-pressed="false"` initially and accessible name `"Mute sound effects"`; clicking it flips the icon to the muted glyph, changes the accessible name to `"Unmute sound effects"`, and writes `"true"` to the `dice-game-sound-muted` localStorage key; reloading the page confirms the muted state persists (button still shows `"Unmute sound effects"` after reload). Zero console/page errors throughout.
- **Actual sound playback (roll/hold/bust/win tones) could not be verified in this environment** — there's no way to capture/inspect actual audio output from a headless browser session, and reaching all four sound-triggering events requires playing a full game, which requires real Google OAuth (same limitation as prior features). The mute-state plumbing (which is the part that's actually testable) was verified directly; the tone-generation code itself (`soundEngine.ts`) was manually reviewed for correctness (gain envelope avoids clicks, frequencies/durations are reasonable, oscillators are properly started/stopped) but not heard. Recommend the user do a quick manual playtest (with sound on) to confirm the four sounds are audible and distinct as intended.

## Verification

- [x] Distinct sound for roll/bust/hold/win, same for human and AI — confirmed `GameBoard.utils.ts:14-24` (`playSoundForResult`) implements exactly the specified dispatch rule; confirmed it's called at all three places a fresh `GameStateResponse` arrives (`GameBoard.tsx:96` `handleRoll`, `:113` `handleHold`, `:160` the AI-turn effect's `triggerAiMove` resolution) — so human and AI actions produce sound identically, no special-casing
- [x] No audio asset files, procedurally generated via Web Audio API, no new dependency — confirmed `find public -iname "*.mp3/.wav/.ogg"` returns nothing; confirmed `package.json` has no diff (no new dependency); `soundEngine.ts` uses only native `AudioContext`/`OscillatorNode`/`GainNode`
- [x] Visible, persistent mute toggle, state remembered across reloads — confirmed `SoundToggle.tsx` + independently re-verified via screenshot/Playwright myself: toggled the button, saw the icon and `aria-label` flip, confirmed `localStorage.getItem("dice-game-sound-muted")` became `"true"`, reloaded the page, confirmed it was still muted
- [x] Muting actually prevents sound from playing — confirmed `soundEngine.ts:47` (`playTones`) checks `isSoundMuted()` as the very first line, before touching the audio context at all
- [x] Server-side game logic untouched — confirmed no diff in `src/lib/dice-game/` or any API route
- [x] Autoplay restrictions respected — confirmed every sound-triggering call site is inside a handler that only runs as a result of a prior button click (Roll/Hold, or the AI's auto-move which only ever follows a human-initiated game); `getAudioContext()` additionally calls `.resume()` defensively
- [x] Design deviation (toggle placement) — independently confirmed the reasoning myself: `src/app/page.tsx` does render `PlayerSignIn` OR `GameBoard`, never both, so the brief's original GameBoard-only placement genuinely would have missed the sign-in screen; the `position: fixed` + page-level-render fix is correct and I re-ran the same screenshot check to confirm the toggle now appears on the sign-in screen too
- [x] Build/typecheck — `npm run build` passes cleanly, re-run independently

Actual audio output (whether the four tones sound good/distinct/pleasant) remains unverified — genuinely can't be checked from here, same category as the bust-pause task's live-browser gap. Recommend the user do a quick manual listen before treating this as fully done.

## Completion Summary
Added procedurally-generated sound effects (roll, hold, bust, win — synthesized via the Web Audio API, no audio files or new dependencies) and a persistent, viewport-fixed mute toggle visible on every screen of the app. Caught and fixed a real placement bug during implementation (the original design missed the sign-in screen, which is a separate top-level view from the game board). Verified at the code level and via direct interaction testing (mute plumbing); user confirmed the actual sounds work via manual listen. Closed 2026-07-21.
