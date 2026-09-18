---
name: Nocturnal Physical Therapy
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bcc9cd'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#869397'
  outline-variant: '#3d494c'
  surface-tint: '#4cd7f6'
  primary: '#4cd7f6'
  on-primary: '#003640'
  primary-container: '#06b6d4'
  on-primary-container: '#00424f'
  inverse-primary: '#00687a'
  secondary: '#bbc7df'
  on-secondary: '#253144'
  secondary-container: '#3b475b'
  on-secondary-container: '#a9b6cd'
  tertiary: '#4ae176'
  on-tertiary: '#003915'
  tertiary-container: '#14bf59'
  on-tertiary-container: '#00461b'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#acedff'
  primary-fixed-dim: '#4cd7f6'
  on-primary-fixed: '#001f26'
  on-primary-fixed-variant: '#004e5c'
  secondary-fixed: '#d7e3fc'
  secondary-fixed-dim: '#bbc7df'
  on-secondary-fixed: '#0f1c2e'
  on-secondary-fixed-variant: '#3b475b'
  tertiary-fixed: '#6bff8f'
  tertiary-fixed-dim: '#4ae176'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005321'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
  bg-base: '#0F172A'
  bg-surface: '#1E293B'
  bg-surface-alt: '#293548'
  border: '#334155'
  text-primary: '#F1F5F9'
  text-secondary: '#94A3B8'
  accent: '#06B6D4'
  success: '#22C55E'
  warning: '#F59E0B'
  danger: '#EF4444'
  disabled: '#475569'
typography:
  title:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  section:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  card-title:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '500'
    lineHeight: 22px
    letterSpacing: -0.005em
  body:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  caption:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.01em
  display-timer:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

The brand personality is clinical, discreet, non-punitive, and physiologically reassuring. Built specifically for late-night mobile usage in low-light conditions—often one-handed while lying in bed—the interface eliminates stress, guilt, and performance anxiety.

### Core Philosophy
- **Non-punitive by design:** Zero streaks, zero missed-day tallies, no red-ink penalties, and no gamified pressure badges. If a user misses a day, the system absorbs it quietly without debt or retroactive penalties.
- **Tone & Voice:** 100% Spanish Rioplatense ("Marcá solo lo de hoy", "Arranca de nuevo", "Inhalá — dejá bajar"). Direct, grounded, respectful, and medical without being cold.
- **Visual Movement:** High-contrast Dark Minimalism meets functional tactile ergonomics. Surfaces are defined by crisp, explicit structural borders rather than blur or elevation shadows.

### Primary Audience & Context
Men undergoing pelvic floor rehabilitation, down-regulation, and tension release. The app is interacted with in quiet intimacy; hence, bright saturated fills, glaring whites, jarring alarm states, and loud decorative illustrations are strictly absent.

## Colors

The system employs a deliberate dark-mode-only palette anchored in deep slate blues. Colors are functional indicators rather than decorative highlights.

### Token Map & Semantic Purpose
- `bg-base` (`#0F172A`): Deep canvas foundation designed to minimize OLED power drain and eye strain in pitch-black rooms.
- `bg-surface` (`#1E293B`): Standard elevation tier for interactive cards, sheets, and modular exercise blocks.
- `bg-surface-alt` (`#293548`): Contrast surface reserved for callouts, guidance banners, and active selected states.
- `border` (`#334155`): The sole structural separator across all UI components.
- `text-primary` (`#F1F5F9`): Clean, maximum-legibility white for primary directives, titles, and active inputs.
- `text-secondary` (`#94A3B8`): Muted slate for exercise parameters, dosage units, and contextual reassurances.
- `accent` (`#06B6D4`): Cyan highlight used exclusively for active timers, focus metrics, and primary actionable paths.
- `success` (`#22C55E`): Positive completion signal. Never used in isolation—always backed by a check glyph (`✓`).
- `warning` (`#F59E0B`): Cautionary medical threshold indicator (e.g., stopping when pain is felt or backup overdue). Never formatted as an alarming red state.
- `danger` (`#EF4444`): Acute physiological alerts or explicit session terminations.
- `disabled` (`#475569`): Dormant phases and inaccessible locked modules.

