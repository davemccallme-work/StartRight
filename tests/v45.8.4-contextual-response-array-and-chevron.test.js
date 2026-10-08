"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const R=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(R,f),"utf8");
// 2026-10-05: ContextualQuestionResponse.val() returned S.answers[q.id] as-is for a multichoice
// question (e.g. panelLoads, "Equipment and loads") — an array, not a string. [] is truthy in JS,
// so render()'s `if(!v)return html` bail never caught the unanswered case, and esc([]) stringifies
// to '', producing a visible but content-less `About ""` accordion. Confirmed live on the panel
// project's "Equipment and loads" question with its sibling panel questions already answered.
test("contextual response val() treats an array answer as its own value, not a truthy-but-unusable object",()=>{
  const s=read("components/contextual-question-response.js");
  assert.match(s,/if\(Array\.isArray\(v\)\)return v\.join\(', '\)/);
});
function loadContextualQuestionResponse(answers){
  const src=read("components/contextual-question-response.js");
  const factory=new Function("S","esc",src+"\nreturn ContextualQuestionResponse;");
  return factory({answers:answers},x=>String(x));
}
test("an empty multichoice answer (unanswered) still falls through to the no-content bail, not an empty-quotes accordion",()=>{
  const out=loadContextualQuestionResponse({panelLoads:[]}).render({id:"panelLoads"},"<p>fallback content</p>");
  assert.equal(out,"<p>fallback content</p>");
  assert.doesNotMatch(out,/About/);
});
test("a non-empty multichoice answer renders a readable, comma-joined label instead of an empty string",()=>{
  const out=loadContextualQuestionResponse({panelLoads:["EV charger","Heat pump"]}).render({id:"panelLoads"},"<p>fallback content</p>");
  assert.match(out,/About “EV charger, Heat pump”/);
});
// 2026-10-05: this bare <summary> (components/contextual-question-response.js's fallback renderer —
// the only thing that uses .answer-context without the "inline-response" modifier class) never got
// the chevron-placement fix .inline-response__summary already has. flex+justify-content:space-between
// spread the text span, the <small> subtitle, and the ::after chevron across the row as three
// siblings instead of stacking the two text lines together; the mobile override made it worse by
// switching to display:grid with no explicit placement, stacking the chevron below both lines.
// Confirmed live: the chevron rendered centered beneath "About """ and its subtitle instead of
// inline at the top-right. Same proven fix as .inline-response__summary: one explicit 2-column grid
// at every width, chevron spanning both text rows on the right.
test("answer-context summary uses the same explicit grid chevron placement as the already-fixed inline-response summary",()=>{
  const s=read("components.visual-examples.css");
  assert.match(s,/\.answer-context>summary\{display:grid;grid-template-columns:minmax\(0,1fr\) auto;align-items:center;column-gap:12px;padding:14px;cursor:pointer;font-weight:800;list-style:none\}/);
  assert.match(s,/\.answer-context>summary::-webkit-details-marker\{display:none\}/);
  assert.match(s,/\.answer-context>summary>span\{grid-column:1;grid-row:1/);
  assert.match(s,/\.answer-context>summary small\{grid-column:1;grid-row:2/);
  assert.match(s,/\.answer-context>summary::after\{grid-column:2;grid-row:1\/span 2;justify-self:end;align-self:center;position:static;margin:0\}/);
  assert.doesNotMatch(s,/\.answer-context>summary\{display:flex/);
  assert.doesNotMatch(s,/@media\(max-width:720px\)\{\.answer-context>summary\{display:grid\}/);
});
