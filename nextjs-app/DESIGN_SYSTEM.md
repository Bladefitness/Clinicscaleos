# DoctaBlade Design System

Universal design standard for Clinic Growth OS. Light-mode only, Apple.com aesthetic.

---

## Color Palette

### Primary

| Token | Hex | Usage |
|-------|-----|-------|
| `--primary` | `#4f46e5` | Buttons, links, focus rings, active states |
| `--primary-foreground` | `#ffffff` | Text on primary backgrounds |
| `--accent` | `#eef2ff` | Accent backgrounds (indigo-50) |
| `--accent-foreground` | `#4338ca` | Text on accent backgrounds |

### Neutrals (Slate)

| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#f8fafc` | Page background (slate-50) |
| `--foreground` | `#0f172a` | Primary text (slate-900) |
| `--card` | `#ffffff` | Card backgrounds |
| `--muted` | `#f1f5f9` | Muted backgrounds (slate-100) |
| `--muted-foreground` | `#64748b` | Secondary text (slate-500) |
| `--border` | `rgba(226, 232, 240, 0.6)` | Borders |
| `--input` | `#e2e8f0` | Input borders (slate-200) |

### Semantic

| Token | Hex | Usage |
|-------|-----|-------|
| `--db-success` | `#10b981` | Success states (emerald-500) |
| `--db-warning` | `#f59e0b` | Warning states (amber-500) |
| `--db-error` | `#ef4444` | Error states (red-500) |
| `--db-info` | `#3b82f6` | Info states (blue-500) |
| `--destructive` | `#dc2626` | Destructive actions (red-600) |

### Charts

| Token | Hex |
|-------|-----|
| `--chart-1` | `#4f46e5` (indigo) |
| `--chart-2` | `#8b5cf6` (violet) |
| `--chart-3` | `#10b981` (emerald) |
| `--chart-4` | `#f59e0b` (amber) |
| `--chart-5` | `#f43f5e` (rose) |

---

## Typography

**Font:** Inter (loaded via `next/font/google`, CSS variable `--font-inter`)

| Scale | Size | Line Height | CSS Variable | Usage |
|-------|------|-------------|--------------|-------|
| xs | 0.75rem (12px) | 1rem | `--db-text-xs` | Captions, badges |
| sm | 0.875rem (14px) | 1.25rem | `--db-text-sm` | Body small, labels |
| base | 1rem (16px) | 1.5rem | `--db-text-base` | Body default |
| lg | 1.125rem (18px) | 1.75rem | `--db-text-lg` | Card titles |
| xl | 1.25rem (20px) | 1.75rem | `--db-text-xl` | Section headers |
| 2xl | 1.5rem (24px) | 2rem | `--db-text-2xl` | Page subtitles |
| 3xl | 1.875rem (30px) | 2.25rem | `--db-text-3xl` | Page titles |
| 4xl | 2.25rem (36px) | 2.5rem | `--db-text-4xl` | Hero titles |

**Weights:** 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

**Font features:** `"cv02", "cv03", "cv04", "cv11"` for refined glyphs.

---

## Spacing

8px grid system. Use Tailwind spacing utilities:

