'use strict';
/* Retired 2026-10-03: this file validated a frozen build artifact at a hardcoded path
   ('/mnt/data/project-navigator_V45.6.18.html') from a different tool's sandbox filesystem.
   That path never existed in this environment, so the file crashed at module load before any
   test could run. The release it pinned to (V45.6.18) is long superseded by the current build
   (see build.js RELEASE_VERSION), and the governed-content checks it performed (visual guidance
   catalog completeness, benchmark boundary copy, accessibility safeguards) are covered going
   forward by their own per-feature test files (e.g. v45.6.17-visual-guidance-governance.test.js,
   v45.6.16-planning-benchmarks.test.js) rather than a one-off snapshot of a generated artifact. */
