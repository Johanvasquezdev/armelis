# CyberScan Design System

> **Document Classification:** Official Product Design System & UI Tokens  
> **Target Platforms:** Web Dashboard (Next.js) & Desktop Local Shell (Tauri 2)  
> **Brand Identity:** Radar/Network Mark, Dark Navy Canvas, White & Electric Blue Typography  
> **Owner / Author:** Johan Vasquez  
> **Version:** 1.0.0 (2026)  

---

## 1. Visual Direction & Aesthetic Vision

**CyberScan** is a security intelligence layer designed to transform noisy scanner output into prioritized security understanding. Its visual direction is **precise, technical, calm, and evidence-focused**:

- **Cybersecurity Command Center:** Dark-mode first by default, evoking high-tech radar intelligence and tactical precision without tacky visual gimmicks.
- **Cognitive Clarity:** Elimination of visual clutter. The interface directs the analyst's eye to the critical path that breaks an attack vector, not a wall of 500 equivalent alert badges.
- **Evidence Hierarchy:** Raw scanner outputs are treated as factual provenance, while correlations, attack paths, and risk scores are styled with deliberate typographic contrast and clarity.

---

## 2. Logo & Brand Mark Guidelines

- **Primary Logo:** The official CyberScan radar and network constellation mark.
- **Wordmark:** **CYBER** in crisp, bold white (`#FFFFFF`) followed immediately by **SCAN** in vibrant electric blue (`#00E5FF` or `#38BDF8`).
- **Aspect & Geometry:** Preserve exact proportions of the radar grid circles and sweeping vector beam.
- **Desktop Header:** Full horizontal brand lockup (radar mark + CYBER**SCAN** typography + environment indicator).
- **Mobile / Compact Shell:** Monogram radar glyph (`⌁` or isolated radar mark) paired with a clean section title.
- **Prohibitions:** Do not rotate the mark, alter the electric-blue hue to low-contrast tones, or overlay busy background gradients that impair legibility.

---

## 3. Color Tokens & Semantic Palettes

All colors are controlled through semantically mapped CSS custom properties:

### 3.1. Foundation & Workspace Tokens

```css
:root {
  /* Core Brand Identity */
  --cyberscan-electric: #00e5ff;
  --cyberscan-blue: #0070f3;
  --cyberscan-deep-blue: #0c4a6e;

  /* Surfaces & Backgrounds (Dark Mode First) */
  --cyberscan-obsidian: #050811;
  --cyberscan-navy: #0a0f1d;
  --cyberscan-surface-dark: #0f172a;
  --cyberscan-surface-card: #131d35;
  --cyberscan-surface-highlight: #1e293b;

  /* Borders & Dividers */
  --cyberscan-line: rgba(148, 163, 184, 0.12);
  --cyberscan-line-accent: rgba(0, 229, 255, 0.35);

  /* Typography */
  --cyberscan-text-primary: #ffffff;
  --cyberscan-text-secondary: #94a3b8;
  --cyberscan-text-muted: #64748b;
  --cyberscan-text-link: #00e5ff;
}
```

### 3.2. Severity & Vulnerability Status Ramps

Severity badges must never rely solely on color; they must pair distinct chromatic values with explicit typographic labels:

| Severity | Color Token | Hex Code | Purpose |
|---|---|---|---|
| **CRITICAL** | `--severity-critical` | `#EF4444` | Direct remote code execution, unauthenticated exposure, immediate risk |
| **HIGH** | `--severity-high` | `#F97316` | Missing authorization on sensitive endpoints, exposed secrets, severe CVEs |
| **MEDIUM** | `--severity-medium` | `#F59E0B` | Insecure configurations, outdated components with limited exploitability |
| **LOW** | `--severity-low` | `#38BDF8` | Debug endpoints, minor informational misconfigurations |
| **INFO** | `--severity-info` | `#64748B` | Tooling metadata, SBOM component records, license information |
| **CONFIRMED**| `--status-confirmed` | `#10B981` | Human or evidence-verified attack path |

---

## 4. Typography System

The typography pairs an authoritative geometric display sans-serif for command headings with an ultra-legible monospace font for security artifacts:

