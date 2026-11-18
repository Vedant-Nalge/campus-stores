# Campus Stores · Product Engineer Work Sample

Campus Stores is a web application set at a university media equipment desk. This work sample explores counter workflows across a 3-phase shift: equipment pickup, partial return, and next-morning shift handover.

---

## Candidate Brief Response & Design Decisions

### 1. One Moment the Product Handles Well (What I Kept)

**Observation & Evidence:**
The original system handles **strict physical asset integrity and constraint enforcement** exceptionally well:
* **Maintenance Protection:** Physical units tagged for repair (e.g. `PR-06` in the Workshop) are strictly excluded from selection.
* **Quota & Category Validation:** The system verifies that equipment types match the approved student request (`r.items.includes(unit.type)`) and strictly prevents over-issuing beyond approved quotas.
* **Discrete Traceability:** Every individual physical unit maintains a dedicated slip (`L-xxx`) linked to its specific shelf bin (e.g. `Bin A2`, `Bin B1`, `Bin C4`).

**Why this matters at a real counter:**
Counter staff rotate frequently and operate under rush conditions. Hard software constraints that prevent broken equipment from leaving the counter or prevent accidental over-allocation protect inventory integrity and eliminate inventory drift. I kept this underlying discrete slip model and validation intact.

---

### 2. One Moment I Would Change (The Core Friction)

**Observation & Evidence:**
The product suffered from a critical mismatch between **how campus equipment is requested and operated (as cohesive event bundles)** versus **how the software managed them (isolated, single-item slips with no partial-return handover lifecycle)**.

Evidence from the shift:
1. **Friday 3:45 pm (Pickup Bottleneck):** Kabir Sen arrives to pick up the Film Society screening kit (`RQ-214`: HDMI projector, Portable speaker, USB-C → HDMI adapter). The film starts in 15 minutes. In the original design, staff had to manually create 3 separate issue slips, filling out 12 repetitive dropdowns across multiple tab switches.
2. **Friday 7:30 pm (The Disjointed Partial Return):** Kabir returns the projector and speaker, but explains that *Leela Das* has the adapter and will return it Saturday at 9:00 am. In the original app:
   - There was **no way to update custody or extend the return deadline** on the remaining adapter slip (`L-404`).
   - The slip stayed under Kabir's name with an expired due time (`Fri 8 pm`), causing it to appear falsely overdue by Saturday morning.
   - Handover notes had to be manually typed into an unlinked "Desk book" tab.
3. **Saturday 9:00 am (Morning Shift Ambiguity):** When Leela arrived with the adapter, the incoming shift clerk saw an overdue slip issued to Kabir. Unless the clerk cross-referenced the disconnected notebook, they had no direct clue why Leela was returning Kabir's loan or whether the late return was authorized.

---

### 3. The Prototype: What Was Built & Elevated

To solve these friction points while delivering an exceptional user experience, I elevated the application across product workflows, UI design, and code architecture:

#### A. Interactive Journey Walkthrough Mode (`app.js` & `styles.css`)
* Added a dedicated **"Interactive Journey Walkthrough"** button in the header.
* Clicking it opens a guided story controller at the top with **Next Step** and **Previous Step** controls.
* Reviewers can step through the entire 6-chapter shift story (from Friday pickup to 1-click checkout, partial return, custody handover, Saturday morning alert, and final kit return) with full state synchronization in under 60 seconds.

#### B. 1-Click Request Kit Checkout (`app.js` & `styles.css`)
* On the **Requests** view (`RQ-214`), staff can issue all approved kit items simultaneously.
* The system auto-matches available shelf units from inventory (displaying model and bin location), and lets staff set the collector (`Kabir Sen`) and return time (`Fri 8 pm`) **once**.
* Generates all discrete slips (`L-402`, `L-403`, `L-404`) in batch while maintaining full physical unit traceability.

#### B. Hierarchical Kit Lifecycle in Loan Register (`app.js` & `styles.css`)
* The Loan Register now groups slips by their parent **Request / Kit** (with a toggle for flat slip view).
* Displays a live **Kit Progress Bar** (e.g. `2/3 items returned · 67%`).
* Allows returning individual items while keeping the event bundle unified.

#### C. In-Situ Handover Modal & Custodian Transfer (`app.js` & `styles.css`)
* Active slips feature a dedicated **"Handover / Extend"** action.
* Clicking it opens a focused **Handover Modal**:
  - Reassigns custody to **Leela Das** (while preserving Kabir Sen as the original collector for audit).
  - Extends agreed return time to **Sat 9 am**.
  - Attaches a contextual handover note: *"Kabir returned projector & speaker; Leela kept adapter for morning drop-off"*.
* Updates the active slip immediately and cross-posts to the Desk Book audit log.

