/* V45.6.7: presentation-only, answer-derived progressive education.
   V45.6.9.8: eligibility resolves the rule by asset ID AND project type, so one asset can be
   governed by different controlling answers in different journeys (ADU/panel service method).
   Existing ProgressiveVisuals remains the only asset trigger authority.
   V45.6.9.9: selection uses the raw rule match, applies stage eligibility, then diagram precedence
   (SLD-012 supersedes SLD-008 only when both are eligible at the current stage). */
var ProgressiveInsights=(function(){'use strict';
var copy={
'ILL-ADU-001':'A detached unit is separate from the main home. Its electrical setup is a separate question.',
'ILL-ADU-002':'An attached unit connects to the main home. That alone does not settle its meter or service setup.',
'SLD-006':'This drawing illustrates a unit within the main home. It does not establish an electrical requirement.',
'SLD-004':'This drawing illustrates sharing an existing meter and service. A qualified professional must confirm what is workable.',
'SLD-003':'This drawing illustrates an attached unit with a second meter. A second meter is not the same as a second service connection.',
'SLD-011':'This drawing compares a possible multi-meter arrangement. The meter layout needs review before it can be selected.',
'SLD-001':'This drawing illustrates a detached unit with a separate service connection. Considering this option does not establish eligibility.',
'ILL-SVC-003':'This image helps distinguish a service connection from a meter. The actual arrangement needs review.',
'SLD-005':'This drawing illustrates a detached unit sharing existing service. It does not confirm available capacity.',
'SLD-007':'This drawing illustrates a same-capacity panel replacement. An electrician should confirm the existing rating and scope.',
'SLD-008':'This drawing illustrates a possible panel-capacity increase, not a required or approved panel size.',
'SLD-012':'This drawing illustrates the 400-amp-or-more residential service you said you are considering. It is not a required, available, or approved service size.',
'SLD-010':'This drawing illustrates a relocated panel. Equipment placement and service routing need review.',
'PHO-GOOD-007':'This photo illustrates the equipment location to discuss before planning a move.',
'DGM-EQ-008-SERVICE-SPAN':'This diagram illustrates overhead service. It does not establish the service method for your project.',
'DGM-SVC-UG-001':'This diagram illustrates underground service. A qualified professional must confirm the actual route and work.',
'DGM-EQ-008':'This diagram illustrates overhead service and a service span. It does not establish the service method or route for your project. Do not approach utility lines.',
'PHO-GOOD-006':'This photo shows the type of overhead-service context that may help a discussion. Do not approach utility lines.',
'DGM-EQ-005':'This illustration helps locate equipment labels without opening an electrical panel.',
'DGM-EQ-004':'This illustration shows a main breaker label. Do not remove the panel cover to find it.',
'PHO-GOOD-004':'This photo illustrates a readable equipment label. Only photograph equipment you can safely access.'
};
var stages={adu:['property','aduType','aduAddressStatus','aduMeterServiceIntent','aduServiceMethod','aduAdjacentService','energy','timing'],panel:['property','panelIntent','panelServiceMethod','panelExistingCapacity','panelCapacityCompare','panelLoads','energy','timing']};
function safe(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function known(v){return v!==null&&v!==undefined&&v!==''&&!/^(?:i[’']m not sure|not sure|not sure yet|i don[’']t know)$/i.test(String(v).trim());}
function fieldsFor(stage){return stage==='panelCapacityCompare'?['panelExistingCapacity','panelProposedCapacity']:[stage];}
function eligible(id,pt,answers,stage,opts){opts=opts||{};var steps=stages[pt];if(!steps)return false;var at=steps.indexOf(stage);if(at<0)return false;var rule=ProgressiveVisuals.rules.filter(function(r){return r.id===id&&r.projectType===pt;})[0];if(!rule)return false;return Object.keys(rule.when).every(function(k){var owner=pt==='panel'&&k==='panelExistingCapacity'&&answers.panelIntent==='Increase the panel capacity'?steps.indexOf('panelCapacityCompare'):steps.findIndex(function(q){return fieldsFor(q).indexOf(k)>=0;});return owner>=0&&owner<=at&&known(answers[k])&&!(opts.skipped||[]).includes(k)&&!(opts.skipped||[]).includes(steps[owner])&&!(opts.invalidatedAnswers||{})[k];});}
function rank(r,stage){var ids=fieldsFor(stage);var fresh=r.reason.some(function(k){return ids.indexOf(k)>=0;});var type=r.id.indexOf('SLD-')===0?3:r.id.indexOf('ILL-')===0?2:1;return (fresh?100:0)+r.reason.length*10+type;}
function select(pt,answers,stage,opts){if(!stages[pt]||stages[pt].indexOf(stage)<0)return [];var src=ProgressiveVisuals.deriveAll?ProgressiveVisuals.deriveAll(pt,answers||{}):ProgressiveVisuals.derive(pt,answers||{});var rows=src.filter(function(r){return eligible(r.id,pt,answers||{},stage,opts);});if(ProgressiveVisuals.applyPrecedence)rows=ProgressiveVisuals.applyPrecedence(rows);rows.sort(function(a,b){return rank(b,stage)-rank(a,stage)||a.id.localeCompare(b.id);});var picked=[],kinds={};rows.forEach(function(r){var kind=r.id.indexOf('SLD-')===0?'diagram':r.id.indexOf('ILL-')===0?'illustration':'context';if(picked.length<2&&!kinds[kind]){picked.push(r);kinds[kind]=true;}});return picked;}
function card(r){var text=copy[r.id];if(!text)return '';return '<figure class="progressive-card progressive-card--insight" data-progressive-id="'+safe(r.id)+'"><img src="'+r.asset.src+'" alt="'+safe(r.asset.alt)+'" loading="lazy"><figcaption><strong>'+safe(r.asset.title)+'</strong><p>'+safe(text)+'</p><p class="visual-example__boundary">Illustrative example only. This is not a reviewed design, eligibility decision, or document requirement. Do not open or touch electrical equipment to take photos.</p></figcaption></figure>';}
var notes={aduAddressStatus:'An address is a separate question from how electricity would be metered or connected. Your city or county can confirm the address status.',aduMeterServiceIntent:'A meter measures electricity use. A service connection is the physical connection to the utility system. The option you are considering still needs review.',aduServiceMethod:'Overhead and underground describe possible service routes, not whether a new connection is available.',aduAdjacentService:'The location of existing equipment can help frame a discussion. It does not determine where new equipment may go.',panelIntent:'The panel change you are considering is a starting point. A qualified electrician can confirm the scope.',panelServiceMethod:'The service route may shape what a qualified professional needs to review. Your answer does not determine the work.',panelExistingCapacity:'The existing main breaker label is a starting point, not a load calculation. Do not remove the panel cover.',panelCapacityCompare:'The proposed rating is an idea to discuss, not a required or approved size.',panelLoads:'The equipment list helps frame a load calculation. It does not show whether a larger panel or service is needed.',energy:'Your energy plans can help identify questions for a qualified professional. They do not determine equipment requirements.'};
/* 2026-10-05: was a plain, always-expanded <section> repeated on every question that had anything
   to illustrate — on mobile that's recurring vertical space spent on the same kind of content every
   time. Now a <details>, open by default the first time it appears; closing it on any one question
   is remembered in insightsOpen (module-level, not per-question-id, unlike QuestionInlineResponse's
   per-answer collapsed{} map above in components/question-inline-response.js) so it starts closed on
   every later question too, instead of reopening each time and costing the same scroll distance
   again. Reopening it is remembered the same way, forward from that question. */
var insightsOpen=null,insightsToggleInstalled=false;
/* 2026-10-06: null = reader hasn't touched it. Default open on desktop, closed at phone width so a selection never grows the page under the reader's thumb. */
function insightsIsOpen(){if(insightsOpen!==null)return insightsOpen;return !(typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(max-width: 760px)').matches);}
var CHEVRON_SVG='<svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
function installInsightsToggle(){if(insightsToggleInstalled||typeof document==='undefined'||!document.addEventListener)return;insightsToggleInstalled=true;document.addEventListener('toggle',function(e){var d=e.target;if(!d||!d.matches||!d.matches('details.progressive-examples--collapsible'))return;insightsOpen=d.open;},true);}
function forQuestion(id,pt,answers,opts){if(!stages[pt]||stages[pt].indexOf(id)<0)return '';opts=opts||{};var rows=select(pt,answers||{},id,opts),keys=fieldsFor(id),answered=keys.some(function(k){return known((answers||{})[k])&&!(opts.skipped||[]).includes(k)&&!(opts.skipped||[]).includes(id)&&!(opts.invalidatedAnswers||{})[k];});var note=answered&&notes[id]?'<p class="progressive-examples__takeaway">'+safe(notes[id])+'</p>':'';if(!rows.length&&!note)return '';installInsightsToggle();return '<details class="progressive-examples progressive-examples--insights progressive-examples--collapsible" aria-label="What your answers help illustrate"'+(insightsIsOpen()?' open':'')+'><summary class="progressive-examples__summary"><h2>What your answers help illustrate</h2><span class="progressive-examples__chevron" aria-hidden="true">'+CHEVRON_SVG+'</span></summary><div class="progressive-examples__content">'+note+(rows.length?'<p>These examples change as you answer or update questions.</p><div class="progressive-examples__grid">'+rows.map(card).join('')+'</div>':'')+'</div></details>';}
function forSummary(pt,answers,opts){var steps=stages[pt];if(!steps)return '';answers=answers||{};var seen={},rows=[];steps.forEach(function(stage){select(pt,answers,stage,opts).forEach(function(r){if(!seen[r.id]){seen[r.id]=true;rows.push(r);}});});rows=rows.filter(function(r){return eligible(r.id,pt,answers,steps[steps.length-1],opts);}).slice(-4);return rows.length?'<section class="cardbox progressive-examples progressive-examples--insights" aria-labelledby="s-illustrations-h"><h2 id="s-illustrations-h">Illustrations based on your answers</h2><p>These show possibilities to discuss, not a reviewed electrical design.</p><div class="progressive-examples__grid">'+rows.map(card).join('')+'</div></section>':'';}
return {select:select,forQuestion:forQuestion,forSummary:forSummary,copy:copy,stages:stages};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=ProgressiveInsights;
