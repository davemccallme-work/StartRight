"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const R=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(R,f),"utf8");
// Retired 2026-10-03: the RELEASE_VERSION='V45.7.4.1' pin is superseded now the build is on V45.7.5.9.9.
// 2026-10-03 (P0.1, 10.1.26 feedback): "not required to have a separate meter" implied a JADU could
// still get one, which reviewers flagged as incorrect. Corrected to the canonical "cannot be
// separately metered" prohibition everywhere this copy appears.
test("JADU fallback copy uses one governed cannot-be-separately-metered treatment",()=>{const all=read("data.js")+read("data/answer-response-catalog.js")+read("core/v45.7-correctness-engine.js")+read("data/v45.7-glossary-additions.js");assert.doesNotMatch(all,/can have its own meter depends|JADU can only get a second meter|does not determine JADU metering eligibility|is not required to have a separate meter/i);assert.match(all,/JADU cannot be separately metered and is not required to have a separate address/i);});
// Retired 2026-10-03: the sourceWorkspace/namespaceIds clone-based guide assembly (this test and the
// next) was fully rewritten around GuidanceWorkspace.getGuideSnapshot()/buildShell() — see
// tests/v45.7.4.3-final-guidance-modal.test.js "modal is built exclusively from GuidanceWorkspace snapshot".
test("prepare receives governed educational SLD fallback",()=>{const s=read("core/v45.7-navigation-scenario-guide.js");assert.match(s,/SLD-008/);assert.match(s,/SLD-001/);assert.match(s,/not a design for your project/i);});
// Retired 2026-10-03: the focus delay was later tuned from 680ms to 720ms (see other 4.x tests'
// `/720/` assertions); scheduleNavigationFocus was also renamed/inlined in the rewrite above.
test("complete guide CSS provides two-pane desktop and single-pane mobile",()=>{const s=read("components.v45.7.3.css");assert.match(s,/grid-template-columns:minmax\(230px,300px\)/);assert.match(s,/scenario-guide-workspace>\.ff-nav/);assert.match(s,/@media\(max-width:900px\)/);});
test("dialog remains optional and state neutral",()=>{const s=read("core/v45.7-navigation-scenario-guide.js"),open=s.slice(s.indexOf("function open("),s.indexOf("function enhanceScenarioGuide"));assert.match(s,/View scenario guide/);assert.doesNotMatch(open,/persistDraft|scheduleDraftSave|localStorage|answerChanged|S\.answers/);});
