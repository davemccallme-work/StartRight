"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const R=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(R,f),"utf8");
// Retired 2026-10-03: the RELEASE_VERSION='V45.7.4.3' pin is superseded now the build is on V45.7.5.9.9.
// Retired 2026-10-03: "scoped only to Final Guidance" (removeFastFactsLauncher, no fastFactsModel) was
// reversed later — the current design intentionally keeps both launchers (addLauncher AND
// addFastFactsLauncher are both called from enhance()); see
// tests/v45.7.4.2-layout-hotfix.test.js "guide launch is inserted for final guidance and Fast Facts".
test("modal is built exclusively from GuidanceWorkspace snapshot",()=>{const s=read("core/v45.7-navigation-scenario-guide.js");assert.match(s,/GuidanceWorkspace\.getGuideSnapshot/);assert.match(s,/function snapshot/);assert.match(s,/function buildShell/);});
test("dialog has explicit modal chrome and backdrop contract",()=>{const s=read("core/v45.7-navigation-scenario-guide.js"),c=read("components.v45.7.3.css");assert.match(s,/showModal/);assert.match(s,/scenarioGuideTitle/);assert.match(s,/Close guide/);assert.match(c,/scenario-guide-dialog--final::backdrop/);});
test("dialog uses persistent 280 pixel rail and independent reading scroll",()=>{const c=read("components.v45.7.3.css");assert.match(c,/grid-template-columns:280px minmax\(0,1fr\)/);assert.match(c,/scenario-guide-shell--final>\.scenario-guide-shell__nav\{[^}]*overflow-y:auto/);assert.match(c,/scenario-guide-shell--final>\.scenario-guide-shell__reading\{[^}]*overflow-y:auto/);});
test("modal locks and hides the background while open",()=>{const s=read("core/v45.7-navigation-scenario-guide.js");assert.match(s,/inertBackground\(true\)/);assert.match(s,/aria-hidden/);assert.match(s,/body\.classList\.add\('scenario-guide-open'\)/);});
test("Escape, close, focus trap, and focus restoration are retained",()=>{const s=read("core/v45.7-navigation-scenario-guide.js");assert.match(s,/e\.key==='Escape'/);assert.match(s,/e\.key!=='Tab'/);assert.match(s,/launcher\.focus\(\)/);assert.match(s,/addEventListener\('cancel'/);});
test("guide navigation moves only the reading pane",()=>{const s=read("core/v45.7-navigation-scenario-guide.js");assert.match(s,/scenario-guide-shell__reading/);assert.match(s,/reading\.scrollTo/);assert.match(s,/aria-current/);});
test("Final Guidance main rail is hidden after enhancement",()=>{const s=read("core/v45.7-navigation-scenario-guide.js"),c=read("components.v45.7.3.css");assert.match(s,/guidance-workspace-frame--primary-only/);assert.match(c,/guidance-workspace-frame--primary-only>\.summary-section-nav\{display:none/);});
test("question-transition focus remains delayed until animation completion",()=>{const s=read("core/v45.7-navigation-scenario-guide.js");assert.match(s,/720/);assert.match(s,/question-card-slot h1/);assert.match(s,/focus\(\{preventScroll:true\}\)/);});
test("opening the guide remains state neutral",()=>{const s=read("core/v45.7-navigation-scenario-guide.js"),x=s.slice(s.indexOf("function open("),s.indexOf("function addLauncher"));assert.doesNotMatch(x,/persistDraft|scheduleDraftSave|localStorage|answerChanged|S\.answers/);});
