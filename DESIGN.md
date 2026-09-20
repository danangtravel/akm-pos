# OpenDesign System: AKM POS (Retail & Repair Chain)
**Project:** AKM POS Enterprise Platform  
**Design Reference:** [OpenDesign (nexu-io/open-design)](https://github.com/nexu-io/open-design) · [Stitch Design System](https://stitch.withgoogle.com/)  
**Version:** 2.0.0 (Modernized & Mobile-First Optimized)

---

## 1. Visual Theme & Atmosphere

* **Atmosphere:** High-precision, ultra-clean, utilitarian yet deeply refined modern retail & repair point-of-sale workstation.
* **Aesthetic Mood:** Focused, ergonomic, responsive, and trustworthy. Built with crisp lines, subtle borders, soft multi-layer diffused drop shadows, and subtle glassmorphic top headers and backdrops.
* **Density & Geometry:** Balanced compact layout designed for high throughput in retail environments, offering dense yet readable data grids, zero horizontal overflow on all viewports, and dedicated touch ergonomics for handheld smartphones and tablets.

---

## 2. Color Palette & Functional Roles

| Semantic Role | Name | Hex Code | Purpose / Usage |
| :--- | :--- | :--- | :--- |
| **Primary Base** | Deep Pine Teal | `#0f766e` | Brand headers, primary action CTAs, active menu badges, focus outlines. |
| **Primary Hover** | Emerald Teal | `#0d9488` | Hover state on primary interactive elements. |
| **Primary Tint** | Light Teal Tint | `#f0fdfa` | Background for active category pills, active sidebar links, selected rows. |
| **Primary Accent** | Soft Seafoam | `#ccfbf1` | Border accents on active tabs and highlight containers. |
| **Primary Dark** | Dark Spruce | `#115e59` | Active pressed button backgrounds, high-contrast dark badges. |
| **Neutral Background** | Cool Slate Canvas | `#f8fafc` | Global application background canvas behind cards and modals. |
| **Surface Card** | Pure White Surface | `#ffffff` | Card containers, modal sheets, product tiles, data tables. |
| **Border Subdued** | Slate Divider | `#e2e8f0` | 1px border lines separating panels, grid items, and table rows. |
| **Border Active** | Slate Muted Stroke | `#cbd5e1` | Inactive input strokes, pill boundaries, and drag handles. |
| **Text Primary** | Deep Midnight Slate | `#0f172a` | High-contrast headings, prices, item titles, and critical numbers. |
| **Text Secondary** | Muted Charcoal | `#334155` | Body text, table labels, active navigation icons, and metadata. |
| **Text Muted** | Slate Gray | `#64748b` | Timestamps, SKUs, barcode labels, and breadcrumb hints. |
| **Text Subtle** | Light Slate | `#94a3b8` | Placeholders, inactive icons, and helper hints. |
| **Status: Success** | Mint Emerald | `#10b981` | Completed orders, paid invoices, in-stock badges (`#d1fae5` / `#065f46`). |
| **Status: Warning** | Amber Glow | `#f59e0b` | Pending transfers, waiting for parts, low stock alert (`#fef3c7` / `#92400e`). |
| **Status: Danger** | Crimson Coral | `#ef4444` | Cancelled repairs, stock deficit, delete actions (`#fee2e2` / `#991b1b`). |
| **Status: Info** | Royal Indigo | `#3b82f6` | Ongoing repairs, inspecting status, audit log badges (`#dbeafe` / `#1e40af`). |

---

## 3. Typography Rules

* **Font Family:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, sans-serif.
* **Headings:**
  * Page Title: `20px` / `1.25` line-height / Weight `500` - `600` / Letter spacing `-0.02em`.
  * Section Title / Modal Header: `16px` / `1.3` line-height / Weight `500` / Deep Slate (`#0f172a`).
  * Card Header: `14px` / Weight `500` / Dark Slate (`#1e293b`).
* **Body & Data:**
  * Standard Body: `12px` - `13px` / `1.45` line-height / Text Secondary (`#334155`).
  * Compact Label / Metadata: `10.5px` - `11.5px` / Text Muted (`#64748b`).
* **Tabular Currency & Quantities:**
  * `font-variant-numeric: tabular-nums` used consistently for POS cart sums, table prices, and inventory balances to ensure strict vertical alignment.

---

## 4. Component Stylings & Elevations

### 4.1 Buttons
* **Primary Action:** Solid Pine Teal with smooth gradient `linear-gradient(135deg, #0f766e, #0d9488)`, white text, `border-radius: 10px`, soft shadow `0 2px 8px rgba(15, 118, 110, 0.25)`. Active scale `0.98`.
* **Secondary Action:** Light surface `#f1f5f9` with border `1px solid #e2e8f0`, text `#334155`. Hover `#e2e8f0`.
* **Danger / Warning:** Soft tint background (`#fee2e2`), border `1px solid rgba(239, 68, 68, 0.2)`, text `#991b1b`.
* **Touch Dimensions:** Minimum height `36px` on desktop, `42px` to `46px` on mobile with `touch-action: manipulation`.

### 4.2 Cards & Containers
* **Border:** `1px solid #e2e8f0`.
* **Corner Radius:** Subtly rounded `12px` (standard) to `16px` (large card / KPI widget).
* **Elevation:** Multi-layer whisper-soft drop shadow:
  `box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 4px 16px -2px rgba(15, 23, 42, 0.06);`

### 4.3 POS Product Grid & Interactive Tiles
* **Card Geometry:** Soft `12px` rounded card, border `1px solid #e2e8f0`, background `#ffffff`.
* **Visual Media:** Crisp image container with fallback category SVG glyphs, hover image scale `1.04`, stock count chip in the corner.
* **Pricing Highlight:** High-contrast Pine Teal price tag with formatted Vietnamese Dong (`₫`).
* **Touch Ergonomics:** Active tap feedback with immediate visual feedback (`transform: translateY(1px) scale(0.99)`).

### 4.4 Category Navigation Pills
* **Geometry:** Pill-shaped `border-radius: 9999px`, height `34px`, border `1px solid #e2e8f0`, background `#ffffff`.
* **Active State:** Solid or soft teal glow background (`#0f766e` / `#f0fdfa`), text `#0f766e`, border-color `#0f766e`.
* **Navigation:** Smooth touch swipe support + subtle desktop scroll arrows (`chevron-left`, `chevron-right`).

### 4.5 Mobile Bottom Navigation & Floating Cart Bar
* **Mobile Floating Cart:** Sticky floating bar with pill shape, pinned above bottom navigation (`bottom: calc(64px + env(safe-area-inset-bottom))`), item counter bubble, total sum, and animated tap action.
* **Mobile Bottom Nav:** Fixed frosted glass dock (`height: 56px + safe-area-inset`), 5 primary ergonomic tap tabs with centered iconography and active state indicator.

### 4.6 Bottom Sheet & Modals
* **Desktop Modal:** Centered dialog, `max-width: 640px`, backdrop blur `rgba(15, 23, 42, 0.6) + backdrop-filter: blur(6px)`.
* **Mobile Bottom Sheet:** Automatically transitions to an iOS-style bottom sheet (`border-radius: 20px 20px 0 0`), drag handle indicator (`38px x 4.5px`), max-height `90dvh`, and bottom safe-area insets.

### 4.7 Data Tables
* **Header:** Sticky `#f8fafc`, uppercase micro-typography (`10px`), letter-spacing `0.05em`, border-bottom `1px solid #e2e8f0`.
* **Rows:** Subtle zebra hover `#f8fafc`, compact padding `10px 14px`, horizontal scroll isolation (`-webkit-overflow-scrolling: touch`).

---

## 5. Mobile & Responsive Layout Principles

1. **Strict Zero Horizontal Overflow:** `max-width: 100vw !important` and `overflow-x: hidden` applied to global layout containers.
2. **Safe-Area Insets:** Proper usage of `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` to accommodate modern smartphones with notches and gesture bars.
3. **Adaptive Breakpoints:**
   * `< 900px`: Desktop sidebar collapses into an off-canvas drawer with smooth slide animation and backdrop overlay; Mobile header with hamburger trigger is activated.
   * `< 768px`: Multi-column forms collapse gracefully to single column; Floating cart bar and bottom navigation activate for POS speed.
   * `< 480px`: Product grid shifts to optimized 2-column or 1-column layout; table actions collapse into clean card summaries.
4. **Instant Touch Feedback:** Zero delay on taps via `touch-action: manipulation`, high touch target bounds ($\ge 40\text{px}$).
