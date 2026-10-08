'use strict';
/* Durable V45.6.9.7 backlog regression coverage (re-implemented and verified in V45.6.9.8). */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ctx={esc};
for(const f of ['data/visual-example-catalog.js','data/learning-card-registry.js','data/progressive-visual-rules.js','data/progressive-insights.js'])vm.runInNewContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
const PI=ctx.ProgressiveInsights,PV=ctx.ProgressiveVisuals;
const ids=(pt,a,stage,opts)=>Array.from(PI.select(pt,a,stage,opts),r=>r.id);
const derived=(pt,a)=>Array.from(PV.derive(pt,a),r=>r.id);

/* ---------- ADU service method parity ---------- */
test('ADU overhead answer releases DGM-EQ-008 at the Service Method question',()=>{
  const a={aduType:'Detached ADU',aduServiceMethod:'Overhead'};
  assert.ok(ids('adu',a,'aduServiceMethod').includes('DGM-EQ-008'));
  assert.match(PI.forQuestion('aduServiceMethod','adu',a),/data-progressive-id="DGM-EQ-008"/);
  assert.match(PI.forQuestion('aduServiceMethod','adu',a),/Illustrative example only/);
});
test('ADU underground answer releases DGM-SVC-UG-001',()=>{
  const a={aduType:'Attached ADU',aduServiceMethod:'Underground'};
  assert.ok(ids('adu',a,'aduServiceMethod').includes('DGM-SVC-UG-001'));
  assert.ok(!ids('adu',a,'aduServiceMethod').includes('DGM-EQ-008'));
});
test('ADU "I’m not sure", skipped, and invalidated service method release no service-method visual',()=>{
  for(const v of ['I’m not sure',"I'm not sure",'','Not sure']){const r=ids('adu',{aduServiceMethod:v},'aduServiceMethod');assert.ok(!r.includes('DGM-EQ-008')&&!r.includes('DGM-SVC-UG-001'),v);}
  const a={aduServiceMethod:'Overhead'};
  assert.deepEqual(ids('adu',a,'aduServiceMethod',{skipped:['aduServiceMethod']}),[]);
  assert.deepEqual(ids('adu',a,'aduServiceMethod',{invalidatedAnswers:{aduServiceMethod:true}}),[]);
});
test('correcting overhead to underground replaces the overhead example',()=>{
  const a={aduServiceMethod:'Overhead'};assert.ok(ids('adu',a,'aduServiceMethod').includes('DGM-EQ-008'));
  a.aduServiceMethod='Underground';const r=ids('adu',a,'aduServiceMethod');
  assert.ok(!r.includes('DGM-EQ-008'));assert.ok(r.includes('DGM-SVC-UG-001'));
  const s=PI.forSummary('adu',a);assert.doesNotMatch(s,/DGM-EQ-008"/);assert.match(s,/DGM-SVC-UG-001/);
});
test('switching from ADU to panel clears ADU-only derived visuals',()=>{
  const a={aduType:'Detached ADU',aduMeterServiceIntent:'Add a separate service connection',aduServiceMethod:'Overhead'};
  assert.ok(derived('adu',a).includes('DGM-EQ-008'));
  const p=derived('panel',a);assert.deepEqual(p,[]);
  assert.doesNotMatch(PI.forSummary('panel',a),/progressive-id/);
});
test('ADU service-method visual does not appear before the Service Method stage (back navigation)',()=>{
  const a={aduType:'Detached ADU',aduServiceMethod:'Underground'};
  for(const stage of ['property','aduType','aduAddressStatus','aduMeterServiceIntent'])assert.ok(!ids('adu',a,stage).includes('DGM-SVC-UG-001'),stage);
});
test('panel service-method behavior is unchanged',()=>{
  assert.deepEqual(ids('panel',{panelServiceMethod:'Overhead service'},'panelServiceMethod'),['DGM-EQ-008-SERVICE-SPAN']);
  assert.deepEqual(ids('panel',{panelServiceMethod:'Underground service'},'panelServiceMethod'),['DGM-SVC-UG-001']);
  assert.deepEqual(ids('panel',{panelServiceMethod:'I’m not sure'},'panelServiceMethod'),[]);
  assert.ok(!ids('panel',{panelServiceMethod:'Overhead service'},'panelServiceMethod').includes('DGM-EQ-008'));
});

/* ---------- Feedback control ---------- */
function feedbackHtml(){
  const c={esc,InsightComponentRegistry:{register(){}},ExperienceAssembler:{},InsightEngine:{}};
  vm.runInNewContext(fs.readFileSync(path.join(root,'components/explainable-insight-card.js'),'utf8'),c);
  return {reasons:Array.from(c.ExplainableInsightCard.FEEDBACK_REASONS),src:fs.readFileSync(path.join(root,'components/explainable-insight-card.js'),'utf8')};
}
test('six "Tell us why" reasons exist with preserved instrumentation attributes',()=>{
  const {reasons,src}=feedbackHtml();
  assert.deepEqual(reasons,['It sounded like a requirement','The guidance was unclear','The example did not match my project','I needed more detail','I expected a different next step','The image was not helpful']);
  assert.match(src,/data-act="insight-feedback-reason" data-value="'\+e\(r\)\+'" data-insight-id="'\+id\+'"/);
});
test('Yes, Partly, and No usefulness choices remain grouped',()=>{
  const {src}=feedbackHtml();
  assert.match(src,/insight-feedback__choices" role="group" aria-label="Was this useful\?"><button[^>]*data-act="insight-feedback" data-value="yes"[\s\S]*data-value="partly"[\s\S]*data-value="no"/);
  assert.match(src,/<details class="insight-feedback"><summary class="insight-feedback__summary">Was this useful\?<\/summary>/);
  assert.match(src,/<details class="insight-feedback__reasons"><summary>Tell us why<\/summary>/);
});
test('risk signal remains exclusive to "It sounded like a requirement"',()=>{
  const ev=fs.readFileSync(path.join(root,'core/events.js'),'utf8');
  assert.match(ev,/riskSignal:b\.getAttribute\("data-value"\)==="It sounded like a requirement"/);
});
test('feedback handlers do not navigate, persist, or change project answers',()=>{
  const ev=fs.readFileSync(path.join(root,'core/events.js'),'utf8');
  for(const act of ['"insight-feedback"','"insight-feedback-reason"']){
    const i=ev.indexOf(act+':function'),body=ev.slice(i,ev.indexOf('},\n',i));
    assert.ok(i>0,act);assert.doesNotMatch(body,/S\.|render\(|navigate|scheduleDraftSave|persistDraft|setAnswer/);
  }
  assert.doesNotMatch(ev.split('isNav=')[1].split(').test')[0],/insight-feedback/);
});
test('feedback spacing and wrapping CSS classes exist without fixed heights',()=>{
  // 2026-10-06: narrowed to just this section's own rules (previously ran to end-of-file with no
  // upper bound, silently sweeping in every later section too) — the question-dropdown thumbnail
  // rule added much further down (".inline-response__figure img{width:60px;height:60px...}")
  // intentionally fixes both dimensions to a small square and is unrelated to this feedback-spacing
  // contract.
  const css=fs.readFileSync(path.join(root,'components.visual-examples.css'),'utf8'),block=css.split('V45.6.9.8 INSIGHT FEEDBACK SPACING')[1].split('V45.6.9.9 SELECTED-ANSWER INLINE RESPONSE')[0];
  for(const s of ['.insight-feedback__choices{display:flex;flex-wrap:wrap','.insight-feedback__reasons{margin:16px 0 0;padding-top:14px;border-top','.insight-feedback__reason-list{display:flex;flex-wrap:wrap','.insight-feedback .chip:focus-visible','white-space:normal'])assert.ok(block.includes(s),s);
  assert.doesNotMatch(block,/[^-]height:\d/);
});

/* ---------- Image governance ---------- */
test('every SLD rule has a controlling answer; none fires on project type alone',()=>{
  for(const r of PV.rules){assert.ok(Object.keys(r.when).length>=1,r.id);if(r.id.startsWith('SLD-'))assert.ok(Object.values(r.when).every(v=>v!=='*'),r.id+' uses a wildcard');}
  assert.deepEqual(derived('adu',{}),[]);assert.deepEqual(derived('panel',{}),[]);
});
test('no ADU electrical configuration is inferred from aduType alone',()=>{
  for(const t of ['Detached ADU','Attached ADU']){const d=derived('adu',{aduType:t});assert.ok(!d.some(x=>x.startsWith('SLD-')),t);assert.ok(!d.some(x=>/^DGM-/.test(x)),t);}
});
test('no panel capacity image appears when capacity intent is unknown',()=>{
  for(const a of [{},{panelIntent:'I’m not sure'},{panelIntent:'Add electrical equipment; panel change not decided',panelProposedCapacity:'400 amps or more'}]){const d=derived('panel',a);assert.ok(!d.includes('SLD-008')&&!d.includes('SLD-012'),JSON.stringify(a));}
});
test('all referenced asset paths resolve with case-sensitive matching',()=>{
  const missing=[];
  for(const x of ctx.VISUAL_EXAMPLE_CATALOG){const segs=x.assetPath.split('/');let dir=root;for(const s of segs){const list=fs.existsSync(dir)?fs.readdirSync(dir):[];if(!list.includes(s)){missing.push(x.id+' '+x.assetPath);break;}dir=path.join(dir,s);}}
  assert.deepEqual(missing,[],'Run against the full local asset tree (assets/learning-cards).');
  for(const r of PV.rules)assert.ok(ctx.LearningCardRegistry.byId(r.id),'rule asset registered: '+r.id);
});
