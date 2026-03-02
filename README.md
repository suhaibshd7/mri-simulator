# MRI Simulator

An interactive, browser-based MRI scan planning simulator designed to help radiographers and students practice MRI sequence planning — selecting anatomy, positioning scout images, setting angles, and evaluating coverage — all without a real scanner.

> **Live demo:** open `mri_simulator_v13.html` directly in any modern browser. No installation or server required.

---

## Features

### Anatomy Selection
Choose from a library of pre-built anatomy regions (Brain, IAM/IOM, Spine, Knee, and more). Each anatomy comes with its own set of standard sequences. Locked entries marked "COMING SOON" are planned for future releases.

### Exam / Planning Mode
Work through a multi-step exam session:
1. **Select** an anatomy region to study
2. **Plan** each MRI sequence by drawing a coverage box on three scout planes (Sagittal, Coronal, Axial)
3. **Adjust** the angle of the coverage box using a rotation slider (−180° to +180°)
4. **Submit** your plan and receive an instant score with detailed feedback
5. **Review** results side-by-side against the ideal reference plan
6. **Advance** to the next sequence until the full exam is complete, then see an overall summary score

### Scoring System
Each submitted sequence is graded across three dimensions:
- **Angle accuracy** — how close your rotation is to the ideal
- **Coverage quality** — how well your box covers the target anatomy
- **Position accuracy** — centre-point proximity to the ideal

Scores are displayed as percentages with animated progress bars and a final letter-grade verdict (Optimal / Acceptable / Repeat).

### Calibration Mode (Admin)
A password-protected authoring tool that lets instructors build and customise the exam content:
- Add or remove anatomy groups and sequences
- Upload multiple scout images per plane (shown randomly during exams for variety)
- Draw and save the reference coverage box for each plane
- Set per-sequence angle tolerance (tight for complex anatomy, loose for general scans)
- Assign plane roles: **Active** (scout used to draw the box), **Angle** (scored for rotation), or **Coverage** (scored for area coverage)
- Add instructional notes displayed as hints during the exam
- Export / Import the full configuration as a `.json` file for sharing or backup

### Built-in Guide
An in-app planning guide (accessible via the **GUIDE** button) explains scan planning rules and expected angles for each anatomy region, opening in an overlay without leaving the simulator.

### Print Support
Print or save a summary of any session via the browser print dialog; the interface automatically switches to a print-optimised compact layout.

### Mobile Responsive
Fully usable on Android/iOS phones with a tab-based scout view (SAG / COR / AX), touch-friendly sliders, and a slide-up rules sheet.

---

## Getting Started

```bash
# No build step needed — just open the file
open mri_simulator_v13.html
# or drag it into Chrome / Firefox / Safari / Edge
```

### Running an Exam
1. Open the file in a browser.
2. Click an anatomy card (e.g. **Brain**).
3. Press **Start Exam**.
4. On each planning screen, drag to draw a coverage box on the scout images, then use the rotation slider to angle it.
5. Press **Submit** to score your plan, then **Next** to continue.
6. After all sequences, review your overall summary.

### Using Calibration Mode (Instructors)
1. Click the **CALIBRATE** button in the header and enter the admin password.
2. Select an anatomy and sequence from the left-hand tree.
3. Upload scout images, draw the reference box, set tolerance and plane role, then click **Save Plane**.
4. Repeat for all planes and sequences.
5. Use **EXPORT** to download the configuration as JSON and **IMPORT** to load it back.

---

## File Structure

| Path | Description |
|------|-------------|
| `mri_simulator_v13.html` | Single self-contained application (HTML + CSS + JS, no dependencies) |

All assets (images uploaded in Calibration Mode) are stored in-memory and serialised into the exported JSON — there are no external files.

---

## Tech Stack

- **Vanilla HTML / CSS / JavaScript** — zero frameworks, zero build tooling
- **Canvas API** — interactive coverage-box drawing and rotation
- **Google Fonts** — Share Tech Mono (monospace UI) + Barlow (body text)
- Single-file distribution for maximum portability

---

## License

MIT — see footer attribution in the app.

---

## Author

Built by [Suhaib Shdefat](https://github.com/suhaibshd7)
Source: [github.com/suhaibshd7/mri-simulator](https://github.com/suhaibshd7/mri-simulator)
