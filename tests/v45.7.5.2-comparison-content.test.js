"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const R=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(R,f),"utf8");
// Retired 2026-10-03: the RELEASE_VERSION='V45.7.5.2' pin is superseded now the build is on V45.7.5.9.9.
test("ADU USE MODIFY ADD uses one comparison table",()=>{const s=read("components/fast-insights.js");assert.match(s,/function comparisonTable/);assert.match(s,/<table class=\\?"path-comparison/);assert.match(s,/<th scope=\\?"col\\?">USE/);assert.match(s,/<th scope=\\?"row/);});
test("legacy ADU path cards are removed from the scenario guide",()=>{const s=read("components/fast-insights.js");assert.doesNotMatch(s,/01 \/ USE','Use the existing electrical setup/);assert.match(s,/comparisonTable\(\)/);});
test("mobile comparison becomes labeled row groups",()=>{const c=read("components.v45.7.3.css");assert.match(c,/path-comparison td::before/);assert.match(c,/content:attr\(data-label\)/);assert.match(c,/grid-template-columns:74px minmax\(0,1fr\)/);});
test("Near and Away explanations avoid formal distance and location approval",()=>{const s=read("data/answer-response-catalog.js");assert.match(s,/same immediate equipment area/);assert.match(s,/different location from the existing meter or panel area/);assert.match(s,/does not confirm that the location is acceptable/);assert.doesNotMatch(s,/\b\d+\s*(feet|foot|ft\.?|inches|inch|in\.)\b/i);});
test("advisor customer message and footer contrast are increased",()=>{const c=read("components.v45.7.3.css");assert.match(c,/pn-body,.pn-compose/);assert.match(c,/pn-msg\.user \.pn-bubble/);assert.match(c,/color:#fff!important/);assert.match(c,/ink-muted/);});
test("desktop and mobile navigation fixes remain",()=>{const s=read("core/v45.7-navigation-scenario-guide.js"),c=read("components.v45.7.3.css");assert.match(s,/function bindRailWheel/);assert.match(c,/remove reserved number column/);});
