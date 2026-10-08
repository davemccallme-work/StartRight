"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const R=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(R,f),"utf8");
// 2026-10-06: a copy-density pass trimmed several screens where the same "not an application /
// not yet reviewed / not a quote" idea was restated multiple times in close succession (confirmed
// via a read-only survey before any edits, cross-checked against the test suite so no governed/
// test-asserted string was touched). These guardrails lock in the post-trim state as the new
// baseline, so future edits don't silently reintroduce the duplication this pass removed.

test("screen-summary.js's end-of-guide boundary notice is merged to one, not the old two-div stack",()=>{
  const s=read("screens/screen-summary.js");
  assert.equal((s.match(/class="summary-boundary-note"/g)||[]).length,1,"expected exactly one .summary-boundary-note after the merge");
  assert.doesNotMatch(s,/Planning-note boundary:/,"the separate 'Planning-note boundary:' sub-header was folded into the single merged note");
  assert.doesNotMatch(s,/Nothing has been submitted to PG&E — no application, request, or project update was created\./,"the end-of-guide card's fourth restatement of 'nothing submitted' was removed as redundant with the earlier Before-you-apply and merged boundary notes");
  // the two test-asserted heading ids must still exist — only the body text under them was trimmed
  assert.match(s,/id="s-beforeyouapply-h"/);
  assert.match(s,/id="preparation-end-h"/);
});

test("screen-summary.js's cost positioning paragraph no longer restates COST_DISCLAIMER's own 'not a quote/estimate/commitment' framing",()=>{
  const s=read("screens/screen-summary.js");
  assert.doesNotMatch(s,/not a project-specific estimate, readiness signal, or commitment/);
  assert.match(s,/relative, not to scale/,"the one non-duplicate fact (relative/not-to-scale) must survive");
});

test("screen-cost-tiers.js's own intro no longer restates the 'not a quote/estimate/commitment' idea that COST_DISCLAIMER/COST_BENCHMARK_DISCLAIMER already assert two sentences later",()=>{
  const s=read("screens/screen-cost-tiers.js");
  assert.doesNotMatch(s,/Nothing here is a quote, estimate, or commitment for your project/);
  assert.match(s,/so we separate <strong>PG&E-specific evidence<\/strong>/,"the structural framing sentence must survive");
  // the two mandatory, data-sourced disclaimers must still be interpolated verbatim, untouched
  assert.match(s,/t1\.disclaimer/);
  assert.match(s,/t2\.disclaimer/);
});

test("screen-decisions.js's decisionWorkspaceCard() no longer renders the static, topic-invariant 'What remains unknown?' boilerplate",()=>{
  const s=read("screens/screen-decisions.js");
  assert.doesNotMatch(s,/What remains unknown\?/);
  assert.match(s,/Who can help\?/,"the distinct, non-boilerplate field must survive");
});

test("data/insight-catalog.js's shared boundary sentence is tightened, not left as three near-synonymous hedges",()=>{
  const s=read("data/insight-catalog.js");
  assert.doesNotMatch(s,/this may be worth preparing for/);
  assert.match(s,/not yet reviewed/,"the 'not reviewed' fact must survive");
  assert.match(s,/still needs confirmation/,"the 'needs confirmation' fact must survive");
});

test("screen-understanding.js's meterServiceExplainer caveat is tightened, not the old three-sentence version",()=>{
  const s=read("screens/screen-understanding.js");
  assert.doesNotMatch(s,/It does not determine whether another meter, another service connection, or both applies\./);
  assert.match(s,/this shows the relationship only/);
  assert.match(s,/confirm the actual arrangement with PG&amp;E/);
});

test("the four entry/arrival screens' boundary notices are tightened in place, not consolidated into a new shared constant",()=>{
  // Each screen keeps its own independently-authored sentence (per governance findings, these are
  // "governed in spirit" but not literally duplicated/test-asserted) — this just locks in the
  // tightened wording so it isn't silently re-expanded back to the verbose originals.
  assert.doesNotMatch(read("screens/screen-entry-website.js"),/does not submit an application, approve a project, or make an engineering determination/);
  assert.doesNotMatch(read("screens/screen-entry-email.js"),/This is a simulated email created for prototype research\. Project Navigator does not submit/);
  assert.doesNotMatch(read("screens/screen-arrival-selector.js"),/project-specific cost quote/);
});