```
┌───────────────────────────┬──────────────┬──────────────┬─────────────────────────────────────┐
│ Level                     │ Size (px)    │ Tracking     │ Weight / Font Family                │
├───────────────────────────┼──────────────┼──────────────┼─────────────────────────────────────┤
│ Hero / Display Title      │ 32px - 40px  │ -0.9px       │ Bold (700) / Rajdhani / SF Pro      │
│ Page Heading              │ 24px - 28px  │ -0.8px       │ Semi-Bold (600) / IBM Plex Sans     │
│ Section Heading           │ 18px - 20px  │ -0.6px       │ Semi-Bold (600) / IBM Plex Sans     │
│ Body Copy                 │ 14px - 15px  │ -0.2px       │ Regular (400) / IBM Plex Sans       │
│ Microcopy / Eyebrow       │ 11px - 12px  │ +0.8px       │ Bold / All Caps ( Rajdhani )        │
│ Hashes, CVEs & Code       │ 12px - 13px  │ 0.0px        │ Monospace / Tabular Numerals        │
└───────────────────────────┴──────────────┴──────────────┴─────────────────────────────────────┘
```

- **Tight Tracking:** Negative letter spacing (`-0.6px` to `-0.9px`) on headings gives an intentional, editorial, and commanding presence.
- **Tabular Figures (`font-variant-numeric: tabular-nums`):** Mandatory for scan counters, timestamps, ports, and CVE numbers to eliminate jumping numbers during live updates.

---

## 5. Shape, Surfaces & Control Geometry

### 5.1. The "Zero Visible Borders" Standard
Traditional dense enterprise interfaces abuse 1px solid gray borders that fatigue the eyes. CyberScan uses physical layered depth:
1. **Top-Edge Inset Highlight:**
   ```css
   box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
   ```
2. **Multi-Layer Ambient Shadow:**
   ```css
   box-shadow: 
     0 2px 4px -1px rgba(0, 0, 0, 0.20),
     0 8px 24px -4px rgba(0, 0, 0, 0.35),
     0 20px 48px -12px rgba(0, 0, 0, 0.50);
   ```
3. **Translucent Boundary Ring:** `ring-1 ring-white/10` or `border border-white/5`.

### 5.2. Squircle Hierarchy
- **Window / App Shell:** `54px` (outer desktop or phone shell) or `0px` full screen.
- **Console / Master Cards:** `18px - 22px` rounded squircle.
- **Rows, Inputs & Dropdowns:** `10px - 14px` border radius.
- **Pills, Chips & Badges:** `8px - 10px` rounded chips.
- **Primary CTA Action Buttons:** `rounded-full` (Pill button).

---

## 6. Interaction & Motion Principles

CyberScan incorporates fluid, high-frame-rate feedback built with **GSAP** and **Anime.js**:

- **Tactile Button Press:** Interactive buttons respond with virtual haptic compression on tap/click:
  ```css
  transition: transform 120ms cubic-bezier(0.2, 0.8, 0.2, 1);
  &:active {
    transform: scale(0.97);
  }
  ```
- **Radar Sweep Animation:** Continuous, subtle 360-degree sweep (`rotate: 360`, 8s duration, linear ease) in scanner consoles, indicating continuous monitoring.
- **Staggered Path Flow:** Attack-path nodes reveal sequentially (`stagger: 0.08s`, `translateY: [12, 0]`, opacity fade) to tell a coherent risk story rather than popping abruptly.
- **Duration Limits:** Micro-interactions execute within `120ms - 180ms`. View transitions execute within `220ms - 300ms`.
- **Accessibility (`prefers-reduced-motion`):** When the user requests reduced motion, all rotational radar sweeps, node translations, and parallax effects are immediately disabled, falling back to clean instantaneous state changes.

---

## 7. Application Surfaces

1. **Scan Console:** Real-time terminal-like card displaying current scan target, connected providers (Trivy, Semgrep, Gitleaks), execution status, and elapsed time.
2. **Attack Path Visualizer:** Visual flowchart connecting the entry point (e.g. public API route), the vulnerability (e.g. missing auth check), and the crown-jewel asset (e.g. customer database), pinpointing the exact minimal fix to break the path.
3. **Findings Matrix:** High-density, searchable table with filter chips for Severity, Provider, and Category.
4. **Remediation Inspector:** Slide-out drawer or bottom sheet showing evidence snippets, package versions, CVE links, and automated fix recommendations.

