# Thesis Architecture — 3D Model Redesign Brief

## Mission
Redesign the WebGL "model" in the **"ONE CONVICTION. FOUR LAYERS."** section of the
satori.ventures marketing site. The current model looks cluttered and not premium
enough. Rebuild it so it reads as a **high-end, restrained, gallery-grade object** —
the kind of hero visual you'd expect on a top-tier VC / frontier-tech site.

This is a **LIVE production VC marketing site**. Quality bar is extremely high. Ship
something that looks intentional and expensive, not busy.

## Files (the ONLY files you should touch)
- `components/SatoriCubeScene.tsx` — the R3F scene = **the model itself**. This is your
  primary canvas. Rewrite freely inside the contract below.
- `components/SatoriCube.tsx` — the section wrapper (heading, scroll pinning, theme
  tokens, reduced-motion fallback). Touch **only** if you need to adjust lighting/theme
  tokens or the reduced-motion card fallback to match the new look. Do **not** change the
  section structure, the `h-[400svh]` pinned scroll, the eyebrow/heading copy, or the
  props it passes down.

Do not touch any other file. Do not add new routes, pages, or components.

## HARD CONSTRAINTS (do not break — the site will crash or fail to deploy otherwise)
1. **No new dependencies.** Only `three` (^0.169.0) and `@react-three/fiber` (^8.17.10)
   are installed. `@react-three/drei` and `postprocessing` are **NOT installed** — do not
   import them. Write raw three.js / R3F. No `<Environment>`, no `<OrbitControls>`, no
   `<EffectComposer>`, no bloom postprocessing passes from drei/postprocessing. If you
   want bloom/glow, fake it with additive materials, sprite halos, or emissive geometry —
   the current file already does this.
2. **Preserve the default-export props contract** of `SatoriCubeScene`:
   `{ progress, focusRef, onFocus, onExpand, dark }`.
   - `progress` is a `RefObject<number>` in **[0,1]** driven by scroll. Read
     `progress.current` inside `useFrame` to drive the reveal/separation choreography.
     0 = section entering (layers together / forming), 1 = section fully scrolled
     (layers fully expressed / dissolving to the brand mark). Keep a clear, smooth
     journey across that range.
   - `focusRef` is a `RefObject<number>` holding the index (0–3) of the hovered layer,
     or `-1` for none.
   - `onFocus(i: number | -1)` must be called on raycast hover of a layer.
   - `onExpand(i: number | null)` must be called on click of a layer.
   - `dark` is a boolean theme flag (dark neon-noir vs light red-lux).
3. **Keep hover-to-focus + click-to-inspect** raycasting against the 4 layers. Hovered
   layer should visually lift/brighten; clicked layer triggers `onExpand`.
4. **Keep the 4-layer semantics** — import and honor `CUBE_LAYERS` from `SatoriCube.tsx`
   (4 entries: Physical Infrastructure, Network & Connectivity, AI & Intelligence,
   Application & Economy). The model is literally "four layers, one conviction" — a
   vertical **stack of 4** is the through-line and must remain legible as four distinct
   tiers that belong to one whole.
5. **Theme-split.** Respect `dark`: a dark palette (deep neutral stage, gold + crimson
   accents, additive glow) and a light palette (paper-light stage, red-lux, normal
   blending). The existing `PALETTES` object is a good starting point.
6. **Reduced-motion + SSR.** The scene is loaded with `ssr:false` via `dynamic()` — keep
   it that way. The reduced-motion 2-column card fallback in `SatoriCube.tsx` must keep
   working; if you restyle it, keep it static (no motion) and on-brand.
7. **Performance.** Keep `dpr={[1, 1.75]}` (or lower), keep instancing for any repeated
   geometry, dispose of geometries/materials, and keep the whole scene at **60fps on a
   mid mobile**. Mobile uses a pulled-back camera (`z≈10.6`), desktop `z≈7.6`, fov 45 —
   preserve responsive framing. Fewer, better elements beats many small ones.
8. **TypeScript + `next build` must pass.** No `any`-driven breakage, no unused-import
   lint fails that block the build. Keep `"use client"` where needed.

## ART DIRECTION — what "better" means here
Think **less is more**. The current model crams per-layer machinery (pillar fields,
lattice nets, icosahedra + orbiters, market torus + token octahedra, corner rails, halo
rings, packets, motes) into one frame — it reads noisy. Redesign toward:

- **One signature idea per layer.** Each of the 4 tiers gets a *single*, refined
  identity motif — not a pile of props. E.g. layer 0 (Physical Infrastructure) = a clean
  substrate / grid-etched base; layer 1 (Network) = sparse elegant connection lines;
  layer 2 (AI) = one luminous core; layer 3 (Application/Economy) = one graceful ring.
  Restraint is the point. It's fine to reduce total geometry by half or more.
- **Premium glass & light.** Elevate the slab material: convincing fresnel/rim light,
  subtle internal depth, clean edges, tasteful emissive accents. Avoid muddy additive
  blowout. The object should feel like machined glass + light, not a particle soup.
- **Confident composition.** The 4 tiers, stacked, should form one strong silhouette at
  rest and separate/breathe gracefully as you scroll. Generous negative space. Let it
  feel still and expensive, not frantic.
- **Refined motion.** Slow, eased, purposeful. Gentle idle rotation/parallax. Smooth
  scroll-driven separation with good easing (the file has `ss()` smoothstep and `env()`
  helpers — keep that discipline). Hover = a calm lift + glow, not a jump.
- **Cohesive palette.** Gold + crimson as accents over a restrained neutral stage in
  dark; red-lux over light. Accent should feel like jewelry — sparing, precise.

## Scroll choreography (keep the spirit, refine the execution)
- `progress ~0.0`: layers gathered / forming, camera easing in.
- `progress ~0.3–0.7`: the stack separates into 4 clearly-readable tiers, each motif
  becoming legible; this is the "read the thesis" beat.
- `progress ~0.85–1.0`: the layers converge/dissolve toward the brand mark (the current
  file dissolves into a logo shape — keep an elegant resolution, but you may simplify it).

## Interactions to preserve
- Hover a layer → `onFocus(i)`, that tier lifts + glows, others recede slightly.
- Mouse leave → `onFocus(-1)`, all tiers return to rest.
- Click a layer → `onExpand(i)` (the wrapper shows that layer's detail card).
- Everything must also degrade gracefully with no pointer (touch) — don't hard-require
  hover for the scene to look complete.

## Deliverable
A rewritten `components/SatoriCubeScene.tsx` (and, if needed, minimal edits to the
lighting/theme tokens or reduced-motion fallback in `components/SatoriCube.tsx`) that:
- compiles cleanly (`next build` passes),
- honors every hard constraint above,
- looks materially more premium and less cluttered than the current version,
- keeps the four-layer story and all interactions intact.

Do not run git, do not commit, do not push, do not start a dev server — just edit the
files. The human will review the diff and handle build + deploy.
