"use strict";
/* V45.8.0 P0.1 (10.1.26 Prototype Feedback and Prioritization): one canonical JADU metering rule,
   consumed everywhere — selection guidance, contextual insights, Scenario Guide, glossary,
   recommendations/next actions, and meter-related downstream branching. No reachable JADU state may
   display, recommend, or imply separate-meter eligibility. */
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const R=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(R,f),"utf8");

function runInContext(files){const ctx=vm.createContext({});for(const f of files)vm.runInContext(read(f),ctx,{filename:f});return ctx;}

test("the two canonical rule objects agree: JADU cannot be separately metered, ineligible",()=>{
  const ctx=runInContext(["core/v45.7-correctness-engine.js","core/jadu-conflict-control.js"]);
  const a=ctx.V457CorrectnessEngine.jadu({aduType:"Junior ADU"});
  assert.equal(a.separateMeterEligible,false);
  assert.equal(a.separateMeterEligibility,"ineligible");
  assert.match(a.meteringText,/cannot be separately metered/i);
  const b=ctx.JaduConflictControl.apply({aduType:"Junior ADU"});
  assert.equal(b.separateMeterEligible,false);
  assert.equal(b.eligibilityConclusion,"ineligible");
  assert.match(b.message,/cannot be separately metered/i);
});

test("no live source carries the old 'not required to have a separate meter' framing",()=>{
  const files=["data.js","data/answer-response-catalog.js","data/v45.7-glossary-additions.js","data/advisor-scenarios.js","core/v45.7-correctness-engine.js","core/jadu-conflict-control.js","core/recomputation-pipeline.js"];
  for(const f of files)assert.doesNotMatch(read(f),/is not required to have a separate meter/i,f);
});

test("glossary definition states the prohibition and cites real evidence",()=>{
  const ctx=runInContext(["data/v45.7-glossary-additions.js"]);
  const rows=ctx.V457_GLOSSARY_ADDITIONS.published();
  const jadu=rows.find(x=>x.id==="junior-accessory-dwelling-unit-v457");
  assert.ok(jadu);
  assert.match(jadu.definition,/cannot be separately metered/i);
  assert.match(jadu.sourceRef,/Rule 18|TD-9100P/i);
});

test("the rendered/merged glossary entry reflects the governed definition, not the older term-colliding one",()=>{
  // Regression for a real bug found 2026-10-03: core/v45.7-glossary-runtime.js used to skip
  // registering a V457 addition whenever an older entry already occupied the same term, so the
  // customer-visible glossary LIST kept showing the old JADU definition with no metering rule at
  // all, even though data/v45.7-glossary-additions.js had the correct text all along.
  const ctx=runInContext(["components/generated-glossary-data.js","components/generated-comprehension-data.js","components/glossary-component.js","data/v45.7-glossary-additions.js","core/v45.7-glossary-runtime.js"]);
  const entries=ctx.GlossaryController.entries;
  const jadu=entries.find(e=>/junior accessory dwelling unit/i.test(e.term));
  assert.ok(jadu,"JADU entry must exist in the rendered glossary list");
  assert.match(jadu.definition,/cannot be separately metered/i);
  assert.doesNotMatch(jadu.definition,/is not required to have a separate meter/i);
  // ADU benefits from the same fix: the legal/regulatory-classification definition (P2.1) must win too.
  const adu=entries.find(e=>e.term==="Accessory Dwelling Unit (ADU)");
  assert.match(adu.definition,/legal and regulatory classification/i);
});

test("the inline hover/tooltip glossary map also carries the governed definition",()=>{
  const ctx=runInContext(["components/generated-glossary-data.js","components/generated-comprehension-data.js","components/glossary-component.js","data/v45.7-glossary-additions.js","core/v45.7-glossary-runtime.js"]);
  assert.match(ctx.GLOSSARY["Junior Accessory Dwelling Unit (JADU)"],/cannot be separately metered/i);
});

test("per-question contextual guidance surfaces the JADU rule for the relevant ADU questions",()=>{
  const s=read("components/v45.7-correctness-guidance.js");
  assert.match(s,/V457CorrectnessEngine\.jadu/);
  assert.match(s,/\['aduType','aduAddressStatus','aduMeterServiceIntent'\]/);
});

