# Change log

## 2026-10-20 — Desktop cursor-following ambient glow

- Added a cursor-following teal ambient glow on desktop, mounted as an isolated component with direct pointer positioning coalesced through `requestAnimationFrame`.
- Kept the effect behind page content, disabled it for touch/coarse pointers and reduced-motion preferences, and cleaned up scheduled frames and event listeners when disabled or unmounted.
- Refined the glow with offset elliptical gradients and feathered falloff; the latest adjustment halves the opacity at each stop while preserving its color, footprint, and immediate tracking.
- Verified with TypeScript/Vite and production Docker builds. The public stylesheet and portfolio health were checked after deployment; no screenshot check was run for the latest opacity adjustment.

## 2026-10-19 — Portfolio interaction and mobile cube polish

- Separated free cube rotation from category navigation, with pointer ownership and safe cancellation handling.
- Isolated high-frequency cube animation updates and coordinated idle motion, selection transitions, visibility, reduced motion, and pause/resume.
- Added lightweight URL/history synchronization and consistent category, anchor, and overlay scroll behavior.
- Improved preview keyboard focus management and modal scroll locking.
- Kept the floating mobile cube clear of Experience text when overlap is detected.
- Reduced corner rounding on compact mobile cube tiles so the individual blocks remain square-shaped at the smaller rendered size. Larger cube tile styling is unchanged.

The source was verified with `npm run build` and a production Docker build. The deployed CSS asset was checked over public HTTPS; no post-deployment visual browser screenshot was taken for the final tile-radius adjustment.
