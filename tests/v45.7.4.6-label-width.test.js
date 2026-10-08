"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const R=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(R,f),"utf8");
// Retired 2026-10-03: the RELEASE_VERSION='V45.7.4.6' pin is superseded now the build is on V45.7.5.9.9.
test("desktop Guidance button removes obsolete two-column number grid",()=>{const c=read("components.v45.7.3.css");assert.match(c,/V45\.7\.4\.6 remove reserved number column/);assert.match(c,/summary-section-nav__button\{[\s\S]*?display:block!important/);assert.match(c,/grid-template-columns:none!important/);});
test("hidden number marker cannot reserve label width",()=>{const c=read("components.v45.7.3.css");assert.match(c,/summary-section-nav__number\{[\s\S]*?display:none!important/);});
test("visible label span receives one hundred percent width",()=>{const c=read("components.v45.7.3.css");assert.match(c,/span:not\(\.summary-section-nav__number\)/);assert.match(c,/width:100%!important/);assert.match(c,/max-width:none!important/);});
test("labels wrap at words without hyphenation",()=>{const c=read("components.v45.7.3.css");assert.match(c,/word-break:normal!important/);assert.match(c,/overflow-wrap:normal!important/);assert.match(c,/hyphens:none!important/);});
test("row reserves only forty pixels for expand control",()=>{const c=read("components.v45.7.3.css");assert.match(c,/grid-template-columns:minmax\(0,1fr\) 40px!important/);});
test("full-rail wheel handler remains installed",()=>{const s=read("core/v45.7-navigation-scenario-guide.js");assert.match(s,/function bindRailWheel/);assert.match(s,/passive:false,capture:true/);});
