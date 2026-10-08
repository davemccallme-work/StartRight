'use strict';
/* V45.6.9.9 selected-answer inline responses, 400A governance, and document-guidance activation. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function ctx(opts={}){const c=vm.createContext({esc,icon:()=>''});c.window=c;
  const files=['data.js','data/visual-example-catalog.js','data/learning-card-registry.js','data/progressive-visual-rules.js','data/progressive-insights.js']
   .concat(opts.noDocs?[]:['data/document-guidance-catalog.js','core/document-guidance-engine.js','components/document-guidance-card.js'])
   .concat(opts.noCatalog?[]:['data/answer-response-catalog.js'])
   .concat(['core/question-inline-response-engine.js','components/question-inline-response.js']);
  c.S={answers:{}};
  for(const f of files)vm.runInContext(read(f),c,{filename:f});return c;}
const c=ctx();
const Q=id=>{const all={aduType:c.ADU_TYPE_QUESTION,aduAddressStatus:c.ADU_ADDRESS_STATUS_QUESTION,aduMeterServiceIntent:c.ADU_METER_SERVICE_INTENT_QUESTION,aduServiceMethod:c.ADU_SERVICE_METHOD_QUESTION,aduAdjacentService:c.ADU_ADJACENT_SERVICE_QUESTION,panelIntent:c.PANEL_INTENT_QUESTION,panelServiceMethod:c.PANEL_SERVICE_METHOD_QUESTION,panelExistingCapacity:c.PANEL_EXISTING_CAPACITY_QUESTION,panelCapacityCompare:c.PANEL_CAPACITY_COMPARE_QUESTION,panelLoads:c.PANEL_LOAD_QUESTION};return all[id];};
const derive=(pt,qid,answers,o={},cx=c)=>cx.QuestionInlineResponseEngine.derive({projectType:pt,question:Q(qid),answers,skipped:o.skipped||[],invalidatedAnswers:o.invalidatedAnswers||{}});
const UNSURE='I’m not sure';

/* ---------- Catalog governance ---------- */
test('answer-response catalog validates, uses unique IDs, and references only real document keys',()=>{
  const cat=c.ANSWER_RESPONSE_CATALOG;assert.deepEqual(Array.from(cat.validate()),[]);
  for(const r of cat.rows)for(const k of r.documentGuidanceKeys)assert.ok(c.DOCUMENT_GUIDANCE_CATALOG.documents[k],r.responseId+' '+k);
  for(const r of cat.rows.filter(r=>r.answerValue===UNSURE))assert.equal(r.documentGuidanceKeys.length,0,r.responseId);
});
test('catalog copy avoids determination language (same lint as the insight catalog)',()=>{
  const blocked=/\b(?:will|required|approved|eligible|guaranteed|PG&E has determined)\b/i,ok=/does not|has not been|not (?:a )?(?:required|approved)|whether|not yet confirmed/i,f=[];
  for(const r of c.ANSWER_RESPONSE_CATALOG.rows)for(const k of ['definition','preparation','uncertainty']){const t=String(r[k]||'');if(blocked.test(t)&&!ok.test(t))f.push(r.responseId+' '+k);}
  assert.deepEqual(f,[]);assert.doesNotMatch(c.ANSWER_RESPONSE_CATALOG.boundary,/\bis required\b/i);
});
test('every canonical ADU and panel option has a governed response',()=>{
  const missing=[];
  for(const [pt,qid] of [['adu','aduType'],['adu','aduAddressStatus'],['adu','aduMeterServiceIntent'],['adu','aduServiceMethod'],['adu','aduAdjacentService'],['panel','panelIntent'],['panel','panelServiceMethod'],['panel','panelExistingCapacity']]){
    for(const o of Q(qid).options){const v=typeof o==='string'?o:o.value;if(!derive(pt,qid,{[qid]:v}))missing.push(qid+':'+v);}}
  assert.deepEqual(missing,[]);
});

