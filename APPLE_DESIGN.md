# Apple Human Interface & System Design Guide — Armelis

> **Master Specification:** Experience Design, Interaction Tokens & Visual Philosophy  
> **Inspired by:** Apple Human Interface Guidelines (HIG), iOS 18/macOS Sequoia System Design & SF Symbols  
> **Target:** Armelis Security Intelligence Platform (Web & Tauri Desktop)  
> **Author:** Johan Vasquez  
> **Version:** 1.0.0 (2026)  

---

## 1. Philosophy: Intent Behind the Form

> *"Great interface design in security software is not about making charts look sleek; it is about ruthless cognitive clarity, tactile immediacy, and eliminating human error when evaluating critical risks."*

In **Armelis**, design is an operational shield:
- Security engineers and developers routinely suffer alert fatigue from thousands of disconnected vulnerability alerts.
- By adopting the core principles of Apple's Human Interface Guidelines (HIG), Armelis transforms chaotic security data into a calm, focused, and intuitive workspace.
- Every curvature radius (*squircle*), every micro-spacing unit, every soft shadow, and every millisecond of motion exists to answer a concrete human need: **understanding risk quickly and fixing it immediately**.

---

## 2. The 8 Fundamental Principles (Apple HIG Adapted)

| Principle | Core Directive | Application in Armelis |
| :--- | :--- | :--- |
| **1. Purpose (*Purpose*)** | Do something focused and genuinely meaningful. | The application exists to correlate security evidence into understandable attack paths. Showing what to fix first takes precedence over listing hundreds of raw CVEs. |
| **2. Agency (*Agency*)** | Give the operator control and freedom of action. | The operator decides whether to run scans locally or sync them. Every automated suggestion requires explicit human review and confirmation before applying changes. |
| **3. Responsibility (*Responsibility*)** | Act strictly in the user's best interest. | Local-first scanning ensures proprietary source code never leaves the workstation uninvited. All credentials and secrets in scanner logs are automatically redacted. |
| **4. Familiarity (*Familiarity*)** | Build upon metaphors and patterns users already know. | Standard card elevations, native keyboard navigation, familiar terminal outputs, and clear iOS-style bottom sheet inspectors. |
| **5. Flexibility (*Flexibility*)** | Adapt seamlessly across form factors and screen widths. | Operates identically whether viewed on an iPhone (430×932), an iPad in a server lab, an ultra-wide desktop monitor, or a Tauri desktop window. |
| **6. Simplicity (*Simplicity*)** | Be direct, uncluttered, and precise. | Zero heavy black borders. Separation is achieved through subtle value shifts, inset highlights, and generous whitespace. |
| **7. Craft (*Craft*)** | Obsess over the smallest micro-details. | Strict typography tracking (`-0.8px` on titles), tabular figures for port/hash alignments, multi-layer soft shadows, and clean cubic-bezier easing. |
| **8. Delight (*Delight*)** | Provide a rewarding, tactile human experience. | Tactile button compression (`active:scale-[0.98]`), fluid radar sweep animations, and intuitive attack path connectors that illuminate as risks resolve. |

---

## 3. Design Tokens & Geometry Specifications

### 3.1. Typographic Scale & Tight Tracking

Headings feature tight tracking to deliver an authoritative, polished command-center presence:

```
┌───────────────────────────┬──────────────┬──────────────┬─────────────────────────────────────┐
│ Level                     │ Size (px)    │ Tracking     │ Weight & Family                     │
├───────────────────────────┼──────────────┼──────────────┼─────────────────────────────────────┤
│ Display / Hero Title      │ 32px - 40px  │ -0.9px       │ Bold (700) / Display Sans           │
│ Page Titles               │ 24px - 28px  │ -0.8px       │ Semi-Bold (600) / Text Sans         │
│ Card / Section Headings   │ 18px - 20px  │ -0.6px       │ Semi-Bold (600) / Text Sans         │
│ Body Text                 │ 14px - 15px  │ -0.2px       │ Regular (400) / Text Sans           │
│ Badges, Chips & Meta      │ 11px - 12px  │ +0.5px       │ Bold / Uppercase (SF Pro / Rajdhani)│
│ Hashes, CVEs & Line #s    │ 12px - 13px  │ 0.0px        │ Monospace (Tabular Figures)         │
└───────────────────────────┴──────────────┴──────────────┴─────────────────────────────────────┘
```

