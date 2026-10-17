# DRAFT — Design System

**"Obsidian + Ice" · dark only · cinematic architectural.**
The UI is near-monochrome; colour comes from the live 3D scene (dusk sky, window
glow, blueprint lines). Exactly one accent — ice-blue — used sparingly.

## Awesome Design reference
Picked **`linear.app`** (`reference/awesome-design-md/design-md/linear.app/DESIGN.md`):
a near-black, single-accent, hairline-panel system with large display type and tight
negative tracking — "quietly luxurious software-craft." We keep its structure and swap
its cool lavender accent for **ice-blue**, matching the dusk-lit 3D scene.

## Color tokens (authored in `src/app/globals.css` `:root`)
| Token | Value | Use |
|---|---|---|
| `--bg` | `#08090B` | obsidian base |
| `--panel` | `#101216` | panel 1 |
| `--panel-2` | `#171A20` | panel 2 / raised |
| `--ink` | `#F2F4F7` | primary text |
| `--ink-soft` | `#C9CED7` | secondary text |
| `--muted` | `#8A919E` | tertiary text |
| `--faint` | `#5B616C` | labels, hints |
| `--hairline` | `rgba(255,255,255,.08)` | borders |
| `--hairline-strong` | `rgba(255,255,255,.14)` | stronger borders / inputs |
| `--accent` | `#9EC5FF` | **the single accent** — active state, primary CTA, room-highlight glow |
| `--accent-soft` | `#c2dbff` | accent hover |
| `--accent-glow` | `rgba(158,197,255,.35)` | focus rings / glow |

Dark mode is the only mode — there is no light theme, `[data-theme]` override,
`prefers-color-scheme` block, or theme toggle.

## Typography
- **Display** — Bricolage Grotesque (`--font-display`): headlines, nav, buttons. Weight 400–600, tracking −0.03 to −0.04em.
- **Body** — Geist (`--font-body`): paragraphs, UI.
- **Mono** — Geist Mono (`--font-mono`): dimensions, labels, technical readouts.

Fonts are loaded via `next/font/google` on `<html>` so `:root` tokens resolve.

## Spacing & layout
8px scale: `--s1`…`--s8` (8 → 128). Max content width `--maxw: 1440px`.
Shadows are dark (`--shadow-sm/md/lg`), used sparingly — depth comes from the 3D scene and hairlines, not drop shadows.

## Motion
- Lenis smooth-scroll bridged to GSAP ScrollTrigger on a single RAF (`SmoothScroll.tsx` + `lib/scroll.ts`).
- The landing is a pinned, scrubbed R3F film (`components/landing/`).
- `prefers-reduced-motion` and phones fall back to a static hero (`MobileFallback.tsx`). DPR capped at 1.5.

## Conceptual-output disclaimer
Draft produces conceptual visualizations, not construction documents. This is stated on the landing, in the editor, and in the footer.
