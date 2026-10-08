"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const R=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(R,f),"utf8");
// Retired 2026-10-03: the RELEASE_VERSION='V45.7.4.2' pin is superseded now the build is on V45.7.5.9.9.
test("GuidanceWorkspace exports a clone-only guide snapshot",()=>{const s=read("components/guidance-workspace.js");assert.match(s,/getGuideSnapshot/);assert.match(s,/cloneNode\(true\)/);});
// Retired 2026-10-03: the guidanceModel()||fastFactsModel() snapshot source was superseded by
// snapshot()/GuidanceWorkspace.getGuideSnapshot() in V45.7.4.3; see that release's test for the live contract.
test("dialog uses a purpose-built navigation and reading shell",()=>{const s=read("core/v45.7-navigation-scenario-guide.js");assert.match(s,/scenario-guide-shell__nav/);assert.match(s,/scenario-guide-shell__reading/);});
test("guide launch is inserted for final guidance and Fast Facts",()=>{const s=read("core/v45.7-navigation-scenario-guide.js");assert.match(s,/pinned-recommendation/);assert.match(s,/ff-recommended/);assert.match(s,/View scenario guide/);});
test("main Guidance rail is hidden after overlay enhancement",()=>{const s=read("core/v45.7-navigation-scenario-guide.js"),c=read("components.v45.7.3.css");assert.match(s,/guidance-workspace-frame--primary-only/);assert.match(c,/guidance-workspace-frame--primary-only>\.summary-section-nav\{display:none/);});
test("desktop guide has readable two-column sizing",()=>{const c=read("components.v45.7.3.css");assert.match(c,/grid-template-columns:minmax\(250px,300px\) minmax\(0,1fr\)/);assert.match(c,/word-break:normal/);assert.match(c,/hyphens:none/);});
test("whole guide rail is the scroll region",()=>{const c=read("components.v45.7.3.css");assert.match(c,/scenario-guide-shell__nav\{[^}]*overflow-y:auto/);});
test("mobile guide becomes one column",()=>{const c=read("components.v45.7.3.css");assert.match(c,/@media\(max-width:900px\)/);assert.match(c,/scenario-guide-shell\{grid-template-columns:1fr/);});
test("question transition keeps delayed heading focus",()=>{const s=read("core/v45.7-navigation-scenario-guide.js");assert.match(s,/720/);assert.match(s,/question-card-slot h1/);assert.match(s,/focus\(\{preventScroll:true\}\)/);});
test("opening guide is state neutral",()=>{const s=read("core/v45.7-navigation-scenario-guide.js"),x=s.slice(s.indexOf("function open("),s.indexOf("function addButton"));assert.doesNotMatch(x,/persistDraft|scheduleDraftSave|localStorage|answerChanged|S\.answers/);});
