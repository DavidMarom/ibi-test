# Task: Swap App Favicon to IBI Icon Set

Status: done
Track: B
Track reason: pre-made asset swap + metadata wiring, no new visual design decisions — icons were provided fully-formed by the user

## Problem
The app currently uses a placeholder favicon set (`public/favicon2/`, "Mabul Pipeline" branding in its manifest) left over from before this became an IBI-branded project. The user added the real IBI icon set (`public/favicon_io/`, standard favicon.io export — an "IBI" wordmark) and wants it wired in across all platforms (browser tab, iOS home screen, Android/PWA).

## Goal
Every favicon/icon reference in the app points to the new `favicon_io` assets, correctly, on every platform Next.js's metadata API supports — and the old unused placeholder set is removed rather than left as dead weight in `public/`.

## Requirements
- `src/app/layout.tsx`'s `metadata.icons` (`icon`, `apple`) and `metadata.manifest` updated to point at `/favicon_io/...` instead of `/favicon2/...`
- `public/favicon_io/site.webmanifest` fixed: as exported by favicon.io it references icons at root-relative paths (`/android-chrome-192x192.png`) which would 404 since the files actually live at `/favicon_io/...` — update to `/favicon_io/android-chrome-192x192.png` etc.
- `site.webmanifest`'s empty `name`/`short_name` fields set to the app name (see `PRODUCT_KNOWLEDGE.md`)
- `site.webmanifest`'s `theme_color`/`background_color` (currently favicon.io's white default `#ffffff`) updated to match this project's actual dark theme (`--color-bg: #0d0d0d` in `globals.css`) rather than shipping a mismatched white PWA splash/theme color
- Remove `public/favicon2/` entirely once the new set is confirmed wired correctly — don't leave orphaned unused assets in `public/`

## Constraints
- Don't touch the actual icon PNG/ICO files themselves — they're final, provided by the user
- This only touches favicon wiring — no other metadata (title/description) or page content changes

## Out of scope
- Redesigning or regenerating any icon asset
- Any other metadata/SEO changes beyond icons

## Implementation Notes
- Files modified:
  - `src/app/layout.tsx` — `metadata.icons`/`metadata.manifest` now point at `/favicon_io/...`
  - `public/favicon_io/site.webmanifest` — fixed icon `src` paths to `/favicon_io/android-chrome-*.png` (favicon.io's default export assumes root placement, which would 404 here); set `name: "ibi-test"` (from `PRODUCT_KNOWLEDGE.md`), `short_name: "IBI"` (matches the wordmark on the icon itself); `theme_color`/`background_color` changed from favicon.io's white default to `#0d0d0d` to match `--color-bg`
  - `src/app/favicon.ico` — replaced with the new IBI icon (see "Gap found" below); not a redesign, just placing the already-final provided file where Next.js's routing convention expects it
- Files removed: `public/favicon2/` (entire old placeholder set, confirmed nothing else referenced it via `grep -rn "favicon2"` before deleting)
- **Gap found beyond the task's literal requirements, fixed anyway since it's clearly what "wire it in on every platform" means**: Next.js App Router has a file-based convention where `src/app/favicon.ico` is auto-detected and served at `/favicon.ico` independently of (in addition to) whatever `metadata.icons` declares. That file existed, still had the *old* stale icon (predating even `favicon2`, confirmed via md5 it matched neither old nor new set), and would have kept serving as the actual browser-tab icon regardless of the `metadata.icons` fix. Replaced it with the new `favicon_io/favicon.ico`. Verified via the rendered `<head>`: Next's auto-generated `<link rel="icon" href="/favicon.ico?...">` tag's `sizes` attribute changed from the old file's `256x256` to the new file's `48x48`, confirming it's now serving the correct icon.
- Deviations from task requirements: the `src/app/favicon.ico` fix wasn't explicitly listed in the task's requirements (which only mentioned `layout.tsx` and the manifest) — flagging as an addition I made because leaving it would have meant the task's own goal ("every icon reference... correctly, on every platform") wasn't actually met; the browser tab is arguably the single most important "platform" here.
- New design tokens used: none (asset/config task, no UI components)

**Verification performed**:
- `npx tsc --noEmit` and `npm run build` both pass; route table unaffected (this is a metadata/asset-only change).
- Ran `npm run dev` and, with real `curl` requests (not just reasoning about paths), confirmed all 7 files under `/favicon_io/` return `200` (`favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `site.webmanifest`), the old `/favicon2/favicon.ico` now correctly `404`s, and `site.webmanifest`'s served content has the corrected paths/name/theme values.
- Fetched `/` and inspected the actual rendered `<head>` tags — confirmed every icon `<link>` (regular icons, apple-touch-icon, manifest) points at `/favicon_io/...`, and Next's auto-generated root favicon link now matches the new icon's real dimensions.
- Confirmed via `git status`/`git diff` that only favicon-related files changed by me; unrelated changes visible in `git status` (`README.md`, `public/personas/*.png`) are the user's own separate in-progress edits, not part of this task.

## Verification
- [x] `layout.tsx`'s `metadata.icons`/`metadata.manifest` point at `/favicon_io/...` — confirmed by reading `src/app/layout.tsx:18-26` directly
- [x] `site.webmanifest` icon paths fixed to `/favicon_io/android-chrome-*.png` — confirmed by reading the file's actual served content via `curl`, not just the source
- [x] `site.webmanifest` `name`/`short_name` set — `"ibi-test"` / `"IBI"`, confirmed in the same served content
- [x] `site.webmanifest` `theme_color`/`background_color` updated to `#0d0d0d` — confirmed, matches `--color-bg` in `globals.css`
- [x] `public/favicon2/` removed entirely — confirmed both by `test -d` (directory doesn't exist) and a live `404` on its old favicon path
- [x] (Beyond the literal requirements list, but necessary to meet the task's own stated goal) `src/app/favicon.ico` — independently re-confirmed via `md5` that it now byte-matches `public/favicon_io/favicon.ico` exactly, and re-fetched `/` myself to confirm the rendered `<head>`'s auto-generated favicon link reports the new file's `48x48` size

I independently re-ran every check myself (fresh `npm run dev`, real `curl` requests, direct file reads) rather than trusting the developer's report — all confirmed. Also independently verified the README.md/persona-image changes are pre-existing, unrelated, uncommitted edits (visible in `git log` that real commits already exist for prior work, so those are new/separate) — not something this task touched or something to flag as a regression.

Build (`npm run build`) passes; route table identical to before this task, as expected for a metadata-only change.

## Completion Summary
Swapped the app's favicon set from the old placeholder (`public/favicon2/`) to the real IBI icon set (`public/favicon_io/`) across every platform Next.js's metadata API supports — browser tab icons, apple-touch-icon, and the PWA manifest (name/short_name/theme_color corrected to match this app and its dark theme). Also fixed `src/app/favicon.ico`, a separate Next.js file-convention icon that would have kept serving a stale image regardless of the metadata config — not explicitly called out in the original requirements but necessary to actually meet the task's goal. Old placeholder assets removed. User confirmed. Closed 2026-07-21.
