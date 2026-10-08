"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const R=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(R,f),"utf8");
// Retired 2026-10-03: the RELEASE_VERSION='V45.7.5.1' pin is superseded now the build is on V45.7.5.9.9.
test("instructional mobile guidance controls are not rendered",()=>{const s=read("core/v45.7-navigation-scenario-guide.js");assert.doesNotMatch(s,/Swipe or use the controls/);assert.doesNotMatch(s,/Show previous guide sections/);assert.doesNotMatch(s,/Show next guide sections/);});
test("mobile track accepts independent horizontal and vertical wheel input",()=>{const s=read("core/v45.7-navigation-scenario-guide.js");assert.match(s,/horizontal=Math\.abs\(e\.deltaX\)>Math\.abs\(e\.deltaY\)/);assert.match(s,/track\.scrollLeft=nextX/);assert.match(s,/track\.scrollTop=nextY/);});
test("mobile viewport exposes both overflow axes",()=>{const c=read("components.v45.7.3.css");assert.match(c,/overflow-x:auto!important/);assert.match(c,/overflow-y:auto!important/);assert.match(c,/scroll-snap-type:both proximity/);});
test("mobile navigation uses two readable rows",()=>{const c=read("components.v45.7.3.css");assert.match(c,/grid-template-rows:repeat\(2,minmax\(58px,auto\)\)/);assert.match(c,/grid-auto-columns:minmax\(210px,72vw\)/);});
test("labels use full available width and normal wrapping",()=>{const c=read("components.v45.7.3.css");assert.match(c,/text-wrap:balance!important/);assert.match(c,/word-break:normal!important/);assert.match(c,/overflow-wrap:normal!important/);assert.match(c,/hyphens:none!important/);});
test("focused destinations are brought into the two-axis viewport",()=>{const s=read("core/v45.7-navigation-scenario-guide.js");assert.match(s,/scrollIntoView\(\{block:'nearest',inline:'nearest'/);});
// Retired 2026-10-05: "Clear my answers" moved out of the scenario guide onto screens/screen-summary.js
// (the end of the preparation guide) — see tests/v45.7.5.9.8-final-reset-placement.test.js.
test("scenario guide no longer renders its own Clear my answers button",()=>{const s=read("core/v45.7-navigation-scenario-guide.js");assert.doesNotMatch(s,/Clear my answers/);assert.doesNotMatch(s,/data-scenario-guide-clear-answers/);});