### Strict Color Rules
1. Never communicate status through color alone. Every completed check requires a filled circle/box plus a distinct check glyph.
2. Under no circumstance should a missed day, incomplete adherence target, or gap in history trigger `danger` (#EF4444).

## Typography

Typography is set entirely in **Inter** to ensure maximum legibility at oblique viewing angles in low-light mobile environments. 

### Scale & Minimum Constraints
- **Title (28/700):** Screen-level identifiers (`Buenas noches`, `Dosis mínima`, `Registro de hoy`).
- **Section (20/600):** Category delimiters and logging variable prompts (`Tensión en reposo`, `Respiración y suelo pélvico`).
- **Card Title (17/500):** Specific routine item names and tactical exercise labels.
- **Body (16/400):** Instructional text, step-by-step guidance, and callout bodies.
- **Caption (14/400):** Dosage parameters, secondary metadata, and non-critical guidance.
- **Display Timer (48/700):** Central countdown display in the guided breathing monitor.

**Strict Baseline Rule:** Nothing in this design system is rendered below 14px. Small sub-pixel micro-labels are forbidden to prevent eye fatigue.

## Layout & Spacing

The viewport is locked to a mobile canvas standard of **390 × 844 pt**. All interactive hierarchies are tailored for one-handed reachability (thumb-zone ergonomics).

### Spacing Scale
The system adheres to an exact token sequence:
- `4px` (`0.25rem`): Inline micro-gaps and badge paddings.
- `8px` (`0.5rem`): Tight component spacing, icon-label offsets, and chip internal gutters.
- `12px` (`0.75rem`): Compact card padding and segmented control inner gaps.
- `16px` (`1rem`): Standard layout gutters, lateral margins, and inter-card gaps.
- `24px` (`1.5rem`): Section header separation and stacked module margins.
- `32px` (`2rem`): Major functional zone delineations.
- `48px` (`3rem`): Primary breathing ring whitespace, footer buffers, and minimum touch target size.

### Ergonomic Thumb Zone Rules
- **Primary Interactive Zone:** All primary action buttons (`Empezar rutina`, `Guardar`, `Detener`) must be anchored inside the bottom 60% of the viewport.
- **Touch Target Integrity:** Every tappable affordance (buttons, segmented options, rating pills, checkboxes) must maintain an absolute minimum hit target of `48×48px`.

## Elevation & Depth

This design system avoids decorative depth illusions entirely:
- **No Drop Shadows:** Ambient, diffuse, or hard box-shadows are strictly forbidden. Shadows degrade readability on OLED panels and introduce artificial visual clutter.
- **Explicit Structural Borders:** Depth and spatial separation are established purely through `1px solid #334155` outlines bounding `bg-surface` (`#1E293B`) or `bg-surface-alt` (`#293548`) containers.
- **Tonal Contrast:** Subtle shifts between `#0F172A` (canvas base) and `#1E293B` (interactive cards) provide visual stratification without elevation blur.
- **Status Accents via Inset Borders:** High-priority notices (such as safety warnings or correct execution feedback) utilize a `4px` solid border-left directly on the container surface (`#22C55E` for confirmation, `#F59E0B` for medical safety precautions).

## Shapes

The geometry balances structured technical rigor with human-friendly touch anchors.

### Shape Tiers
- **Cards & Structural Containers (`12px`):** Used for all routine cards, adherence blocks, warning banners, and media preview wrappers.
- **Interactive Controls (`8px`):** Used for standard primary/secondary buttons, segmented control buttons, and text input boxes.
- **Pills & Badges (`999px`):** Used for metadata chips (e.g., `Fase 1 · Semana 3`, `mín`), numeric scale buttons (0 to 10 scale on daily log), and circular progress tracks.

## Components

### Buttons
- **Primary:** Full width (or paired), height 48px minimum, border-radius 8px. Background `accent` (`#06B6D4`), label `Inter 16/600` in `#0F172A` (or `#F1F5F9` depending on optical legibility threshold). Active press state shifts to subtle opacity reduction (0.9), never elevation shifts.
- **Secondary:** Height 48px minimum, background `bg-surface-alt` (`#293548`), border `1px solid #334155`, text `text-primary` (`#F1F5F9`).
- **Disabled:** Background `transparent`, border `1px solid #475569`, text `disabled` (`#475569`), non-clickable.

### Checkboxes
- **Target Size:** Strict `48×48px` tappable footprint with an inner `24×24px` visual box.
- **Unchecked:** `bg-surface` with `1px solid #334155` border.
- **Checked:** Background transitions to `success` (`#22C55E`), containing a crisp `#0F172A` checkmark glyph. The parent card row gains a subtle highlight, reinforcing completion without changing red or introducing game sounds.

### Chips & Badges
- **Dose Tag (`mín`):** Rounded `999px`, height 24px, padding 2px 8px. Background `bg-surface-alt`, text `caption` (14/400) in `accent` (`#06B6D4`).
- **Phase Status Chip:** Border `1px solid #334155`, background `bg-surface`, text `text-secondary`.

### 11-Point Metric Scale (Daily Log)
- Horizontal strip of 11 distinct pills numbered `0` to `10`.
- Each item is minimum `48×48px` touch target, border-radius `999px`.
- **Default State:** Background `bg-surface`, border `1px solid #334155`, text `text-primary`.
- **Selected State:** Background `accent` (`#06B6D4`), border `accent`, text `#0F172A` bold.

### Cards
- Standard background `bg-surface` (`#1E293B`), corner radius `12px`, border `1px solid #334155`.
- Inner padding `16px`. Zero shadow.
- Dosis mínima cards feature an explicit vertical height minimum of `96px`.

### Bottom Tab Bar
- Fixed at viewport base, total height `64px` plus device home-indicator safe area padding.
- Background `#0F172A`, top border `1px solid #334155`.
- Exactly 4 items: `Inicio`, `Rutina`, `Guía`, `Bitácora`.
- Active item uses `accent` (`#06B6D4`) icon and label; inactive items use `text-secondary` (`#94A3B8`).