> **Why Tight Tracking Works:**  
> Large headlines rendered with default browser letter-spacing look loose and unconsidered. Negative tracking (`-0.7px` to `-0.9px`) binds letterforms into unified visual words, enhancing scanning speed and gravitas.

---

### 3.2. Surface Treatment: "Zero Visible Borders"

In enterprise software, repetitive `1px solid #333` borders create visual noise that distracts analysts. Armelis follows the Apple surface standard: **cards float and separate through light, shadow, and depth**:

1. **Top Inset Highlight (Simulating Glass Bevel):**
   ```css
   box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
   ```
2. **Multi-Layer Ambient Shadow:**
   ```css
   box-shadow:
     0 2px 4px -1px rgba(0, 0, 0, 0.25),
     0 8px 24px -4px rgba(0, 0, 0, 0.35),
     0 20px 48px -12px rgba(0, 0, 0, 0.50);
   ```
3. **Subtle Boundary Ring:**
   `ring-1 ring-white/5` (Dark Mode) or `ring-1 ring-black/5` (Light Mode).

---

### 3.3. Squircle Curvature Hierarchy

Radii decrease harmonically from outer chassis to inner controls:

```
[ Chassis / Phone Outer Frame (54px) ]
    └── [ Master Cards / Console Modals (18px - 22px) ]
            └── [ Finding Rows, Inputs & Subcards (10px - 14px) ]
                    └── [ Severity Chips & Badges (8px - 10px) ]
                            └── [ Action Pills (50% / rounded-full) ]
```

- **54px:** Window frame / outer mobile viewport boundary.
- **18px - 22px:** Master attack-path console, scan setup card, findings table container.
- **10px - 14px:** Input fields, filter buttons, individual finding segment rows.
- **8px - 10px:** Severity badges (`CRITICAL`, `HIGH`, `MEDIUM`).
- **Pill (`rounded-full`):** Primary action buttons (*"Start Local Scan"*, *"Inspect Path"*).

---

### 3.4. Spatial Rhythm & Touch Targets

- **Screen Margins:** Fixed `24px - 32px` on desktop, `20px` on mobile.
- **Card Spacing:** Standard `16px - 24px` grid gutters.
- **Internal Card Padding:** `16px` (compact) to `24px` (master panels).
- **HIG Touch Target:** Minimum **44×44 pt** touch bounding box on all interactive triggers to ensure effortless mobile inspection.

---

## 4. Mobile Anatomy & Drawer Patterns (Canvas 430×932px)

When operated on mobile devices or narrow diagnostic tablets:

1. **Header & Status Bar:**
   - Ultra-compact brand glyph with real-time worker status dot (`● Ready`).
2. **Interactive Attack Path Flow:**
   - Stacked vertical node cards connected by animated neon pulse lines (`path-connector`).
   - Tapping any node opens the detail sheet.
3. **Floating Bottom Sheet (*Inspector Drawer*):**
   - Rises smoothly from the bottom viewport with a top drag grabber:
     `w-10 h-1 bg-slate-500/40 rounded-full mx-auto mb-3`.
   - Displays full finding provenance, raw scanner JSON snippet (with secrets redacted), CWE reference, and one-click remediation guidance.
4. **The Hero Action Pill:**
   - Full-width fixed bottom pill button (`h-14 rounded-full bg-electric-blue text-navy font-bold`).
   - Virtual haptic compression: `transition-transform duration-100 active:scale-[0.97]`.

---

## 5. Motion, Haptics & Accessibility

- **Duration Guidelines:**
  - Micro-interactions (hover, focus, button press): `120ms - 160ms`.
  - Content reveals & drawers: `220ms - 280ms`.
  - Spring easing: `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Accessibility:**
  - Contrast ratios meet or exceed WCAG 2.1 AA (minimum 4.5:1 for body copy, 3:1 for large display titles).
  - Explicit compliance with `prefers-reduced-motion`: transforms and sweeps degrade immediately to instant state transitions.
