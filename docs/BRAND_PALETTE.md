# Health Pro CEO — Brand Palette

Clinic Growth OS uses the **Health Pro CEO Brand System v2** for consistent branding across sites. Dark depth + gold authority. No white space — gold glow replaces light.

## Quick Reference

| Token | Hex | Use |
|-------|-----|-----|
| Void | `#050506` | Modals, overlays |
| Black | `#09090B` | Page background |
| Dark | `#0F0F12` | Alt sections |
| Elevated | `#151519` | Cards, inputs |
| Surface | `#1A1A1F` | Hover, active |
| **Gold** | `#D4A843` | **CTAs, accents** |
| Gold Bright | `#E8C96A` | Hover states |
| Gold Deep | `#B08A2A` | Pressed, gradient end |
| Gold Muted | `#9A7D3A` | Disabled, tertiary |
| Text White | `#FFFFFF` | Stats, H1 only |
| Text Primary | `#E4E4E7` | Body, headings |
| Text Secondary | `#A1A1AA` | Descriptions |
| Text Tertiary | `#71717A` | Captions |
| Text Ghost | `#52525B` | Placeholders |
| Success | `#22C55E` | Checkmarks |
| Error | `#EF4444` | Warnings |
| Info | `#3B82F6` | Links |

## Typography

- **Display**: Playfair Display (headlines, stats)
- **Body**: DM Sans (copy, UI)

## Files

- `client/src/lib/health-pro-ceo-tokens.css` — Raw CSS variables (--hpc-*)
- `client/src/index.css` — App semantic tokens mapped to HPC in dark mode

## Rules

1. Gold is the only decorative accent — never add purple, pink, etc.
2. White only for stats and hero H1 — never for body text
3. Use gold glow (4–20% opacity) instead of white space for warmth
4. One primary CTA per viewport — gold gradient
