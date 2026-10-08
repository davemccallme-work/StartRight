"use strict";
/* V45.8.0 P1 flow-simplification and navigation fixes (10.1.26 Prototype Feedback and Prioritization). */
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const R=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(R,f),"utf8");

test("P1.1: Energy Needs is filtered out of every active question sequence",()=>{
  const s=read("core/v45.7-intake-simplification.js");
  assert.match(s,/questionsForProject=function\(projectType\)\{return baseQuestions\(projectType\)\.filter\(function\(q\)\{return q&&q\.id!=='energy';\}\);\}/);
  const b=read("build.js");
  assert.ok(b.indexOf("core/v45.7-intake-simplification.js")>b.indexOf("data.js"),"the filter must load after the base question list it wraps");
});

test("P1.1: no live renderer reads answers.energy for current guidance (only the shadow-only diagnostic model does, safely)",()=>{
  const liveFiles=["state.js","screens/screen-questions.js","screens/screen-understanding.js","screens/screen-summary.js","components/v45.7-correctness-guidance.js","core/v45.7-correctness-engine.js"];
  for(const f of liveFiles)assert.doesNotMatch(read(f),/\.answers\.energy\b|\ba\.energy\b/,f);
});

test("P1.2: selecting ADU or Panel goes straight to the loading/fast-facts screen; the opening property question is never shown",()=>{
  const s=read("core/v45.7-intake-simplification.js");
  assert.match(s,/root\.ensureResidentialPropertyDefault\(\)/);
  assert.match(s,/root\.S\.step=1;root\.S\.questionIndex=0;root\.S\.fastFactsPhase="question"/);
  const ev=read("core/events.js");
  assert.match(ev,/"project-continue":function\(\)\{if\(S\.projectType==="adu"\|\|S\.projectType==="panel"\)\{S\.questionIndex=0;S\.fastFactsPhase="question";_pnRenderIntent="navigation";navigateToStep\(1\);\}\}/);
  const start=read("screens/screen-start.js");
  assert.match(start,/data-act="project-continue"/);
  assert.doesNotMatch(start.split('data-act="project-continue"')[1]||"",/<select|type="radio"[^>]*property/i);
});

test("P1.3: question-to-question navigation corrects viewport immediately, not only via the 720ms delayed scheduler",()=>{
  // Regression for a real bug found 2026-10-03: pnAnimateQuestionPane (the cross-fade used for
  // Next/Back between questions) never corrected scroll position. A customer scrolled down while
  // reading question N landed at the same scroll offset on question N+1 — "nav still drops to
  // bottom when advance pages" from the raw meeting chat. The step-level transition (pnAnimateSwap)
  // already scrolled to top immediately; only the question-pane path was missing this.
  const s=read("core/render.js");
  assert.match(s,/function pnSettleNavigationViewport\(\)\{if\(typeof V457NavigationScenarioGuide!==("|')undefined\1&&typeof V457NavigationScenarioGuide\.settleFocus===("|')function\2\)\{V457NavigationScenarioGuide\.settleFocus\(\);return;\}pnFocusH1\(\);\}/);
  const fn=s.slice(s.indexOf("function pnAnimateQuestionPane"),s.indexOf("function pnAnimateSwap"));
  assert.doesNotMatch(fn,/pnFocusH1\(\)/,"pnAnimateQuestionPane must settle the viewport, not just focus without scrolling");
  assert.match(fn,/pnSettleNavigationViewport\(\)/);
  // 2026-10-05: a third call site was added for the mobile nav+reading-pane group swap (see
  // tests/v45.8.9-question-pane-mobile-swipe.test.js) — the no-slot fallback and normal completion
  // path on desktop, plus the mobile group's own completion path, must each settle the viewport.
  assert.equal((fn.match(/pnSettleNavigationViewport\(\)/g)||[]).length,3,"the no-slot fallback, the desktop completion path, and the mobile group completion path must all settle the viewport");
});

test("P1.3: the step-level animated transition still scrolls to top immediately (already correct; must not regress)",()=>{
  const s=read("core/render.js");
  const fn=s.slice(s.indexOf("function pnAnimateSwap"),s.indexOf("function pnAnimateSwap")+300);
  assert.match(fn,/window\.scrollTo\(0,0\)/);
});

test("Fast Facts enhancement no longer builds content only to have it deleted",()=>{
  // Regression for a real, reproducible bug found 2026-10-03 via live browser testing (not just
  // static analysis): core/v45.7-navigation-scenario-guide.js's collapseInlineScenarioGuide() threw
  // a HierarchyRequestError on every single Fast Facts render ("the new child element contains the
  // parent"), which silently aborted the rest of enhance() — addLauncher, bindRailWheel,
  // bindMobileNav, addResetAction, and both carousel bindings never ran on that screen. Removed
  // outright rather than patched: core/v45.7.5.9.4-scenario-guide-runtime.js's suppressInlineGuide()
  // already fully supersedes it (CSS-forces display:none, hides the section, removes any stray
  // disclosure), so a structurally-correct version would still just build real governed content
  // (components/fast-insights.js's "scenario-guide" blocks) and immediately have it deleted.
  const s=read("core/v45.7-navigation-scenario-guide.js");
  assert.doesNotMatch(s,/function collapseInlineScenarioGuide/);
  const enhanceFn=s.slice(s.indexOf("function enhance()"),s.indexOf("function enhance()")+400);
  assert.doesNotMatch(enhanceFn,/collapseInlineScenarioGuide/);
  assert.match(enhanceFn,/addFastFactsLauncher\(\);addLauncher\(\)/);
  const runtime=read("core/v45.7.5.9.4-scenario-guide-runtime.js");
  assert.match(runtime,/function suppressInlineGuide/);
  assert.match(runtime,/section\.hidden=true;section\.setAttribute\('aria-hidden','true'\)/);
});

test("P1.4: the Scenario Guide launcher reads as a secondary, visually distinct entry point",()=>{
  const s=read("core/v45.7-navigation-scenario-guide.js");
  assert.match(s,/book-open/);
  assert.match(s,/<span>View scenario guide<\/span>/);
  const c=read("components.v45.7.3.css");
  assert.match(c,/\.scenario-guide-launcher\{[^}]*background:transparent!important/);
  assert.match(c,/\.scenario-guide-launcher:hover/);
});
