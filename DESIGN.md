# Research Engine — Design Brief

## Palette

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| Primary | `oklch(0.45 0.18 185)` | `oklch(0.65 0.15 185)` | CTAs, active states, links |
| Accent | `oklch(0.75 0.15 55)` | `oklch(0.72 0.17 70)` | Highlights, badges, warm emphasis |
| Background | `oklch(0.99 0.005 260)` | `oklch(0.14 0.015 260)` | Page canvas |
| Card | `oklch(1.0 0.0 0)` | `oklch(0.18 0.018 260)` | Elevated surfaces |
| Muted | `oklch(0.95 0.01 260)` | `oklch(0.22 0.02 260)` | Secondary backgrounds |
| Foreground | `oklch(0.15 0.01 260)` | `oklch(0.92 0.01 260)` | Body text |
| Border | `oklch(0.9 0.01 260)` | `oklch(0.28 0.02 260)` | Dividers, inputs |
| Destructive | `oklch(0.55 0.22 25)` | `oklch(0.55 0.22 25)` | Errors, remove actions |

## Structural Zones

- **Header**: `bg-card border-b shadow-subtle` — elevated, visually distinct.
- **Hero / Landing**: `gradient-hero` with `glass-strong` overlay cards.
- **Content Sections**: alternate `bg-background` and `bg-muted/30` to create rhythm.
- **Footer**: `bg-card` or `bg-muted/40` with subtle top border.
- **Cards**: `glass` or `bg-card` with `shadow-elevated` on hover.
- **Modals / Drawers**: `glass-strong` with `backdrop-blur`.

## Typography

| Role | Font | Weights | Usage |
|------|------|---------|-------|
| Display | Space Grotesk | 500–700 | Headlines, hero text, brand marks |
| Body | DM Sans | 400–500 | Paragraphs, labels, UI copy |
| Mono | Geist Mono | 400 | Code blocks, data values, timestamps |

- Base size: 16px / 1rem
- Line height: 1.5 body, 1.2 display
- Letter spacing: -0.02em on display sizes > 2rem

## Motion Principles

- **Entrance**: `fade-in` (translateY 8px → 0, 0.3s) for cards and sections.
- **Stagger**: children delay `index * 0.1s` when listing items.
- **Hover**: `transition-smooth` on buttons and cards; scale(1.01) + `shadow-elevated` on cards.
- **Loading**: `pulse-subtle` on skeletons; `float` on decorative icons.
- **Reduced motion**: respect `prefers-reduced-motion`; animate only `transform` and `opacity`.

## Glassmorphism

| Class | Opacity | Blur | Border | Use |
|-------|---------|------|--------|-----|
| `glass` | 0.6 | 12px | 0.4 alpha | Standard cards |
| `glass-strong` | 0.75 | 20px | 0.5 alpha | Modals, header overlays |
| `glass-subtle` | 0.35 | 8px | 0.25 alpha | Background decorative panels |

## Gradients

- `gradient-primary`: 135° from primary to slightly cooler teal — CTAs, active nav.
- `gradient-subtle`: 180° background-to-muted — section separators.
- `gradient-hero`: dark radial with subtle depth — landing hero background.

## Shadows

- `shadow-subtle`: 1px depth for resting cards.
- `shadow-elevated`: 10px depth for hover / active cards.
- `shadow-glow`: primary-colored ambient glow for focused primary elements.

## Constraints

- No raw Tailwind palette colors (`bg-white`, `bg-gray-*`, etc.).
- All colors via OKLCH CSS custom properties.
- Fonts loaded via `@font-face` with `font-display: swap`.
- Dark mode toggled via `.dark` class on `<html>`.
- `color-scheme: dark` set in dark mode for native inputs.
