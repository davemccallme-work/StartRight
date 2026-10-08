"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const R=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(R,f),"utf8");
// Retired 2026-10-03: the RELEASE_VERSION='V45.7.5.3' pin is superseded now the build is on V45.7.5.9.9.
test("multi-item visual guidance renders one comparison table",()=>{const s=read("components/visual-guidance-card.js");assert.match(s,/function comparison/);assert.match(s,/<table class=\"visual-guidance-comparison\"/);assert.match(s,/a\.length>1\?comparison/);});
test("shared repeated labels are table row headings",()=>{const s=read("components/visual-guidance-card.js");assert.match(s,/What to photograph/);assert.match(s,/Make sure the photo shows/);assert.match(s,/May not provide enough context/);assert.match(s,/Why this may help/);});
test("photo titles are column headings and mobile labels",()=>{const s=read("components/visual-guidance-card.js");assert.match(s,/<th scope=\"col\">/);assert.match(s,/data-label=/);});
test("governed visuals, captions, and boundaries are preserved",()=>{const s=read("components/visual-guidance-card.js");assert.match(s,/m\.visuals\.map/);assert.match(s,/<figcaption>/);assert.match(s,/m\.boundary/);});
test("desktop table scrolls if necessary",()=>{const c=read("components.v45.7.3.css");assert.match(c,/visual-guidance-comparison-wrap\{[^}]*overflow:auto/);assert.match(c,/min-width:1760px!important/);});
// Retired 2026-10-05: the stacked-rows-with-data-label::before-prefix mobile fallback was a THIRD,
// unrelated pattern alongside the sticky-header desktop panel and the column-carousel — replaced
// everywhere (not just inside the Scenario Guide, where this was already true) by the single
// column-carousel pattern at every width, so there's no more "mobile transforms rows" step — the
// table stays a real <table> and keeps table-layout:fixed below 760px, just with narrower columns.
// See tests/v45.7.5.9.4-* and core/v45.7.5.9.4-scenario-guide-runtime.js for the current contract.
test("mobile keeps real table display and table-layout:fixed, not the retired stacked-rows pattern",()=>{const c=read("components.v45.7.3.css");assert.doesNotMatch(c,/visual-guidance-comparison td::before/);const s=read("core/v45.7.5.9.4-scenario-guide-runtime.js");assert.match(s,/max-width:760px.*visual-guidance-comparison\{min-width:0!important;width:max-content!important\}/);});
test("single-item visual guidance retains the existing card renderer",()=>{const s=read("components/visual-guidance-card.js");assert.match(s,/card\(a\[0\],o\)/);});
test("prior comparison and navigation features remain",()=>{const f=read("components/fast-insights.js"),n=read("core/v45.7-navigation-scenario-guide.js");assert.match(f,/function comparisonTable/);assert.match(n,/function bindRailWheel/);});
