'use strict';
/* V45.6.9.8 Fast Facts scenario-agnostic navigation contract. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function ctx(withWorkspace=true){const c=vm.createContext({esc});const files=['data/visual-example-catalog.js','data/learning-card-registry.js','components/visual-examples.js','components/fast-facts-document-gallery.js'].concat(withWorkspace?['components/fast-facts-sections.js','components/fast-facts-workspace.js']:[]).concat(['components/fast-insights.js']);for(const f of files)vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c,{filename:f});return c;}
const c=ctx();
const next={adu:{id:'aduType',label:'What type of unit are you adding?'},panel:{id:'panelIntent',label:'What are you planning to do with the electrical panel?'}};
const page=(pt,property='Not sure',answers={},skipped=[])=>c.FastInsights.render({projectType:pt,property,nextQuestion:next[pt],answers,skipped});
const navLinks=h=>[...h.matchAll(/<a class="ff-nav__link" href="#([^"]+)" data-ff-target="([^"]+)">([^<]+)<\/a>/g)].map(m=>({href:m[1],target:m[2],label:m[3]}));
const sectionIds=h=>[...h.matchAll(/<section class="ff-section" id="([^"]+)"/g)].map(m=>m[1]);

test('single section configuration is valid and is the only label/order source',()=>{
  assert.deepEqual(Array.from(c.FastFactsSections.validate()),[]);
  const cfg=c.FastFactsSections.list();
  assert.deepEqual(Array.from(cfg,s=>s.slot),['scenario-guide','what-may-change','prepare','planning-context','next']);
  const ws=fs.readFileSync(path.join(root,'components/fast-facts-workspace.js'),'utf8');
  for(const s of cfg)assert.ok(!ws.includes("'"+s.navLabel+"'")&&!ws.includes('>'+s.navLabel+'<'),'workspace must not hard-code label '+s.navLabel);
  assert.ok(!/adu|panel/i.test(ws.replace(/projectType|data-ff-project/g,'')),'workspace renderer must not branch on scenario names');
});
test('validator rejects progress or status language and duplicate anchors',()=>{
  const bad=[{slot:'a',anchorId:'ff-a',navLabel:'Step 1',title:'x'},{slot:'b',anchorId:'ff-a',navLabel:'Ready to apply',title:'y'}];
  const e=Array.from(c.FastFactsSections.validate(bad)).join(' | ');
  assert.match(e,/progress or status/);assert.match(e,/duplicate anchorId/);
});
test('ADU and panel render a two-column workspace with rail and reading pane',()=>{
  for(const pt of ['adu','panel']){const h=page(pt);
    assert.match(h,/class="ff-workspace" data-ff-workspace/);assert.match(h,/<nav class="ff-nav" aria-labelledby="ff-nav-heading" data-ff-nav>/);assert.match(h,/class="ff-reading-pane"/);
    assert.match(h,/data-ff-nav-toggle/);assert.match(h,/aria-controls="ff-nav-list"/);
  }
});
test('every nav item reaches an existing section; nav and page share order',()=>{
  for(const pt of ['adu','panel']){const h=page(pt),links=navLinks(h),ids=sectionIds(h);
    assert.ok(links.length>=4);assert.deepEqual(links.map(l=>l.target),ids);
    for(const l of links){assert.equal(l.href,l.target);assert.ok(h.includes('id="'+l.target+'-h"'),'heading for '+l.target);}
    assert.equal(new Set(ids).size,ids.length);
  }
});
test('no numbering, progress, completion, readiness, eligibility, or Page N of M in the rail',()=>{
  for(const pt of ['adu','panel']){const nav=page(pt).match(/<nav class="ff-nav"[\s\S]*?<\/nav>/)[0],text=nav.replace(/<[^>]+>/g,' ');
    assert.doesNotMatch(text,/\d/);assert.doesNotMatch(nav,/ff-nav__number|nav__status/);assert.doesNotMatch(nav,/step|complete|incomplete|ready|eligib|approved|submitted|percent|progress|of \d|checkmark|✓|✔/i);
    assert.doesNotMatch(nav,/aria-current|aria-selected|is-read|is-unread|data-read-state/);
  }
});
test('Recommended Next Action is first in the reading pane, dominant, actionable, and outside nav',()=>{
  for(const pt of ['adu','panel']){const h=page(pt),pane=h.split('class="ff-reading-pane">')[1];
    assert.ok(pane.startsWith('<section class="ff-recommended insight-section" id="insight-next"'));
    for(const w of ['Recommended next action','Best thing to clarify next','What to do:','Why we’re asking','Who can help confirm'])assert.ok(pane.includes(w),w);
    assert.equal((h.match(/data-act="fast-facts-continue"/g)||[]).length,1);
    assert.ok(!navLinks(h).some(l=>l.target==='insight-next'));
    assert.doesNotMatch(pane.split('</section>')[0],/<details/,'primary action is not collapsed');
  }
});
test('customer facts are distinct from working interpretation; open confirmations stay visible',()=>{
  const h=page('adu','Not sure',{aduType:'Detached ADU',aduMeterServiceIntent:'I’m not sure'},['aduServiceMethod']);
  assert.match(h,/ff-facts__item--customer[\s\S]*You told us[\s\S]*Detached ADU/);assert.match(h,/ff-facts__item--interpretation[\s\S]*Working interpretation/);
  const nextSec=h.split('id="ff-section-next"')[1];
  assert.match(nextSec,/Still to confirm/);assert.match(nextSec,/Property type[\s\S]*You selected Not sure/);
  assert.match(nextSec,/separate meter[\s\S]*You selected I’m not sure/);assert.match(nextSec,/overhead or underground[\s\S]*Skipped for now/);
  assert.doesNotMatch(nextSec,/ADU type \(detached/,'answered items are not listed as open');
  assert.doesNotMatch(nextSec,/complete|resolved|done|✓/i);
});
test('document, photo, and visual examples remain discoverable in Prepare; fixed asset IDs resolve',()=>{
  const h=page('panel'),prep=h.split('id="ff-section-prepare"')[1].split('id="ff-section-planning-context"')[0];
  for(const w of ['Worth having handy','Photos that may help','Documents you may encounter','Documents that may be useful later','Only if your service is overhead'])assert.ok(prep.includes(w),w);
  for(const id of ['PHO-GOOD-001','PHO-GOOD-002','PHO-GOOD-005A','DOC-001','DOC-006'])assert.ok(c.LearningCardRegistry.byId(id),id);
  assert.ok((prep.match(/<img /g)||[]).length>=5,'photo and document images render');
  const fi=fs.readFileSync(path.join(root,'components/fast-insights.js'),'utf8');
  assert.doesNotMatch(fi,/PHO-METER-GOOD-001|PHO-PANEL-GOOD-001|PHO-MAST-GOOD-001/);
});
test('prior Fast Facts content, benchmarks, and boundaries are preserved',()=>{
  const a=page('adu'),p=page('panel');
  // '01 / USE' / '02 / MODIFY' / '03 / ADD' was a four-card grid replaced by a single comparison
  // table in V45.7.5.2 (see tests/v45.7.5.2-comparison-content.test.js). Not checked here anymore.
  for(const w of ['Worth having handy','You can prepare','PG&amp;E may evaluate later','$4,831.86','303 calendar days','Historical planning benchmark, not a project forecast.'])assert.ok(a.includes(w),w);
  for(const w of ['01 / REPLACE','02 / ADD LOAD','03 / UPGRADE','04 / RELOCATE','~40 business days','~34 business days','Before assuming you need a bigger panel','No service method has been selected for your project.'])assert.ok(p.includes(w),w);
  assert.match(a,/<details[^>]*id="adu-cost-detail"/);assert.doesNotMatch(p,/\$2,500|\$3,500/);
  for(const id of ['adu-paths','adu-matters','adu-prepare','insight-photos','insight-documents','insight-ownership','adu-cost','insight-next'])assert.ok(a.includes('id="'+id+'"'),id);
  assert.match(a+p,/not an application, and formal PG&amp;E review determines what applies/);
});
test('sparse content omits empty sections and their links; empty-state sections render intentionally',()=>{
  const m={projectType:'future-scenario',hero:'<header><h1 id="fast-facts-results-heading">X</h1></header>',recommended:'',blocks:[{slot:'prepare',html:'<p>Only prep</p>'},{slot:'unknown-slot',html:'<p>ignored</p>'},{slot:'what-may-change',html:'   '}]};
  const h=c.FastFactsWorkspace.render(m),links=navLinks(h);
  assert.deepEqual(links.map(l=>l.target),['ff-section-prepare','ff-section-next']);
  assert.match(h,/class="ff-section__empty"/);assert.doesNotMatch(h,/ignored/);assert.doesNotMatch(h,/ff-section-what-may-change/);
  assert.equal(c.FastFactsWorkspace.render({blocks:[]}),'','no hero fails closed');
});
test('mixed-scenario content is grouped and labeled within a shared section',()=>{
  const m={projectType:'mixed',hero:'<header></header>',recommended:'',blocks:[{slot:'prepare',scenario:'ADU',html:'<p>adu prep</p>'},{slot:'prepare',scenario:'Panel change',html:'<p>panel prep</p>'},{slot:'scenario-guide',scenario:'ADU',html:'<p>guide</p>'}]};
  const h=c.FastFactsWorkspace.render(m),prep=h.split('id="ff-section-prepare"')[1];
  assert.match(prep,/data-ff-scenario="ADU"[\s\S]*Applies to:<\/span> ADU[\s\S]*adu prep[\s\S]*data-ff-scenario="Panel change"[\s\S]*panel prep/);
  assert.doesNotMatch(h.split('id="ff-section-scenario-guide"')[1].split('</section>')[0],/ff-scenario-group/,'single scenario is not grouped');
});
test('adding a section requires only one configuration change',()=>{
  const c2=ctx();c2.FAST_FACTS_SECTIONS.splice(2,0,{slot:'site-access',anchorId:'ff-section-site-access',navLabel:'Site access',title:'Site access',emptyState:null});
  const h=c2.FastFactsWorkspace.render({projectType:'x',hero:'<header></header>',recommended:'',blocks:[{slot:'site-access',html:'<p>gate</p>'},{slot:'prepare',html:'<p>p</p>'}]});
  assert.deepEqual(navLinks(h).map(l=>l.label),['Site access','Prepare','Next']);assert.deepEqual(sectionIds(h),['ff-section-site-access','ff-section-prepare','ff-section-next']);
});
test('fallback renders a usable page when the workspace module is unavailable',()=>{
  const c3=ctx(false),h=c3.FastInsights.render({projectType:'adu',property:'Not sure',nextQuestion:next.adu});
  assert.match(h,/data-fast-facts-results="true"/);assert.equal((h.match(/data-act="fast-facts-continue"/g)||[]).length,1);assert.doesNotMatch(h,/ff-nav/);
});
test('navigation state is transient: no persistence, answer, or state writes',()=>{
  const ws=fs.readFileSync(path.join(root,'components/fast-facts-workspace.js'),'utf8');
  assert.doesNotMatch(ws,/localStorage|sessionStorage|persistDraft|scheduleDraftSave|\bS\.|history\.(push|replace)State|location\.hash\s*=/);
  assert.doesNotMatch(fs.readFileSync(path.join(root,'core/persistence-reconstruction.js'),'utf8'),/FastFactsWorkspace|ff-section/);
  /* V45.8.0: the mega menu (components/project-navigation.js) is now the sole section nav, including
     for this results sub-phase (core/navigation-model.js's discoverFastFactsDestinations() reads the
     same rendered .ff-section/.insight-section elements). FastFactsWorkspace.render()'s content and
     its own .ff-nav markup are unchanged (still covered above), but events.js no longer mounts its
     own interactive rail controller alongside the mega menu. */
  const ev=fs.readFileSync(path.join(root,'core/events.js'),'utf8');assert.doesNotMatch(ev,/FastFactsWorkspace\.mount\(app\)/);
  assert.match(ws,/prefers-reduced-motion: reduce/);
});
test('responsive and accessibility CSS contract exists',()=>{
  const css=fs.readFileSync(path.join(root,'components.visual-examples.css'),'utf8');
  for(const s of ['.ff-workspace{display:grid;grid-template-columns:minmax(13rem,16rem) minmax(0,1fr)','@media(max-width:900px)','.ff-nav.is-collapsible:not(.is-open) .ff-nav__list{display:none}','.ff-nav__link:focus-visible','.ff-nav__link[aria-current="location"]','@media(forced-colors:active){.ff-nav'])assert.ok(css.includes(s),s);
  const block=css.split('V45.6.9.8 FAST FACTS REFERENCE WORKSPACE')[1].split('V45.6.9.8 INSIGHT FEEDBACK SPACING')[0];
  assert.doesNotMatch(block,/[^-]height:\d/,'no fixed heights');
});
test('build includes the new modules before FastInsights',()=>{
  const b=fs.readFileSync(path.join(root,'build.js'),'utf8');
  const i=b.indexOf("'components/fast-facts-sections.js'"),j=b.indexOf("'components/fast-facts-workspace.js'"),k=b.indexOf("'components/fast-insights.js'");
  assert.ok(i>0&&j>i&&k>j);
});
test('Enter on a focused link, button, or disclosure keeps its native action',()=>{
  const ev=fs.readFileSync(path.join(root,'core/events.js'),'utf8');
  assert.match(ev,/if\(e\.key==='Enter'&&e\.target&&e\.target\.closest&&e\.target\.closest\('a\[href\],button,summary,\[role="button"\],\[role="link"\]'\)\)return;if\(e\.key==='Enter'\)control=pnVisibleAdvanceControl\(\);/);
});