#### D. Morning Shift Handover Alert Briefing (`app.js` & `styles.css`)
* On Saturday morning (Phase 3), a prominent amber **Briefing Banner** alerts incoming staff:
  > *"Shift Handover Briefing: Leela Das is returning Adapter AD-12 for Film Society at 9:00 am. Note from Kabir: 'Leela kept adapter for morning drop-off'."*
* Incoming staff can resolve the loan directly with one click.

#### E. Interactive Shift Stepper & Modern Design System (`styles.css`)
* **Shift Stepper:** Visual timeline at the top (`1. Pickup` ➔ `2. Return & Handover` ➔ `3. Morning Takeover`) showing current shift status.
* **Instant Search:** Real-time search filter in Loan Register (search by student name, request ID, event, or asset ID).
* **Toast Notifications:** Smooth floating toast feedback for every counter action.
* **Zero-Build Architecture:** High-polish reactive UI built in vanilla ES6+ that runs 100% offline with zero dependencies or build steps.

---

### 4. Walking Through the Shift with the Elevated Prototype

1. **Friday 3:45 pm (Pickup at the counter):**
   * Kabir arrives at 3:45 pm. Staff opens `RQ-214` in **Requests**.
   * Staff clicks "Issue complete kit", selects `Kabir Sen`, and confirms `Fri 8 pm`.
   * Slips `L-402`, `L-403`, and `L-404` are issued simultaneously. Kabir is on his way in under 20 seconds.
2. **Friday 7:30 pm (Partial Return & Handover):**
   * Kabir returns the projector and speaker. Staff clicks "Record return" on both items in the **Loan Register**.
   * The Film Society kit card progress updates to `2/3 items returned (67%)`.
   * On the remaining adapter slip (`L-404`), staff clicks "Handover / Extend", selects `Leela Das`, sets `Sat 9 am`, and inputs the handover message.
   * The slip immediately updates to show `Held by Leela Das (transferred from Kabir Sen) · Due Sat 9 am`.
3. **Saturday 9:00 am (Morning Shift Takeover):**
   * The new shift begins. Staff is greeted by the **Morning Handover Briefing Banner** at the top of the desk.
   * Leela Das walks up with the adapter. Staff sees slip `L-404` directly under Leela's name, marked `Due Sat 9 am`.
   * Staff clicks "Record return". The Film Society kit progress hits **100% complete**, and `AD-12` is restored to shelf stock.

---

### 5. Counter Observation Metric

**One observation at a real counter that would tell us whether this helped:**

> **Primary Metric: Counter queue dwell time during pre-event rush hours (3:30 pm – 5:00 pm).**
>
> * **Measurement:** Time elapsed from when a student arrives at the counter until they leave with their equipment.
> * **Target:** For multi-item club kits (3+ items), counter transaction time drops from **~180 seconds** (12 dropdown selections across repeated forms) to **under 25 seconds** (1-click kit verification).
> * **Shift Takeover Observation:** Handover dispute rate and unresolved "false overdue" alerts drop to **zero**, as incoming staff can verify transferred custodians and agreed deadlines directly on the loan slip without consulting external notebooks or chat groups.

---

## Run the App Locally

Open `index.html` in any modern web browser, or serve over local HTTP:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Visit [http://localhost:8000](http://localhost:8000).

* **Guided Journey Tour:** Click **"Interactive Journey Walkthrough"** at the top right of the banner to automatically step through the entire story using Next/Previous controls.
* Click **Candidate brief** in the top strip to review the original problem statement.
* Click **Restart sample shift** in the status bar at any time to reset to fictional starting data.
* Use the shift action button (**Move to return time** / **Move to next morning**) to advance the shift timeline.

---

## Source Architecture

* `index.html` — Shell layout, SVG icon library, shift timeline container, handover modal, and toast hub.
* `app.js` — Reactive store, kit grouping engine, handover modal controller, real-time search, and local storage persistence.
* `styles.css` — Modern design system tokens, elevated kit cards, progress bars, shift stepper, modal backdrop, and animations.
* `third-party/lucide-LICENSE.txt` — Icon license notices.

---

## Submit Your Work

1. [Fork Campus Stores](https://github.com/virinchi-healthcare/campus-stores/fork) into your GitHub account.
2. Push your changes to your public fork.
3. In your fork, open **Commits**, select the final commit, and copy the URL:
   `https://github.com/YOUR-USERNAME/campus-stores/commit/COMMIT-SHA`
4. [Submit your work through the Google Form](https://docs.google.com/forms/d/e/1FAIpQLScvzoh1R4WS-SkiwAVBQbMvniieJYSoOEfLMyVo5CyjOvYUgQ/viewform) with your roll number, email ID, and final commit link.
