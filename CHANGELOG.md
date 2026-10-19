# Change log

## 2026-10-19 — Portfolio interaction and mobile cube polish

- Separated free cube rotation from category navigation, with pointer ownership and safe cancellation handling.
- Isolated high-frequency cube animation updates and coordinated idle motion, selection transitions, visibility, reduced motion, and pause/resume.
- Added lightweight URL/history synchronization and consistent category, anchor, and overlay scroll behavior.
- Improved preview keyboard focus management and modal scroll locking.
- Kept the floating mobile cube clear of Experience text when overlap is detected.
- Reduced corner rounding on compact mobile cube tiles so the individual blocks remain square-shaped at the smaller rendered size. Larger cube tile styling is unchanged.

The source was verified with `npm run build` and a production Docker build. The deployed CSS asset was checked over public HTTPS; no post-deployment visual browser screenshot was taken for the final tile-radius adjustment.
