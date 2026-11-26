# Calm interface motion

The existing white-dominant workspace, indigo navigation and gold actions are preserved. Motion acknowledges state changes without delaying interactions, changing data fetching or remounting form content. No runtime package was added.

## Modified files for this request

- `src/theme.css`: centralized motion tokens and reduced-motion token overrides.
- `src/styles.css`: imports shared motion styles, removes old spinner/toast travel/drawer slide and duplicate accessibility rules, makes initial loading/error surfaces midnight with inverse text and a static gold marker.
- `src/main.jsx`: adds the stable ViewMotion wrapper around rendered page content; observes page/project/researcher/tab/phase identity, without changing navigation setters, requests, API commands or business conditions. Existing footer/branding edits are retained; footer indentation was formatted.
- `src/SPEC.md`: records the motion/continuity and accessibility contract.
- `DESIGN.md`: records motion design rules and helper usage.

## New files

- `src/motion.css`: reusable property-specific control/surface feedback, entrances, scrim animation, pointer-only micro-interactions, drawer opacity transition, reduced-motion and print rules.
- `src/motion.jsx`: ViewMotion presentation helper; cancels interrupted animations and responds to live reduced-motion changes. Understands both seconds and milliseconds, since production CSS minification may normalize token units.
- `tests/ui/motion.spec.js`: five real-browser tests covering timings, hover layout stability, view/tab continuity, interruption, modal/menu focus, reduced-motion, static dark loading and accessibility.
- `docs/MOTION.md`: this manifest and token/accessibility reference.

Ignored `.thinkrail/context/` scripts, logs and previews are local evidence, not application deliverables. Earlier palette, logo, font, footer and sign-in edits are not newly attributed to this request.

## Transition tokens

- `--motion-fast: 150ms`: control color/background/border and transform feedback.
- `--motion-standard: 200ms`: shared entrances and menu opacity.
- `--motion-view: 220ms`: page/project/researcher/tab/phase shallow reveals and toast entrance.
- `--motion-overlay: 250ms`: dialog and dark-scrim entrance.
- `--motion-ease-out: cubic-bezier(0.16, 1, 0.3, 1)`: gentle deceleration for arrivals/hover.
- `--motion-ease-in-out: ease-in-out`: continuity between views.
- `--motion-lift: -1px`: fine-pointer button micro-interaction only.
- `--motion-reveal-opacity: 0.96`: near-opaque starting point, preserving readability rather than disappearing to blank white.

## Utilities and application

- `.motion-feedback`: opt-in to the same explicit five-property feedback as buttons, links, fields, navigation, tabs and existing interactive card/record surfaces.
- `.motion-micro`: opt-in to a 1px hover lift with an immediate-purpose press return. Automatically applied to `.button`; disabled controls, touch and reduced-motion never lift. Static cards do not move.
- `.motion-fade`: shared 200ms shallow opacity reveal.
- `.motion-view`: ViewMotion's stable container; 220ms Web Animations reveal keyed by presentation identity, not a React key that destroys form state.
- `motion-reveal` keyframes: opacity only, ending at 1; also used for modal content, toasts, review/edit panels, discard confirmation and advisory replies.
- `motion-scrim` keyframes: background-color only, midnight at 65% to the existing 82% scrim. It never introduces a white overlay.
- Mobile navigation transitions opacity in place; its existing visibility/inertness behavior still makes closed navigation unavailable immediately.

No `transition: all`, animated dimensions/margins, zoom, bounce, sweeping movement, infinite spinner, permanent `will-change` or staggering. Animating color does repaint, so feedback is limited to affected control/surface backgrounds rather than full-page palette transitions.

## Accessibility and deliberate limits

`prefers-reduced-motion: reduce` sets timing tokens to 0ms, lift to zero and reveal opacity to one. Global CSS disables animation, transitions and smooth scrolling, including pseudo-elements. ViewMotion checks the preference before starting, cancels when it changes to reduce, and cleans up on interruption/unmount. Print is also motion-free.

The skip link is excluded from generic link transitions so its offscreen/focused position changes immediately rather than travelling over content. Keyboard outlines are not delayed or faded; focus and modal/drawer trapping, restoration and inertness retain their prior behavior. Text is fully opaque after each reveal; disabled controls are not further faded. The loader uses static gold plus text on midnight instead of a flashing/pulsing/spinning indicator.

These are shallow entrance fades rather than retaining stale interactive DOM for a full old/new cross-dissolve. Dismissal remains immediate: no cosmetic exit delay, detached focus target, stale record, duplicate interactive view or extra request. Native select popups keep OS-controlled open/close motion; their controls use shared color/border feedback. Users can act immediately throughout.

## Verification

- `npm run build` → passes with the shared styles/helper and no new dependency.
- `npm test` → 12 backend/report tests pass.
- Playwright Chromium → all 27 tests pass (22 unchanged regression tests plus five motion tests).
- Page-by-page desktop/mobile axe scan → zero violations, page errors or horizontal overflows in tested states.
- `git diff --check` → passes.
- Five targeted browser tests verify actual production-minified timing values, no hover-driven layout shift, stable view DOM across tab changes, rapid navigation cancellation, modal/menu fade and focus, reduced motion including a live preference change, and a gated dark/static initial loader.
- Existing functional regressions and axe scans remain unchanged; the new suite adds coverage rather than weakening those tests.
- Browser evidence is not a universal device-performance or assistive-technology certification.
