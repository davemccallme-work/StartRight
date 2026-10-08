"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const R=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(R,f),"utf8");
// Retired 2026-10-03: the RELEASE_VERSION='V45.7.5.3.2' pin is superseded now the build is on V45.7.5.9.9.
// Retired 2026-10-05: this file pinned the sticky-header, bounded-max-height "scrollable spreadsheet
// panel" design (contain:inline-size, max-height:min(76vh,920px), sticky thead/tbody th) that the
// comparison table and document gallery used before the column-carousel pattern replaced it
// everywhere they render (see components.v45.7.3.css's own comment at the top of its visual-guidance
// block, and core/v45.7.5.9.4-scenario-guide-runtime.js, which now owns this table's real styling
// globally, not just inside the Scenario Guide dialog it was first built for). A sticky label
// COLUMN (not a sticky header ROW) is the current mechanism — see
// tests/v45.7.5.6-selected-column-reveal.test.js's successor assertions for that.
test("comparison no longer uses the retired sticky-header scrollable-panel design",()=>{
  const c=read("components.v45.7.3.css");
  assert.doesNotMatch(c,/visual-guidance-set--comparison\{[^}]*contain:inline-size/);
  assert.doesNotMatch(c,/thead th\{position:sticky!important;top:0!important/);
  assert.doesNotMatch(c,/tbody th\{position:sticky!important;left:0!important/);
});
test("advisor-open width remains contained",()=>{const c=read("components.v45.7.3.css");assert.match(c,/body\.advisor-open \.visual-guidance-set--comparison/);assert.match(c,/max-width:100%!important/);});
// 2026-10-05: left:0/z-index:2 alone don't pin anything — without position:sticky the label column
// scrolled away like any other cell once the carousel paged past column 1 (only invisible on column
// 1, where the label was already in its natural position). Strengthened to actually assert
// position:sticky is set, not just the offset/stacking properties that assumed it.
test("the label column is sticky instead, everywhere the table renders (not sticky-header, not dialog-only)",()=>{
  const s=read("core/v45.7.5.9.4-scenario-guide-runtime.js");
  assert.doesNotMatch(s,/#scenario-guide-dialog \.visual-guidance-comparison th\[scope="col"\]:first-child/);
  assert.match(s,/'\.visual-guidance-comparison th\[scope="col"\]:first-child,\.visual-guidance-comparison th\[scope="row"\]\{position:sticky!important;left:0!important/);
});