| Spacing | Value | Common Use |
|---------|-------|------------|
| `p-4` | 16px | Compact card padding |
| `p-6` | 24px | Standard card padding |
| `p-8` | 32px | Page padding |
| `gap-6` | 24px | Card grid gaps |
| `gap-8` | 32px | Section gaps |
| `mb-6` | 24px | Between card sections |
| `mb-10`–`mb-14` | 40–56px | Between page sections |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | 0.75rem (12px) | Base radius |
| `rounded-lg` | 12px | Cards, buttons, inputs |
| `rounded-xl` | 16px | Large cards, buttons |
| `rounded-2xl` | 20px | Dialogs, modals |
| `rounded-full` | 50% | Badges, avatars |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--db-shadow-sm` | `0 1px 2px 0 rgba(0,0,0,0.05)` | Default cards |
| `--db-shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.07), ...` | Hover cards |
| `--db-shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.08), ...` | Dropdowns, popovers |
| `--db-shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.08), ...` | Dialogs, modals |

---

## Motion

| Token | Value | Usage |
|-------|-------|-------|
| `--db-duration-fast` | 150ms | Hover, color changes |
| `--db-duration-normal` | 250ms | Expand/collapse, tabs |
| `--db-duration-slow` | 400ms | Modal enter/exit |
| `--db-ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Apple-style deceleration |
| `--db-ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard transitions |

---

## CSS Utility Classes

| Class | Effect |
|-------|--------|
| `.glass` | `backdrop-blur-xl bg-white/70 border border-white/20` |
| `.glass-strong` | `backdrop-blur-[32px] bg-white/85 border border-white/20` |
| `.gradient-text` | Indigo-to-violet gradient text |
| `.gradient-text-warm` | Amber-to-orange gradient text |
| `.skeleton-shimmer` | Animated shimmer for loading states |

---

## Component Patterns

### Cards
```
bg-white border-slate-200/60 shadow-sm rounded-xl p-6
hover:shadow-md transition-shadow
```

### Buttons
- **Primary:** `bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm`
- **Secondary:** `bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl`
- **Ghost:** `hover:bg-slate-100 text-slate-600 rounded-xl`
- **Destructive:** `bg-red-600 hover:bg-red-700 text-white rounded-xl`

### Inputs
```
bg-white border-slate-200 rounded-xl
focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
```

### Tabs
- **List:** `bg-slate-100 rounded-xl p-1`
- **Active:** `bg-white text-slate-900 shadow-sm rounded-lg`
- **Inactive:** `text-slate-500 hover:text-slate-700`

### Sidebar Navigation
- **Active:** `bg-indigo-50 text-indigo-700 font-medium border-l-[3px] border-l-indigo-600`
- **Inactive:** `text-slate-600 hover:bg-slate-50 hover:text-slate-900`

### Tooltips
```
bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg
```

### Dialogs/Modals
- **Overlay:** `bg-slate-900/40 backdrop-blur-sm`
- **Content:** `bg-white rounded-2xl shadow-2xl`

### Empty States
```
border-dashed border-slate-200 bg-slate-50/50 rounded-2xl
Icon: bg-indigo-50 text-indigo-600 in rounded circle
```

---

## Accessibility

### Focus Ring (WCAG 2.1 AA)
```css
*:focus-visible {
  box-shadow: 0 0 0 2px white, 0 0 0 4px #4f46e5;
}
```

### Text Selection
```css
::selection {
  background-color: #e0e7ff;
  color: #312e81;
}
```

### Contrast
- Body text (`slate-900` on `slate-50`): 15.4:1
- Secondary text (`slate-500` on white): 4.6:1
- Primary button (`white` on `indigo-600`): 7.2:1

---

## Gradients

| Name | Value | Usage |
|------|-------|-------|
| Primary | `linear-gradient(135deg, #4f46e5, #7c3aed)` | Logo, hero icons |
| Warm | `linear-gradient(135deg, #f59e0b, #ea580c)` | Warm accent text |
| Text | `linear-gradient(to right, #4f46e5, #7c3aed)` | Page titles via `.gradient-text` |

---

## Do's and Don'ts

### Do
- Use `slate-*` for all neutral colors (never pure black `#000`)
- Use `bg-white` for cards on `bg-slate-50` page backgrounds
- Use `indigo-600` as the primary action color
- Use `rounded-xl` (16px) for interactive elements
- Use Inter font exclusively
- Use subtle shadows (`shadow-sm`) for depth
- Use glass effects for floating UI (mobile nav, sticky CTAs)
- Maintain 8px spacing rhythm

### Don't
- Use dark mode or `dark:` prefixed classes
- Use pure black (`#000000`) for text — use `slate-900`
- Use saturated backgrounds for cards — keep cards white
- Use more than 2 gradient colors
- Use shadows heavier than `shadow-xl`
- Mix font families
- Use `ring-offset` without matching background color
