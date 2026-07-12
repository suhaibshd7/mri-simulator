# MRI Simulator

**Interactive MRI scan-planning simulator for radiographers and radiography students.**

### [▶ Open the Simulator](https://suhaibshd7.github.io/mri-simulator/)

---

## What this is

Planning an MRI scan means positioning and angling the imaging slab against a patient's anatomy correctly across three cross-referenced scout views — sagittal, coronal, and axial — before every real acquisition. Get the angle or coverage wrong and the study may need to be repeated. It's a core radiography skill that's normally only practised on a live scanner or under supervision.

This tool moves that practice into the browser: pick an anatomy region and sequence, plan the same three scouts a scanner would show, and get scored feedback on position, coverage, and angle against a calibrated "ideal" plan.

It runs entirely client-side — no account, no install, no backend — and installs as an offline-capable PWA on mobile.

## Features

- Multi-plane scout planning across Sagittal, Coronal, and Axial views, softly linked to each other the way real scout planes are — moving one nudges the physically corresponding position on the others
- Rotation control via shift-drag or a dedicated slider, with a per-sequence angle tolerance (tighter for small targets like the IAM, looser for brain)
- Saturation-band placement for sequences that need one (cervical/lumbar spine)
- Multi-level "disc block" planning for spinal axial sequences
- Two exam modes — see below
- Scored feedback broken down by plane and role, plus a full-exam summary
- Calibration Mode for instructors to build and reorder anatomy/sequence content, upload scout images, and set the ideal box, angle, and notes per image
- Export/import full configuration as JSON, plus a remote-manifest system so an instructor can push content updates to every student without redeploying the app
- In-app planning guide with written scan rules per anatomy region
- Installable, offline-capable PWA, plus a separate "download self-contained offline copy" export for use with zero network dependency at all

## Planning vs. Realistic mode

**Planning mode** is angle-and-coverage practice only — the day-one skill.

**Realistic mode** adds the acquisition parameters that actually trade off against each other on a real console: FOV, slice count, voxel size, and NEX, with a live SNR estimate and scan-time multiplier. Shrinking the FOV to save time costs SNR; recovering it with NEX costs scan time. The final score in this mode blends planning accuracy (70%) with how close the resulting SNR sits to the target zone (30%), so a technically perfect box with unusable image quality doesn't score as well as a well-planned, well-parameterised one.

## How scoring works

Every plane in a sequence has a **role**, and the role decides how it's scored:

- **Active** planes: 55% position/size overlap (IoU), 45% rotation.
- **Angle** planes (verifying an angle set from another view): 70% own rotation, 25% the parent active plane's score, 5% own overlap.
- **Coverage** planes (confirming a slab position rather than actively planning it): 80% the parent plane's score, 20% own overlap.
- **Saturation bands**: 40% overlap, 35% centre-distance, 25% rotation.
- **Spinal disc blocks** (multi-level axial spine): 50% centre-distance, 50% rotation. Overlap is intentionally excluded here — box size is locked from calibration and isn't something the student controls.

Rotation scoring gives full credit inside the configured tolerance and falls off linearly to zero at three times that tolerance. Overlap is computed on axis-aligned bounding boxes; one deliberate exception is the sagittal coronal-reference box for spine, which is long and thin enough that IoU alone stays near zero even when correctly placed — that specific case is scored on centre-distance instead.

## Anatomy library

Seven regions ship with default content: **Brain, IAM/IOM, Cervical Spine, Shoulder, Lumbar Spine, Pelvis, Knee.**

**Pituitary, Hip, and Thoracic Spine** already have scan-parameter defaults (ideal NEX, phase-encode direction) and full written planning rules in the in-app Guide, but no default scout images or calibrated boxes yet. Add them in Calibration Mode using the matching ID (`pituitary`, `hip`, `thoracic`) and they'll pick up that existing data automatically.

## Calibration Mode

Instructors build and maintain content here: add anatomies and sequences, upload scout images (compressed client-side before storage), draw the ideal box and rotation per image, set each plane's role, add saturation bands where needed, and write per-image hint notes. A "Test" button runs a one-sequence practice exam immediately from inside Calibration Mode, without leaving it.

Content can be exported/imported as JSON for backup or sharing. For classroom deployment, `data-manifest.json` at the repo root points every client at the current calibration and planning JSON files by filename; bumping the version number in that file pushes updated content to every student's device on their next load, without redeploying the app itself.

## Offline use & installation

The app registers a service worker and persists all calibration data locally (localStorage, with an IndexedDB fallback for large image sets), so once opened, it works with no connection. On Android/iOS, **⋮ menu → Add to Home Screen** installs it like a native app. A separate **⇓ OFFLINE** button in the header generates a single, fully self-contained HTML file — current content baked in, no fetch calls at all — for situations with no network access whatsoever.

## Built with

Single HTML file, no build step, no framework, no external runtime dependencies. Canvas API for all box drawing, dragging, rotation, and zoom; IndexedDB and localStorage for persistence; a Service Worker for offline support. The in-app planning guide is a self-contained second app rendered in an iframe from a blob URL, sharing data with the main app via `postMessage`. Needs a reasonably current browser (Canvas, IndexedDB, Service Worker support) — no server, no account, no cost.

## Known issues

- **"Clear all calibration data" and the IndexedDB fallback.** This reliably clears localStorage, but if you've previously hit the browser's storage quota (uncommon — uploaded images are JPEG-compressed before storage) and images were moved to the IndexedDB fallback, that fallback store isn't currently cleared by the reset. A true full reset in that case also needs clearing the site's storage from the browser itself. Known, not yet fixed.
- Offline caching depends on the service worker having successfully run at least once while online.

---

*Built for educational use only. Contains no real patient data and is not a substitute for supervised scanner training or clinical judgement.*

Built by [Suhaib Shdefat](mailto:suhaib.shdefat@gmail.com) · [Source](https://github.com/suhaibshd7/mri-simulator)