test("the Understanding screen persists the JADU rule into its governed 'Our interpretation' section",()=>{
  // Regression for a real gap found 2026-10-03: the contextual note above only rendered while the
  // customer was actively answering an ADU question (screen-questions.js). It disappeared once they
  // moved on, so it never reached the persistent Understanding screen.
  const s=read("screens/screen-understanding.js");
  assert.match(s,/V457CorrectnessEngine\.jadu\(S\.answers\)/);
  assert.match(s,/jaduGuidance\.status===("|')confirmed-guidance\1/);
});

test("the preparation guide (Scenario Guide source) persists the JADU rule into its 'Our interpretation' card",()=>{
  // Regression for a real gap found 2026-10-03: core/v45.7-navigation-scenario-guide.js builds its
  // Scenario Guide by cloning sections from screens/screen-summary.js's .preparation-guide__story
  // (see components/guidance-workspace.js discover()). Without this, the JADU rule never reached
  // the Scenario Guide at all, contradicting the explicit requirement to apply it there.
  const s=read("screens/screen-summary.js");
  assert.match(s,/V457CorrectnessEngine\.jadu\(S\.answers\)/);
  assert.match(s,/jaduGuidance\.status===("|')confirmed-guidance\1/);
  const i=s.indexOf("function step4()"),j=s.indexOf("jaduGuidance");
  assert.ok(i>=0&&j>i,"the fix must live inside step4(), which builds .preparation-guide__story");
});

test("the chat advisor's meter/service scenario states the JADU rule unconditionally",()=>{
  const s=read("data/advisor-scenarios.js");
  const i=s.indexOf("id:'adu-meter-service'");
  assert.ok(i>=0);
  const scenario=s.slice(i,s.indexOf("}",s.indexOf("documents:",i)));
  assert.match(scenario,/jadu meter/i,"the alias list must still match JADU-specific chat questions");
  assert.match(scenario,/cannot be separately metered/i);
});

test("legacy recomputation pipeline no longer frames JADU metering as pending formal review",()=>{
  // Regression for a real gap found 2026-10-03: core/recomputation-pipeline.js's apply() writes
  // S.derived (unread by any current renderer, but a landmine for future consumers) with a
  // 'formal_review_required' provenance and a 'Contact PG&E to confirm what metering or service
  // arrangement applies' recommendation for classification==='jadu' — directly contradicting the
  // governed ineligibility conclusion. Both must now agree with the canonical rule.
  const s=read("core/recomputation-pipeline.js");
  assert.doesNotMatch(s,/classification===('|")jadu\1\)out\.jaduMetering=('|")formal_review_required\2/);
  const i=s.indexOf("function recommendation(classification"),j=s.indexOf("classification==='jadu'",i);
  assert.ok(i>=0&&j>i&&j<i+200);
  const clause=s.slice(j,s.indexOf(";",j));
  assert.match(clause,/cannot be separately metered/i);
  assert.doesNotMatch(clause,/formal_review_required/);
});

test("ADU detached incompatibility rule (P0.2) remains governed-rule driven, not page-only copy",()=>{
  const ctx=runInContext(["core/v45.7-correctness-engine.js"]);
  const E=ctx.V457CorrectnessEngine;
  const existingMeterConflict=E.aduCompatibility({aduType:"Detached ADU",aduAddressStatus:"Yes, a separate address is assigned",aduMeterServiceIntent:"Use the existing meter and service"});
  assert.equal(existingMeterConflict.status,"incompatible");
  assert.equal(existingMeterConflict.automaticApproval,false);
  assert.equal(existingMeterConflict.automaticDenial,false);
  const s=read("state.js");
  assert.match(s,/V457CorrectnessEngine\.aduCompatibility/);
  assert.match(s,/aduCheck\.status===("|')incompatible\1/);
});

test("permit guidance separates applicant from issuing authority and gates solar on actual solar presence (P0.3)",()=>{
  const ctx=runInContext(["core/v45.7-correctness-engine.js"]);
  const noSolar=ctx.V457CorrectnessEngine.permit({projectType:"panel",panelLoads:[]});
  assert.equal(noSolar.solarSpecificReasoningAllowed,false);
  assert.match(noSolar.applicant,/homeowner, contractor, electrician/i);
  assert.match(noSolar.issuingAuthority,/city or county authority having jurisdiction/i);
  const withSolar=ctx.V457CorrectnessEngine.permit({projectType:"panel",panelLoads:["Solar or battery"]});
  assert.equal(withSolar.solarSpecificReasoningAllowed,true);
});