/* ---------- Selected-answer response ---------- */
test('no response before a canonical answer is selected',()=>{assert.equal(derive('adu','aduType',{}),null);assert.equal(derive('adu','aduType',{aduType:''}),null);});
test('Junior ADU produces one response labelled with the customer title and releases only SLD-006',()=>{
  const m=derive('adu','aduType',{aduType:'Junior ADU'});assert.equal(m.displayLabel,'Junior ADU');assert.equal(m.responseId,'adu-type-junior');assert.deepEqual(Array.from(m.visualIds),['SLD-006']);
  const h=c.QuestionInlineResponse.render(m,'');assert.equal((h.match(/<details class=\"answer-context inline-response\"/g)||[]).length,1);assert.match(h,/About “Junior ADU”/);assert.match(h,/ open>/);
});
test('changing the answer replaces the response; the same answer yields the same key (no duplication)',()=>{
  const a={aduType:'Detached ADU'},m1=derive('adu','aduType',a);a.aduType='Attached ADU';const m2=derive('adu','aduType',a);
  assert.notEqual(m1.responseKey,m2.responseKey);assert.deepEqual(Array.from(m2.visualIds),['ILL-ADU-002']);assert.equal(derive('adu','aduType',a).responseKey,m2.responseKey);
});
test('“I’m not sure” gives coaching only: no documents, no configuration images',()=>{
  for(const [pt,qid] of [['adu','aduType'],['adu','aduMeterServiceIntent'],['adu','aduServiceMethod'],['panel','panelIntent'],['panel','panelServiceMethod']]){
    const m=derive(pt,qid,{[qid]:UNSURE});assert.ok(m,qid);assert.equal(m.isUnsure,true);assert.equal(m.documents.length,0,qid);assert.equal(m.visualIds.length,0,qid);}
});
test('skipped and invalidated answers fail closed',()=>{
  assert.equal(derive('adu','aduServiceMethod',{aduServiceMethod:'Overhead'},{skipped:['aduServiceMethod']}),null);
  assert.equal(derive('adu','aduServiceMethod',{aduServiceMethod:'Overhead'},{invalidatedAnswers:{aduServiceMethod:true}}),null);
});
test('project switching removes the other journey’s response',()=>{
  assert.equal(derive('panel','aduType',{aduType:'Detached ADU'}),null);assert.equal(derive('ev','panelIntent',{panelIntent:'Relocate the panel'}),null);
});
test('ADU service method overhead/underground swap and correct',()=>{
  const a={aduServiceMethod:'Overhead'};assert.deepEqual(Array.from(derive('adu','aduServiceMethod',a).visualIds),['DGM-EQ-008']);
  a.aduServiceMethod='Underground';const m=derive('adu','aduServiceMethod',a);assert.deepEqual(Array.from(m.visualIds),['DGM-SVC-UG-001']);assert.ok(m.documents.some(d=>d.id==='DOC-CIVIL'));
});
test('multi-select loads resolve to the governed selected-equipment response',()=>{
  const m=derive('panel','panelLoads',{panelIntent:'Increase the panel capacity',panelLoads:['EV charger','Heat pump or electric HVAC']});
  assert.equal(m.responseId,'panel-loads-selected');assert.equal(m.displayLabel,'EV charger, Heat pump or electric HVAC');
  assert.equal(derive('panel','panelLoads',{panelLoads:['No added equipment']}).responseId,'panel-loads-none');
});
test('engine never writes to answers',()=>{const a=Object.freeze({panelIntent:'Increase the panel capacity',panelProposedCapacity:'400 amps or more',panelExistingCapacity:'200 amps'});assert.doesNotThrow(()=>derive('panel','panelCapacityCompare',a));
  const src=read('core/question-inline-response-engine.js')+read('components/question-inline-response.js');assert.doesNotMatch(src,/localStorage|sessionStorage|persistDraft|scheduleDraftSave|setAnswer|S\.answers\s*=|history\.(push|replace)State/);});

/* ---------- 400A (SLD-012) governance ---------- */
test('explicit 400A capacity increase releases SLD-012 and supersedes SLD-008',()=>{
  const a={panelIntent:'Increase the panel capacity',panelExistingCapacity:'200 amps',panelProposedCapacity:'400 amps or more'};
  const m=derive('panel','panelCapacityCompare',a);assert.equal(m.responseId,'panel-compare-400');assert.ok(m.visualIds.includes('SLD-012'));assert.ok(!m.visualIds.includes('SLD-008'));
  assert.ok(Array.from(c.ProgressiveVisuals.derive('panel',a),r=>r.id).includes('SLD-012'));assert.ok(!Array.from(c.ProgressiveVisuals.derive('panel',a),r=>r.id).includes('SLD-008'));
});
test('SLD-012 correction matrix',()=>{
  const ids=(a,stage,o)=>Array.from(c.ProgressiveInsights.select('panel',a,stage,o),r=>r.id);
  const a={panelIntent:'Increase the panel capacity',panelExistingCapacity:'200 amps',panelProposedCapacity:'400 amps or more'};
  assert.ok(ids(a,'panelCapacityCompare').includes('SLD-012'));
  a.panelProposedCapacity='200 amps';assert.ok(!ids(a,'panelCapacityCompare').includes('SLD-012'));assert.ok(ids(a,'panelCapacityCompare').includes('SLD-008'));
  a.panelProposedCapacity='400 amps or more';a.panelIntent='Relocate the panel';assert.ok(!ids(a,'panelCapacityCompare').includes('SLD-012'));assert.ok(ids(a,'panelIntent').includes('SLD-010'));
  a.panelIntent='Increase the panel capacity';a.panelProposedCapacity=UNSURE;assert.ok(!ids(a,'panelCapacityCompare').includes('SLD-012'));
  a.panelProposedCapacity='400 amps or more';assert.ok(!ids(a,'panelCapacityCompare',{skipped:['panelCapacityCompare']}).includes('SLD-012'));
  assert.deepEqual(Array.from(c.ProgressiveVisuals.derive('adu',a),r=>r.id).filter(x=>x==='SLD-012'),[]);
});
test('SLD-012 is never released without an explicit increase intent or from existing capacity alone',()=>{
  for(const a of [{panelProposedCapacity:'400 amps or more'},{panelIntent:'Add electrical equipment; panel change not decided',panelProposedCapacity:'400 amps or more'},{panelIntent:'Replace the panel at the same capacity',panelProposedCapacity:'400 amps or more'},{panelIntent:'Increase the panel capacity',panelExistingCapacity:'More than 200 amps'}])
    assert.ok(!Array.from(c.ProgressiveVisuals.derive('panel',a),r=>r.id).includes('SLD-012'),JSON.stringify(a));
});
test('at the panel-intent stage a stale 400A value does not suppress the general capacity diagram',()=>{
  const a={panelIntent:'Increase the panel capacity',panelProposedCapacity:'400 amps or more'};assert.ok(Array.from(c.ProgressiveInsights.select('panel',a,'panelIntent'),r=>r.id).includes('SLD-008'));
});
test('SLD-012 has governed customer copy and boundary',()=>{const h=c.ProgressiveInsights.forQuestion('panelCapacityCompare','panel',{panelIntent:'Increase the panel capacity',panelExistingCapacity:'200 amps',panelProposedCapacity:'400 amps or more'});assert.match(h,/data-progressive-id="SLD-012"/);assert.match(h,/not a required, available, or approved service size/);});

/* ---------- Document guidance activation ---------- */
test('document items appear only when DocumentGuidanceEngine releases them',()=>{
  const a={panelIntent:'Increase the panel capacity',panelServiceMethod:'Overhead service',panelExistingCapacity:'100 amps',panelProposedCapacity:'400 amps or more'};
  const ids=Array.from(derive('panel','panelCapacityCompare',a).documents,d=>d.id);assert.deepEqual(ids.sort(),['DOC-CUTSHEET','DOC-ELEVATION','DOC-SLD']);
  a.panelProposedCapacity='320 amps';const ids2=Array.from(derive('panel','panelCapacityCompare',a).documents,d=>d.id);assert.ok(ids2.includes('DOC-CUTSHEET'));assert.ok(!ids2.includes('DOC-SLD'));
  const ov=Array.from(derive('panel','panelServiceMethod',{panelServiceMethod:'Overhead service'}).documents,d=>d.id).sort();assert.deepEqual(ov,['PHOTO-SPAN','PHOTO-WEATHERHEAD']);
  assert.equal(derive('panel','panelServiceMethod',{panelServiceMethod:'Underground service'}).documents.length,0);
});
test('document list uses “may” language and never labels an item as required',()=>{
  const m=derive('panel','panelCapacityCompare',{panelIntent:'Increase the panel capacity',panelExistingCapacity:'100 amps',panelProposedCapacity:'400 amps or more'});
  const h=c.QuestionInlineResponse.render(m,'');assert.match(h,/Documents or photos that may help/);assert.match(h,/May apply to your project/);assert.match(h,/not a list of required documents/);const docs=h.split('inline-response__documents')[1].split('</ul>')[0];assert.doesNotMatch(docs,/\brequired\b/i);
});
test('missing document engine or catalog fails closed without breaking the response',()=>{
  const cx=ctx({noDocs:true});const m=derive('panel','panelServiceMethod',{panelServiceMethod:'Overhead service'},{},cx);assert.ok(m);assert.equal(m.documents.length,0);assert.doesNotMatch(cx.QuestionInlineResponse.render(m,''),/Documents or photos/);
  const cy=ctx({noCatalog:true});assert.equal(derive('adu','aduType',{aduType:'Detached ADU'},{},cy),null);
});
test('build loads document guidance and inline-response modules in dependency order',()=>{
  const b=read('build.js'),pos=f=>b.indexOf("'"+f+"'");
  const order=['data/progressive-insights.js','data/document-guidance-catalog.js','data/answer-response-catalog.js','core/document-guidance-engine.js','core/question-inline-response-engine.js','components/document-guidance-card.js','components/question-inline-response.js','screens/screen-questions.js','core/events.js'];
  order.forEach(f=>assert.ok(pos(f)>0,f));for(let i=1;i<order.length;i++)assert.ok(pos(order[i])>pos(order[i-1]),order[i]);
});

/* ---------- Screen integration and accessibility ---------- */
test('question screen keeps definitions above choices and the response below them',()=>{
  const q=read('screens/screen-questions.js'),step=q.slice(q.indexOf('var left='));
  assert.ok(step.indexOf('QuestionHelp.forQuestion')<step.indexOf("'<div class=\"field\">'+body"));assert.ok(step.indexOf("'<div class=\"field\">'+body")<step.indexOf('inlineAnswerResponse(q)'));
  assert.match(q,/if\(!String\(inner\)\.trim\(\)\)return '';/,'no empty accordion');assert.match(q,/ContextualQuestionResponse\.render/);
});
test('accordion is native details/summary, expanded by default, and collapse memory is transient',()=>{
  const m=derive('adu','aduType',{aduType:'Detached ADU'}),h=c.QuestionInlineResponse.render(m,'');assert.match(h,/^<details [^>]*data-inline-response-key="[^"]+"[^>]* open>/);assert.match(h,/<summary class="inline-response__summary">/);
  const src=read('components/question-inline-response.js');assert.match(src,/addEventListener\('toggle'/);assert.match(src,/,true\);/);
});
test('answer changes announce politely and never move focus',()=>{
  const ev=read('core/events.js');assert.equal((ev.match(/pnAnnounceInlineResponse\(\);/g)||[]).length,3);
  const src=read('components/question-inline-response.js');assert.match(src,/getElementById\('status'\)/);assert.doesNotMatch(src,/\.focus\(/);
  assert.match(read('index.html'),/<p class="sr" aria-live="polite" id="status">/);
});
test('responsive and forced-colors CSS contract; no fixed heights',()=>{
  // 2026-10-06: narrowed the slice to just this section's own rules (previously ran to end-of-file
  // with no upper bound, so it was already silently sweeping in every later section too — harmless
  // until one of them legitimately needed a fixed height). The question-dropdown thumbnail rule
  // added after V45.6.10 (components.visual-examples.css, ".inline-response__figure img{width:60px;
  // height:60px...}") intentionally fixes both dimensions to a small square — that's a different,
  // later feature this test was never meant to cover, not a regression of this one.
  const css=read('components.visual-examples.css'),block=css.split('V45.6.9.9 SELECTED-ANSWER INLINE RESPONSE')[1].split('V45.6.10 VISUAL REFINEMENTS')[0];assert.ok(block);
  for(const s of ['@media(max-width:760px)','@media(forced-colors:active)','@media(prefers-reduced-motion:reduce)','.inline-response img{max-width:100%;height:auto','min-height:48px'])assert.ok(block.includes(s),s);
  assert.doesNotMatch(block,/[^-]height:\d/);
});
/* Retired 2026-10-03: pinned RELEASE_VERSION to the V45.6.x era, now superseded by V45.7.x.
   See tests/v45.6.13-visual-guidance-migration.test.js for the still-live, version-independent contract. */