---

## 8. Accessibility & Responsiveness

- **Touch Target Minimums:** All interactive controls maintain a minimum touch bounding box of **44×44 pt** on mobile and touch devices.
- **Focus Rings:** Uncompromising keyboard accessibility. Focused elements display an electric-blue glowing ring:
  ```css
  outline: 2px solid var(--cyberscan-electric);
  outline-offset: 2px;
  ```
- **Responsive Layout:**
  - **Desktop (1280px+):** Multi-column split view (Radar Console on left, Attack Path Matrix on right).
  - **Mobile / Tablet (<768px):** Stacked single-column layout, bottom navigation bar, and slide-up modal sheets.

---

## 9. Design Intelligence & Anti-Vibecoding Standards

Synthesized from **Anthropic's Frontend-Design Standard**, **UI/UX Pro Max Intelligence**, and **Antigravity Spatial Design**:

### 9.1. Grounding in the Subject Matter
- Every visual element must reflect the authentic vernacular of cybersecurity engineering: AST analysis, CVE identifiers, MITRE ATT&CK tactics, and deterministic reachability graphs.
- Never use generic SaaS clichés (e.g., warm cream `#F4F1EA` backgrounds, purple neon gradients, or artificial decorative metrics).

### 9.2. Anti-Vibecoding Rules (Strictly Enforced)
1. **Zero Dot-Matrix Grids:** Prohibit `radial-gradient` dotted matrices across surfaces. Canvas must remain solid, high-contrast obsidian (`#050811` / `#060b17`).
2. **Zero 4px Colored Border-Left on Cards:** Cards must never have thick colored left edges. Borders must be crisp, uniform 1px structural lines (`rgba(255, 255, 255, 0.08)`).
3. **Zero Pill Containers Around Simple Status Indicators:** Status indicators like `Engine Online` must be a clean, unboxed green dot with calm label text—never enclosed in a bordered glowing pill.
4. **Restricted Backdrop Blur:** Do not use `backdrop-filter: blur()` on standard content cards. Glassmorphic blur is reserved strictly for floating modal sheets to focus attention on the active dialog.
5. **No Decorative Numbering on Non-Sequences:** Never use `01 / 02 / 03 / 04` markers unless the content represents a strict chronological timeline or workflow. Concurrent features must use semantic category tags (`PRIORITIZE`, `CORRELATE`, `REMEDIATE`, `VERIFY`).
6. **No Arbitrary Single-Word Headline Italicization:** Avoid artificial emphasis gimmicks that signal AI-templated copy.

### 9.3. Spatial Elegance & Motion Restraint
- **Weightlessness via Layered Insets:** Achieve physical elevation with subtle top-edge rim highlights (`inset 0 1px 0 rgba(255, 255, 255, 0.12)`) and deep, diffused ambient drop shadows rather than heavy visible outlines.
- **Single Orchestrated Page Entrance:** Use GSAP for a single coordinated load sequence (hero copy stagger + console 3D perspective settling). Do not litter the page with continuous floating, bouncing, or scattered scroll triggers.
- **Responsive Haptic Feedback:** Micro-interactions respond with subtle scale compression (`active:scale-[0.98]`) within `120ms` to provide immediate tactile confirmation.

### 9.4. Interaction Rigor & Accessibility
- **WCAG AA Contrast ($\ge 4.5:1$):** All text and controls must maintain high chromatic contrast against dark surfaces.
- **Multi-Sensory Status:** Never communicate severity or status through color alone; always pair color with bold typographic labels (`CRITICAL`, `HIGH`, `CONFIRMED`) and metadata tags.
- **Full Keyboard Navigation:** All actionable controls must exhibit visible electric-blue focus rings (`focus-visible:ring-2 focus-visible:ring-[#00e5ff]`).
- **Stable Layout Slots (Zero CLS):** Dynamic counters and badges must use tabular figures (`font-variant-numeric: tabular-nums`) and stable layout containers to prevent layout jumps during data refreshes.
- **1-Click AI Fix Workflow:** Deterministic remediation prompts engineered for Cursor, Copilot, and Claude Code must provide immediate copy feedback (`✓ Copied AI Prompt`) with proper ARIA live announcements.

