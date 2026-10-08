'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const scenarioGuideSource=fs.readFileSync(path.join(__dirname,'../core/v45.7-navigation-scenario-guide.js'),'utf8');
const summarySource=fs.readFileSync(path.join(__dirname,'../screens/screen-summary.js'),'utf8');

// 2026-10-05: "Clear my answers" moved out of the Scenario Guide dialog (a misplaced duplicate entry
// point, never the governed home for this control) back onto screens/screen-summary.js's "Your
// Project Summary" page, at the very end of the preparation guide content.

test('Clear my answers is rendered exactly once, at the end of the preparation guide',()=>{
  assert.equal((summarySource.match(/data-act="open-workspace-reset"/g)||[]).length,1,'one rendered trigger on the summary page');
  assert.match(summarySource,/summary-reset-action/);
  assert.match(summarySource,/Clear my answers/);
});

test('the scenario guide no longer renders its own Clear my answers control',()=>{
  assert.doesNotMatch(scenarioGuideSource,/Clear my answers/);
  assert.doesNotMatch(scenarioGuideSource,/data-scenario-guide-clear-answers/);
});

test('Clear my answers opens the governed confirmation flow directly, via the existing delegated action',()=>{
  // screens/screen-summary.js isn't inside a competing <dialog> the way the scenario guide was, so it
  // can use the shared data-act table directly instead of the guide's close-then-dispatch indirection.
  const eventsSource=fs.readFileSync(path.join(__dirname,'../core/events.js'),'utf8');
  assert.match(eventsSource,/"open-workspace-reset":function/,'the shared action the new button triggers must still be registered');
});

test('legacy preparation-guide reset controls are removed',()=>{
  // 2026-10-03: the delimiter was collapseInlineScenarioGuide(), removed as dead/superseded code
  // (see tests/v45.8.0-p1-build-fixes.test.js); addResetAction() is now directly followed by enhance().
  const block=scenarioGuideSource.match(/function addResetAction\(\)\{[\s\S]*?\}\n\n(?:\/\*[\s\S]*?\*\/\n)?function enhance/);
  assert.ok(block);
  assert.doesNotMatch(block[0],/summary-boundary-note|summary-document-footer|appendChild\(b\)/);
  assert.match(block[0],/button\.remove\(\)/);
});
