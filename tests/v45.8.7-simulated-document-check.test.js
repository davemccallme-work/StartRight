"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const R=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(R,f),"utf8");
// 2026-10-05: "Try a simulated document check" — a scripted, front-end-only exercise reusing two
// reference documents (StartRight_simulated_document_check_updated.html + the PDF build brief) as
// guidance, not ported verbatim, since both predate this session's accordion/translucency/icon work.
// Fixtures must reference ONLY ids that actually exist in data/document-guidance-catalog.js and
// resolve via LearningCardRegistry — confirmed by cross-checking against the real catalog content
// below rather than duplicating the ids as literal strings.
test("simulated document fixtures reference only document ids that actually exist in the real catalog",()=>{
  const catalogSrc=read("data/document-guidance-catalog.js");
  const fixturesSrc=read("data/simulated-document-fixtures.js");
  const fixtureIds=[...fixturesSrc.matchAll(/documentId:'([A-Z0-9-]+)'/g)].map(m=>m[1]);
  assert.ok(fixtureIds.length>=2,"expected at least two fixtures");
  fixtureIds.forEach(id=>{
    assert.match(catalogSrc,new RegExp("d\\('"+id+"',"),`fixture documentId ${id} must exist in the real catalog`);
  });
});
test("simulated document fixtures reference only asset ids already present in the visual example catalog",()=>{
  const assetSrc=read("data/visual-example-catalog.js");
  const fixturesSrc=read("data/simulated-document-fixtures.js");
  const assetIds=[...fixturesSrc.matchAll(/assetId:'([A-Z0-9-]+)'/g)].map(m=>m[1]);
  assert.ok(assetIds.length>=2,"expected at least two fixture assets");
  assetIds.forEach(id=>{
    assert.match(assetSrc,new RegExp('"id":"'+id+'"'),`fixture assetId ${id} must exist in the visual example catalog`);
  });
});
test("fixtures show both scripted outcomes — one passed, one needing another file",()=>{
  const s=read("data/simulated-document-fixtures.js");
  assert.match(s,/outcome:'passed'/);
  assert.match(s,/outcome:'needsFile'/);
});
// 2026-10-05: this is explicitly NOT a real upload — the component's own session-only state must
// never be written to S/S.answers or anything export/draft-adjacent (exports/application-draft.js
// etc.), the same hard boundary this app already keeps between illustrative content and real
// guidance. A grep-based guardrail, consistent with build.js's own existing prohibited-language
// inventory checks.
test("the component never writes its state onto S or S.answers — stays entirely session-local",()=>{
  const s=read("components/simulated-document-check.js");
  assert.doesNotMatch(s,/S\.answers\[/);
  assert.doesNotMatch(s,/S\.answers\./);
  assert.doesNotMatch(s,/\bS\.simdoc/);
  assert.match(s,/var STATE=\{fixtureId:null,phase:'idle'\}/);
});
test("the component is never imported by any exports/application-* adapter",()=>{
  const dir=path.join(R,"exports");
  const files=fs.readdirSync(dir).filter(f=>f.endsWith(".js"));
  files.forEach(f=>{
    const s=read(path.join("exports",f));
    assert.doesNotMatch(s,/SimulatedDocumentCheck/,`exports/${f} must not reference the simulated check`);
  });
});
test("the established, reused-everywhere boundary string appears verbatim, not the reference mockup's own wording",()=>{
  const s=read("components/simulated-document-check.js");
  assert.match(s,/Nothing has been uploaded, reviewed, submitted, approved, or stored\./);
});
test("clicks route through the existing delegated actions table in core/events.js, not a new listener",()=>{
  const s=read("core/events.js");
  assert.match(s,/"simdoc-select":function\(b\)\{if\(typeof SimulatedDocumentCheck!=="undefined"\)SimulatedDocumentCheck\.select\(b\.getAttribute\("data-fixture"\)\);\}/);
  assert.match(s,/"simdoc-check":function\(\)\{if\(typeof SimulatedDocumentCheck!=="undefined"\)SimulatedDocumentCheck\.check\(\);\}/);
  assert.match(s,/"simdoc-remove":function\(\)\{if\(typeof SimulatedDocumentCheck!=="undefined"\)SimulatedDocumentCheck\.remove\(\);\}/);
  assert.doesNotMatch(s,/addEventListener\(["']click["'][^)]*simdoc/);
});
// 2026-10-05 (follow-up): stableRender() calls the app's full render() underneath, which rebuilds
// every <details>-based accordion on the page from scratch — confirmed live this snapped every OTHER
// open accordion closed on each of this component's own state transitions ("the accordion drawers
// collapse, losing place"). Switched to a scoped outerHTML swap of just this component's own
// container so the rest of the page/accordion tree is never touched.
test("the state machine's own re-renders are scoped to just this component's container, not a full-page stableRender()/render() that would collapse every other accordion",()=>{
  const s=read("components/simulated-document-check.js");
  assert.match(s,/function rerender\(\)\{var el=typeof document!=='undefined'\?document\.querySelector\('\.simulated-document-check'\):null;if\(el\)el\.outerHTML=render\(\);\}/);
  assert.doesNotMatch(s,/function rerender\(\)\{if\(typeof stableRender/);
});
test("wired into screen-summary.js's living preparation plan as a third disclosure, reusing the existing summaryDisclosure accordion",()=>{
  const s=read("screens/screen-summary.js");
  assert.match(s,/SimulatedDocumentCheck\.render\(\)/);
  assert.match(s,/summaryDisclosure\('simulated-check','Try a simulated document check'/);
});
test("build.js registers both new files exactly once, in the data/document and components/document sections",()=>{
  const b=read("build.js");
  assert.match(b,/'data\/document-guidance-catalog\.js','data\/document-reference-examples\.js','data\/simulated-document-fixtures\.js'/);
  assert.match(b,/'components\/document-guidance-card\.js','components\/simulated-document-check\.js'/);
  assert.match(b,/'components\.simulated-document-check\.css'/);
  const jsCount=(b.match(/data\/simulated-document-fixtures\.js/g)||[]).length;
  const compCount=(b.match(/components\/simulated-document-check\.js/g)||[]).length;
  assert.equal(jsCount,1);
  assert.equal(compCount,1);
});
test("deliberately does not touch the real document-guidance engine, card UI, or the document gallery",()=>{
  const engine=read("core/document-guidance-engine.js");
  const card=read("components/document-guidance-card.js");
  const gallery=read("components/fast-facts-document-gallery.js");
  [engine,card,gallery].forEach(s=>assert.doesNotMatch(s,/SimulatedDocumentCheck|simulated-document/));
});
