"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const R=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(R,f),"utf8");
// Retired 2026-10-03: the RELEASE_VERSION='V45.7.5.3.1' pin is superseded now the build is on V45.7.5.9.9.
test("desktop photo table is intentionally wider than its viewport",()=>{const c=read("components.v45.7.3.css");assert.match(c,/min-width:1760px!important/);assert.match(c,/width:max-content!important/);assert.match(c,/overflow-x:auto!important/);});
// Retired 2026-10-05: th[scope="row"]'s own width:220px never actually applied — table-layout:fixed
// derives every column's width from the FIRST ROW (thead) alone, where the label cell is
// th[scope="col"], not th[scope="row"] — confirmed dead weight, removed rather than kept as a
// misleading no-op. The label column's real, applied width (180px, narrowed from the uniform
// 385px every column used to share) lives in core/v45.7.5.9.4-scenario-guide-runtime.js now,
// applied globally rather than just inside the Scenario Guide dialog.
test("label column width is set where it actually applies — the header row's th[scope=\"col\"]:first-child — not the dead th[scope=\"row\"] rule",()=>{
  const c=read("components.v45.7.3.css");
  assert.doesNotMatch(c,/th\[scope="row"\]\{width:220px/);
  const s=read("core/v45.7.5.9.4-scenario-guide-runtime.js");
  assert.match(s,/'\.visual-guidance-comparison th\[scope="col"\]:first-child,\.visual-guidance-comparison th\[scope="row"\]\{width:180px!important/);
});
test("each photo column preserves 385 pixels",()=>{const c=read("components.v45.7.3.css");assert.match(c,/width:385px!important/);assert.match(c,/min-width:385px!important/);});
test("example images receive a readable 320 pixel frame",()=>{const c=read("components.v45.7.3.css");assert.match(c,/height:320px!important/);assert.match(c,/object-fit:contain!important/);});
// Retired 2026-10-05: table-layout reverting to auto on mobile belonged to the retired stacked-rows
// fallback — the table now keeps table-layout:fixed (set unconditionally above) at every width, so
// the column-carousel paging stays the one consistent pattern instead of switching to a different
// layout model below 760px. See core/v45.7.5.9.4-scenario-guide-runtime.js's own @media(max-width:
// 760px) rules for the current (narrower, not auto) mobile column widths.
test("table-layout:fixed is never reset to auto on mobile — the carousel pattern holds at every width",()=>{const c=read("components.v45.7.3.css");assert.doesNotMatch(c,/table-layout:auto!important/);assert.match(c,/table-layout:fixed/);});
test("comparison renderer and captions remain intact",()=>{const s=read("components/visual-guidance-card.js");assert.match(s,/function comparison/);assert.match(s,/<figcaption>/);assert.match(s,/m\.boundary/);});
