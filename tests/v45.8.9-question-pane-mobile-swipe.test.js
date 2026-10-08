"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const R=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(R,f),"utf8");
// 2026-10-05: on mobile, .question-nav sits ABOVE .question-reading-pane as one stacked column
// (confirmed via components.v4439-overrides.css's own max-width:760/820px breakpoints), but
// pnAnimateQuestionPane only ever animated .question-card-slot, snapping .question-nav in place
// instantly via replaceWith — on mobile this read as a disjointed, "S"/"J"-shaped motion (the nav
// popping while the card kept sliding for another 520ms). User clarified the target is "the swipe
// animation typical on mobile" — i.e. the whole screen (nav + reading pane) should slide together
// as one unit, the same way a native app's push/pop transition moves its own header with its
// content. Fixed by widening what pnAnimateQuestionPane wraps on mobile only; desktop (where
// .question-nav is a persistent sidebar, not a stacked top bar) keeps the original card-only
// animation untouched.
function pnAnimateQuestionPaneSrc(){
  const s=read("core/render.js");
  const start=s.indexOf("function pnAnimateQuestionPane");
  const end=s.indexOf("function pnAnimateSwap");
  return s.slice(start,end);
}
test("pnAnimateQuestionPane branches on the same max-width:760px breakpoint components.v4439-overrides.css uses to stack question-nav above question-reading-pane",()=>{
  const fn=pnAnimateQuestionPaneSrc();
  assert.match(fn,/window\.matchMedia\("\(max-width:760px\)"\)\.matches/);
  const css=read("components.v4439-overrides.css");
  assert.match(css,/@media\(max-width:760px\)\{\.question-workspace\{grid-template-columns:1fr\}/);
});
test("on mobile, question-nav and question-reading-pane are grouped and wiped together, reusing the existing question-pane-wipe-host/question-pane-wipe classes",()=>{
  const fn=pnAnimateQuestionPaneSrc();
  assert.match(fn,/curNav=app\.querySelector\("\.question-nav"\),nxtNav=temp\.querySelector\("\.question-nav"\),curPane=app\.querySelector\("\.question-reading-pane"\),nxtPane=temp\.querySelector\("\.question-reading-pane"\)/);
  assert.match(fn,/curGroup\.appendChild\(curNav\);curGroup\.appendChild\(curPane\)/);
  assert.match(fn,/nxtGroup\.appendChild\(nxtNav\);nxtGroup\.appendChild\(nxtPane\)/);
  assert.match(fn,/curGroup\.classList\.add\("question-pane-wipe","question-pane-wipe-out-"\+dir\)/);
  assert.match(fn,/nxtGroup\.classList\.add\("question-pane-wipe","question-pane-wipe-in-"\+dir\)/);
  assert.match(fn,/wrap\.className="question-pane-wipe-host"/);
});
test("the mobile group swap restores question-nav and question-reading-pane as direct children of the same host, settling the viewport, before falling through to the desktop card-only path",()=>{
  const fn=pnAnimateQuestionPaneSrc();
  assert.match(fn,/host\.insertBefore\(nxtNav,wrap\);host\.insertBefore\(nxtPane,wrap\);wrap\.remove\(\)/);
  assert.match(fn,/pnSettleNavigationViewport\(\);pnAfterRender\(\);\s*\},560\);\s*return;\s*\}\s*\}/);
});
test("desktop keeps the original card-only animation untouched: question-nav still swaps instantly via replaceWith, only question-card-slot animates",()=>{
  const fn=pnAnimateQuestionPaneSrc();
  assert.match(fn,/if\(currentNav&&nextNav\)currentNav\.replaceWith\(nextNav\)/);
  assert.match(fn,/if\(currentSummary&&nextSummary\)currentSummary\.innerHTML=nextSummary\.innerHTML/);
  assert.match(fn,/currentSlot\.classList\.add\("question-pane-wipe","question-pane-wipe-out-"\+dir\)/);
  assert.match(fn,/nextSlot\.classList\.add\("question-pane-wipe","question-pane-wipe-in-"\+dir\)/);
});
// 2026-10-05: separately, "when selecting an option, keep the screen still, right now it jumps back
// up to the top" — every native-radio/checkbox answer path (choice/example via the "change"
// listener, multi-choice, compare-choice) already anchors on stableRender(), but the button-based
// example chips (data-act="example", the description question's suggestion chips) called a bare
// render() instead, the one answer-setting action in the whole table not routed through it.
test("the example chip action routes through stableRender like every other answer-selection action, instead of a bare render() that can let scroll position drift",()=>{
  const s=read("core/events.js");
  assert.match(s,/example:function\(b\)\{var q=activeQuestions\(\)\[S\.questionIndex\];var ex=b\.getAttribute\("data-ex"\);setAnswer\(q\.id,ex\);stableRender\("\[data-question-card\]",'\[data-act="example"\]\[data-ex="'\+CSS\.escape\(ex\)\+'"\]'\);scheduleDraftSave\(\);\}/);
});
// 2026-10-05 (follow-up, "the white bar returned starting on project details"): questionNavigator()
// in screen-shared.js gives .question-nav id="questionNavigator". Grouping the outgoing AND
// incoming nav copies together for the mobile slide (above) means, for the full 560ms transition,
// BOTH copies are live in the DOM with that same id at once. core/v45.8.3-question-nav-scroll.js
// wraps render() to unconditionally scroll #questionNavigator's current-step chip into view on a
// setTimeout(...,0) after every render — with two matches, querySelector returned the OUTGOING
// copy (first in document order, about to be removed) and smooth-scrolled its chip mid
// slide-animation under this host's overflow:hidden, which is what visibly glitched as a blank
// white strip. Fixed by stripping the id off the outgoing copy the moment it's identified, so only
// the surviving (incoming) copy ever answers to #questionNavigator during the transition.
test("the outgoing nav copy loses its id before the mobile group swap starts, so only one #questionNavigator exists while both copies are briefly in the DOM together",()=>{
  const fn=pnAnimateQuestionPaneSrc();
  const idIdx=fn.indexOf("curNav.removeAttribute(\"id\")");
  const wrapIdx=fn.indexOf("wrap.appendChild(curGroup)");
  assert.ok(idIdx>=0,"curNav must have its id removed");
  assert.ok(idIdx<wrapIdx,"the id must be removed before both groups are appended into the shared host");
  const nav=read("screens/screen-shared.js");
  assert.match(nav,/id="questionNavigator"/);
});
