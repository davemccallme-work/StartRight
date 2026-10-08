"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const R=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(R,f),"utf8");
// Retired 2026-10-03: the RELEASE_VERSION='V45.7.4.5' pin is superseded now the build is on V45.7.5.9.9.
test("Final Guidance rail binds one capture-phase non-passive wheel handler",()=>{const s=read("core/v45.7-navigation-scenario-guide.js");assert.match(s,/function bindRailWheel/);assert.match(s,/passive:false,capture:true/);assert.match(s,/wheelBound\.indexOf\(nav\)/);});
test("wheel delta modes are normalized",()=>{const s=read("core/v45.7-navigation-scenario-guide.js");assert.match(s,/deltaMode===1/);assert.match(s,/deltaMode===2/);assert.match(s,/nav\.clientHeight/);});
test("rail consumes wheel only when the rail can move",()=>{const s=read("core/v45.7-navigation-scenario-guide.js");assert.match(s,/max=nav\.scrollHeight-nav\.clientHeight/);assert.match(s,/if\(moved\)\{e\.preventDefault\(\);nav\.scrollTop=next/);});
test("enhancement rebinds after rendered navigation is available",()=>{const s=read("core/v45.7-navigation-scenario-guide.js");assert.match(s,/addLauncher\(\);bindRailWheel\(\)/);});
test("CSS makes the full rail and descendants valid pointer targets",()=>{const c=read("components.v45.7.3.css");assert.match(c,/full-rail wheel target/);assert.match(c,/pointer-events:auto!important/);assert.match(c,/touch-action:pan-y!important/);});
test("navigation rows allocate remaining width to text",()=>{const c=read("components.v45.7.3.css");assert.match(c,/grid-template-columns:minmax\(0,1fr\) auto/);assert.match(c,/summary-section-nav__button>span/);});
