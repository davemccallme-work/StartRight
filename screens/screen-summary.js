/* ============================ STEP 4 — recommended next action + preparation guide ============================
   V44.38: #8 cost/timeline uncertainty; #9 static orientation map.
   V44.39 Sprint 3 U1: costTimelineUncertaintyHtml() is now a GRAPHICAL uncertainty engine
   (segmented range band + iconic escalation-driver chips + plain-language information-quality
   band + visible largest-unknowns). It remains an explainer, NOT an estimator:
     - Segment widths live in CSS classes (no numeric percentages in this module).
     - Dollars appear ONLY inside the costForType(...) facility branch, with SB 1210 attribution
       and not-a-quote framing (COST_DISCLAIMER). No facility record => no dollar figure.
     - Information quality uses plain-language bands (High / Some / More known) — never a percentage
       or statistical confidence.
   All build-checked strings (living preparation plan, preparation-guide__story, context:'summary',
   createPreparationContext(S), shared-context groups) are preserved.
   =================================================================================== */
/* Single source of truth for this screen's real section anchors — also consumed by
   core/navigation-model.js for the "Your guidance" topic's Level 2 mega-menu destinations.
   Keep this in sync with the actual id="..." anchors rendered in step4() below. */
var GUIDANCE_SECTION_ITEMS=[
  ["preparation-guide-heading","Guide"],
  ["s-whatnext-h","Next"],
  ["cost-uncertainty-h","Cost & timing"],
  ["living-guide-heading","Plan"],
  ["where-fits-h","Navigator fit"],
  ["preparation-end-h","Finish"]
];
function preparationGuideNavHtml(){
  var items=GUIDANCE_SECTION_ITEMS;
  return '<nav class="summary-section-nav" aria-label="Preparation guide sections">'
    +'<div class="summary-section-nav__controls">'
      +'<div class="summary-section-nav__track">'+items.map(function(x,i){return '<button type="button" class="summary-section-nav__button'+(i===0?' is-active':'')+'" data-act="summary-section-jump" data-section-id="'+x[0]+'"'+(i===0?' aria-current="location"':'')+'>'+esc(x[1])+'</button>';}).join('')+'</div>'
    +'</div><span class="summary-section-nav__status sr" aria-live="polite">Guide section navigation</span>'
    +'</nav><div class="summary-section-nav-spacer" aria-hidden="true"></div>';
}
function summaryDisclosure(key,title,preview,content){return '<details class="summary-progressive" data-summary-disclosure="'+esc(key)+'"><summary><span class="summary-progressive__title">'+esc(title)+'</span><span class="summary-progressive__preview">'+esc(preview)+'</span><span class="summary-progressive__action" aria-hidden="true">Show details</span></summary><div class="summary-progressive__body">'+content+'</div></details>';}
function livingPlanningGuideHtml(){
  if(typeof createPreparationContext!=="function")throw new Error("Shared preparation context is unavailable");
  var c=createPreparationContext(S);
  function section(title,items,empty){
    return '<section class="living-guide__section"><h3>'+esc(title)+'</h3>'+
      (items.length?'<ul class="living-guide__list">'+items.map(function(x){
        return '<li><strong>'+esc(x.title)+'</strong>'+
          (x.needsConfirmation?'<span class="pill">Needs confirmation</span>':'')+
          '<span class="living-guide__who">Who may help: '+esc(x.who)+'</span>'+
          (x.note?'<blockquote><span>Your planning note (customer-authored)</span>'+esc(x.note)+'</blockquote>':'')+
          '</li>';
      }).join('')+'</ul>':'<p class="muted">'+esc(empty)+'</p>')+'</section>';
  }
  var examples=[];
  if(c.projectType==="adu")Object.keys(ADU_DOCUMENT_EXAMPLES).forEach(function(k){examples.push(k+' - illustrative examples available in Project Navigator.');});
  if(c.projectType==="panel")examples.push('Service photos - illustrative examples available in Project Navigator.');
  var next=c.recommendedNextAction||{};
  var nextHtml=next.action?'<section class="living-guide__section living-guide__section--next"><h3>Recommended next action</h3><p class="living-guide__next-action"><strong>'+esc(next.action)+'</strong></p>'+
    (next.who?'<div class="living-guide__next-detail"><h4>Who may help</h4><p>'+esc(next.who)+'</p></div>':'')+
    (next.after?'<div class="living-guide__next-detail"><h4>Afterward</h4><p>'+esc(next.after)+'</p></div>':'')+'</section>':'';
  var groups=section('Questions to ask next',c.questionsToAskNext||[],'No topics are currently labeled Ask next.')+section('Your planning notes',c.planningNotes||[],'No non-empty planning notes are grouped here yet.')+section('Topics you may revisit',c.topicsToRevisit||[],'No topics are currently labeled May revisit.');
  var exampleBody='<section class="living-guide__section"><h3>Examples available in Project Navigator</h3>'+(examples.length?'<ul>'+examples.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>':'<p class="muted">No scenario-specific examples are available for this route.</p>')+'<p class="muted small">Examples are illustrative. Nothing has been uploaded, reviewed, submitted, approved, or stored.</p></section>';
  var simulatedCheckBody=typeof SimulatedDocumentCheck!=="undefined"?SimulatedDocumentCheck.render():'';
  return '<section class="living-guide" aria-labelledby="living-guide-heading"><div class="guidance-card__state-header"><span class="guidance-card__state-icon" aria-hidden="true">'+icon("file-text")+'</span><h2 id="living-guide-heading">Your living preparation plan</h2></div><p>Organized from your answers, customer-authored notes, and Project Navigator guidance. A planning note does not confirm a requirement or technical outcome.</p><div class="living-guide__priority">'+nextHtml+'</div>'+summaryDisclosure('planning-groups','Questions and planning notes','Review organized questions, notes, and topics to revisit','<div class="living-guide__grid">'+groups+'</div>')+summaryDisclosure('examples','Optional examples','View synthetic examples available for this project type',exampleBody)+(simulatedCheckBody?summaryDisclosure('simulated-check','Try a simulated document check','See an illustrative example of how a document check might look',simulatedCheckBody):'')+'</section>';
}
/* U1: iconic escalation-driver chip (reuses existing icon keys; no icons.js change). */
function costEscalationChip(iconKey,label){
  return '<li class="cost-driver-chip"><span class="cost-driver-chip__icon" aria-hidden="true">'+icon(iconKey)+'</span><span class="cost-driver-chip__label">'+esc(label)+'</span></li>';
}
/* U1: plain-language information-quality band derived from how much is known (NO percentages). */
function costUncertaintyBand(knownCount){
  var level,cls,why;
  if(knownCount<=2){level="High uncertainty";cls="high";why="Only a few details are known so far, so the range stays wide.";}
  else if(knownCount<=4){level="Some uncertainty";cls="some";why="Some details are known; confirming the open items would narrow the range.";}
  else{level="More information known";cls="known";why="Several details are known, which helps frame a tighter conversation \u2014 confirmation still applies.";}
  return '<div class="cost-quality cost-quality--'+cls+'"><span class="cost-quality__label">'+esc(level)+'</span><span class="cost-quality__why">'+esc(why)+'</span></div>';
}
/* U1: the cost/timing UNCERTAINTY visual. Dollars only when a facility record exists. */

function timingOwnerExperienceHtml(context){
  return '<section class="summary-document-section summary-document-section--involvement timing-owner-experience" aria-labelledby="timing-owner-heading">'
    +'<div class="eyebrow">Who may be involved</div><h2 id="timing-owner-heading">Who can influence what happens next</h2>'
    +'<p class="muted">Different parts of the project may involve different people or organizations. These are areas of involvement, not assigned tasks or tracked status.</p>'
    +'<div class="timing-owner-grid">'
    +'<article><h3>You or your contractor</h3><ul><li>Project decisions and load information</li><li>Contractor preparation and required site work</li><li>Responses to information requests</li></ul></article>'
    +'<article><h3>PG&amp;E</h3><ul><li>Application review</li><li>Capacity evaluation when applicable</li><li>Design or construction coordination when needed</li></ul></article>'
    +'<article><h3>Your city or county</h3><ul><li>Permits</li><li>Inspections</li><li>Required releases</li></ul></article>'
    +'</div></section>';
}
function costTimelineAnswerHtml(context){
  var c=context||createPreparationContext(S),benchmarks=c.timingBenchmarks||[],facility=(typeof costForType==="function")?costForType(S.projectType):null;
  var timing=benchmarks.length?benchmarks.map(function(b){var v=b.values?(esc(b.values.pgeControlled)+' PG&amp;E-controlled business days<br><strong>'+esc(b.values.endToEnd)+' end-to-end business days</strong>'):(esc(b.value)+' '+esc(b.unit));return '<div class="customer-answer__value">'+v+'</div><p>Historical planning reference for the current scenario.</p><small>'+esc(b.disclosure||'Historical planning reference, not a project schedule or commitment.')+'</small>';}).join(''):'<div class="customer-answer__value">No numerical timeline is available yet</div><p>The current answers do not meet a governed benchmark scenario.</p>';
  var cost=facility?'<div class="customer-answer__value">'+esc((typeof fmtUSD==="function")?fmtUSD(facility.avg_cost_usd):("$"+facility.avg_cost_usd))+'</div><p>'+esc(facility.label)+' regulated public average.</p><small>'+esc(typeof COST_DISCLAIMER!=="undefined"?COST_DISCLAIMER:'Planning reference only. Not a quote, project estimate, or commitment.')+'</small>':'<div class="customer-answer__value">A project-specific cost is not available yet</div><p>Service capacity, meter configuration, construction conditions, relocation, trenching, transformer work, and later review findings can affect cost.</p><small>Planning guidance only. No quote or project estimate is shown.</small>';
  return '<section class="summary-document-section cost-timeline-answer" aria-labelledby="cost-timeline-answer-h"><div class="eyebrow">Cost and timeline</div><h2 id="cost-timeline-answer-h" class="sr">Cost and timeline details</h2><div class="customer-answer-grid"><article class="customer-answer customer-answer--time"><span>How long?</span>'+timing+'</article><article class="customer-answer customer-answer--cost"><span>How much?</span>'+cost+'</article></div><h3 class="customer-answer__drivers-heading">What could change cost or timeline?</h3></section>';
}
/* 2026-10-06: relocated from costTimelineAnswerHtml() into the "May be needed" card per request —
   these three terms (load calculation, service upgrade, panel capacity) read more naturally as
   context for what might still be required than as a header on the cost/timeline figures. */
function summaryHelpfulDefinitionsHtml(){
  return '<details class="context-definitions context-definitions--summary"><summary><span>Helpful definitions</span><small>3 terms</small></summary><div class="context-definitions__terms">'+(typeof QuestionHelp!=="undefined"?QuestionHelp.compactTerm("Load calculation"):'')+term("Service upgrade")+(typeof QuestionHelp!=="undefined"?QuestionHelp.compactTerm("Panel capacity"):'')+'</div><button class="linkbtn context-definitions__all" type="button" data-act="open-glossary">View all definitions</button></details>';
}
function costTimelineUncertaintyHtml(){
  var facility=(typeof costForType==="function")?costForType(S.projectType):null;
  var I=(typeof interpret==="function")?interpret():{known:[]};
  var knownCount=(I.known||[]).length;
  /* Segmented range band. Segment widths are set by CSS classes (no numeric value here). */
  var band='<div class="cost-band" role="img" aria-label="Relative cost range shown as three broad bands: best case, most common, and higher-cost cases. This is not a quote.">'
    +'<span class="cost-band__seg cost-band__seg--best"><span class="cost-band__tier">Best case</span></span>'
    +'<span class="cost-band__seg cost-band__seg--common"><span class="cost-band__tier">Most common</span></span>'
    +'<span class="cost-band__seg cost-band__seg--higher"><span class="cost-band__tier">Higher-cost</span></span>'
    +'</div>'
    +'<ul class="cost-band__legend"><li><strong>Best case:</strong> fewer service changes.</li><li><strong>Most common:</strong> standard review and construction needs.</li><li><strong>Higher-cost:</strong> significant service or construction work.</li></ul>';
  /* Dollars are gated to the facility branch and carry SB 1210 attribution + not-a-quote framing. */
  var costBlock,positioning;
  if(facility){
    costBlock='<div class="note cost-band__avg"><span><strong>'+esc(facility.label)+' \u2014 regulated average:</strong> '+esc((typeof fmtUSD==="function")?fmtUSD(facility.avg_cost_usd):("$"+facility.avg_cost_usd))+'. '+esc(typeof COST_DISCLAIMER!=="undefined"?COST_DISCLAIMER:"Regulated public average under California SB 1210 \u2014 not a quote, estimate, or commitment.")+'</span></div>';
    positioning='<p class="muted small">The band above is relative, not to scale \u2014 the figure is a regulated public average for a matching facility type.</p>';
  }else{
    costBlock='';
    positioning='<p class="muted small">No regulated public average applies to this project type, so no dollar figure is shown. The factors below are common reasons similar projects cost more or take longer.</p>';
  }
  /* Iconic escalation drivers: canonical DELAY_FACTORS + common higher-cost drivers (illustrative). */
  var driverIcon={address_assignment:"map-pin",permit_sequencing:"clock",service_upgrades:"gauge"};
  var canonical=(typeof DELAY_FACTORS!=="undefined"&&DELAY_FACTORS.length)?DELAY_FACTORS.map(function(d){return costEscalationChip(driverIcon[d.id]||"triangle-alert",d.label);}).join(""):"";
  var common=[costEscalationChip("gauge","Transformer work"),costEscalationChip("map-pin","Service relocation"),costEscalationChip("wrench","Underground construction or trenching"),costEscalationChip("glyph-meter","New meter work"),costEscalationChip("triangle-alert","Scope changes after applying")].join("");
  var drivers='<div class="cost-drivers"><h3>What can push cost or timing higher</h3><ul class="cost-driver-list">'+canonical+common+'</ul><p class="muted small">Common planning factors, not determinations that apply to your project.</p></div>';
  var unknowns='<div class="cost-unknowns"><h3>Biggest unknowns right now</h3><ul class="disc"><li>Whether the existing service can carry the new load</li><li>The final service or meter configuration</li><li>Whether construction conditions require additional work</li></ul></div>';
  return '<section class="cardbox cost-uncertainty" aria-labelledby="cost-uncertainty-h">'
    +'<div class="eyebrow">What can affect cost and timing</div>'
    +'<h2 id="cost-uncertainty-h">Why similar projects can vary</h2>'
    +'<p class="muted">These are common planning factors and uncertainty drivers \u2014 not a quote, schedule, approval signal, or commitment for your project.</p>'
    +band+costBlock+positioning
    +'<div class="cost-uncertainty__quality"><h3>How much is known so far</h3>'+costUncertaintyBand(knownCount)+'</div>'
    +drivers+unknowns
    +'<div class="note"><span><strong>Recommended next action:</strong> Confirm the service details that could most affect cost and timing before applying.</span></div>'
    +'</section>';
}
/* #9: static orientation map. No highlight, no numbers, no aria-current, no progress metaphor. */
function whereNavigatorFitsHtml(){
  return '<section class="cardbox where-navigator-fits" aria-labelledby="where-fits-h">'
    +'<div class="eyebrow">Where Project Navigator fits</div>'
    +'<h2 id="where-fits-h">Where Project Navigator fits</h2>'
    +'<div class="grid two where-fits__cols">'
    +'<div class="where-fits__side"><h3>In Project Navigator</h3><ul class="disc"><li>Explore your project</li><li>Identify questions</li><li>Prepare information</li></ul></div>'
    +'<div class="where-fits__side"><h3>Outside Project Navigator</h3><ul class="disc"><li>Apply</li><li>Formal review</li><li>Construction or energization</li></ul></div>'
    +'</div>'
    +'<div class="note"><span><strong>Formal application and utility review happen outside Project Navigator.</strong></span></div>'
    +'</section>';
}
function decisionImpactHtml(){
  if(S.projectType!=="panel"||typeof panelDocumentGroups!=="function")return '';
  var g=panelDocumentGroups(),a=S.answers,matched=(g&&g.matched)?g.matched:[];
  if(!matched.length)return '';
  var told=[];
  if(a.panelExistingCapacity&&!notSure(a.panelExistingCapacity))told.push("Existing main breaker: "+a.panelExistingCapacity);
  if(a.panelIntent==="Increase the panel capacity"&&a.panelProposedCapacity&&!notSure(a.panelProposedCapacity))told.push("Capacity being considered: "+a.panelProposedCapacity);
  if(Array.isArray(a.panelLoads)&&a.panelLoads.length&&a.panelLoads.indexOf("I\u2019m not sure")<0&&a.panelLoads.indexOf("No added equipment")<0)told.push("Equipment noted: "+a.panelLoads.join(", "));
  var toldText=told.length?told.join(" \u00b7 "):"the panel details you entered";
  var who=(typeof DOC_WHO_LABEL!=="undefined")?DOC_WHO_LABEL:{};
  var cards=matched.map(function(d){
    return '<article class="decision-impact"><h3 class="decision-impact__doc">'+esc(d.doc)+'</h3><dl class="decision-impact__grid">'
      +'<div><dt>You told us</dt><dd>'+esc(toldText)+'</dd></div>'
      +'<div><dt>May be needed</dt><dd>'+esc(d.doc)+'</dd></div>'
      +'<div><dt>Why</dt><dd>'+esc(d.why||("Conditional based on your answers ("+d.trigger+")."))+' <span class="muted">Condition: '+esc(d.trigger)+'.</span></dd></div>'
      +'<div><dt>Needs confirmation</dt><dd>Whether your final design meets this condition. Not confirmed; may change after review.</dd></div>'
      +'<div><dt>Who can help</dt><dd>'+esc(who[d.who]||"A licensed electrician, and PG&E through formal review")+'</dd></div></dl></article>';
  }).join("");
  return '<section class="cardbox decision-impact-panel" aria-labelledby="decision-impact-h"><div class="guidance-card__state-header"><span class="guidance-card__state-icon" aria-hidden="true">'+icon("file-text")+'</span><h2 class="subhead" id="decision-impact-h">How your answers may shape what to prepare</h2></div><p class="muted">These are conditional interpretations based on what you entered \u2014 not requirements, determinations, or approvals. A licensed electrician and PG&E confirm what actually applies.</p>'+cards+'</section>';
}
function step4(){
  var I=interpret(),c=createPreparationContext(S);
  var projTitle=(PROJECT_TYPES.filter(function(p){return p.id===S.projectType;})[0]||{}).title
    || I.projectLabel || "Your project";
  var known=(I.known.length?I.known:["No details provided yet"]).map(function(v){return '<li>'+esc(v)+'</li>';}).join("");
  var confirm=(I.consistency||[]).map(function(f){var qid=(f.questionIds&&f.questionIds.length)?f.questionIds[0]:'';var editable=qid&&activeQuestions().some(function(q){return q.id===qid;});return '<li class="needs-confirm-item"><strong>'+esc(f.title)+'</strong> <span class="muted">\u2014 '+esc(f.detail)+' Ask '+esc(f.who)+'.</span>'+(editable?' <button class="linkbtn linkbtn--sm" data-act="edit-question" data-question-id="'+esc(qid)+'">Review this answer</button>':'')+'</li>';}).join("")
    +I.confirm.map(function(l){var m=confirmMeta(l);return '<li class="needs-confirm-item"><strong>'+esc(l)+'</strong> <span class="muted">\u2014 ask '+esc(m.who)+'</span></li>';}).join("")
    +(I.deferred||[]).map(function(label){var q=activeQuestions().filter(function(x){return x.label===label;})[0];var qid=q?q.id:'';return '<li class="needs-confirm-item needs-confirm-item--skipped"><strong>'+esc(label)+'</strong> <span class="muted">\u2014 skipped for now; not yet answered. You can revisit this anytime.</span>'+(qid?' <button class="linkbtn linkbtn--sm" data-act="edit-question" data-question-id="'+esc(qid)+'">Review this answer</button>':'')+'</li>';}).join("");
  if(!confirm)confirm='<li>None remaining</li>';
  var may=(I.mayNeed&&I.mayNeed.length?I.mayNeed:[]).map(function(v){return '<li>'+esc(v)+'</li>';}).join("");
  var summaryDocs='';
  if(S.projectType==="panel"){
    var req=docReqFor("panel"),g=panelDocumentGroups();
    function dl(a){return a.map(function(d){return '<li><strong>'+esc(d.doc)+'</strong> <span class="muted">\u2014 '+esc(d.trigger)+'</span></li>';}).join("");}
    if(req)summaryDocs='<h3>Documents to discuss</h3><h4>Usually needed</h4><ul class="disc">'+dl(g.usually)+'</ul>'
      +(g.matched.length?'<h4>May be relevant based on your answers</h4><ul class="disc">'+dl(g.matched)+'</ul>':'')
      +(g.unknown.length?'<h4>Applicability not yet known</h4><ul class="disc">'+dl(g.unknown)+'</ul>':'')
      +(g.other.length?'<details class="summary-docs-conditional"><summary>Other conditional documents</summary><ul class="disc">'+dl(g.other)+'</ul></details>':'');
  }
  var timing=(I.timeline.length?I.timeline:["No timing factors identified yet"]).map(function(v){return '<li>'+esc(v)+'</li>';}).join("");
  var qs=I.questions.map(function(v){return '<li>'+esc(v)+'</li>';}).join("");
  var next=I.next.map(function(v,i){return '<li><span class="n">'+(i+1)+'</span>'+esc(v)+'</li>';}).join("");
  function card(stateKey,suffix,headingId,fallbackHeading,bodyHtml,primary){
    if(!bodyHtml)return '';
    return guidanceCard(stateKey,headingId,bodyHtml,{primary:!!primary,context:'summary'});
  }
  var visibleRecommendation=(I.recommendation&&String(I.recommendation).trim())?I.recommendation:((I.next&&I.next.length)?I.next[0]:'Review the remaining questions in your preparation guide.');
  var visibleOwner=(I.owner&&String(I.owner).trim())?I.owner:'You or the person helping plan the project';
  var visibleWhy=(I.why&&String(I.why).trim())?I.why:'This helps clarify the next useful preparation step.';
  var visibleAfter=(I.after&&String(I.after).trim())?I.after:'Update the related project answer and review the refreshed guidance.';
  var recommendedNextActionCard='<div class="pinned-recommendation"><span class="pinned-recommendation__label">Recommended next action</span>'+card("nextAction","next-action","s-next-h","Recommended next action",
        '<p class="lede">'+esc(visibleRecommendation)+'</p>'
        +'<dl class="leaddl"><div><dt>Who takes this step</dt><dd>'+esc(visibleOwner)+'</dd></div>'
        +'<div><dt>Why it matters</dt><dd>'+esc(visibleWhy)+'</dd></div>'
        +'<div><dt>After you do this</dt><dd>'+esc(visibleAfter)+'</dd></div></dl>'
        +(qs?'<details class="recommendation-details"><summary>See what to ask</summary><div><ul class="disc">'+qs+'</ul></div></details>':''), true)+'</div>';
  var locLine=(S.answers&&S.answers.projectLocation&&S.answers.projectLocation.trim())?'<p class="muted small">Project location (as you entered it): '+esc(S.answers.projectLocation)+'</p>':'';
  var story=''
    +recommendedNextActionCard
    +'<section class="story-block story-block--yourProject"><div class="guidance-card__state-header">'
      +'<span class="guidance-card__state-icon" aria-hidden="true">'+icon("glyph-home")+'</span>'
      +'<h2 class="subhead" id="s-project-h">Your project</h2></div>'
      +'<p>'+esc(projTitle)+'</p></section>'
    +card("known","known","s-known-h","You told us",'<ul class="disc">'+known+'</ul>',false)
    +(function(){
      /* 2026-10-03 (P0.1, 10.1.26 feedback): persist the governed JADU metering rule into the
         preparation guide's "Our interpretation" card, since this is the section the Scenario Guide
         clones from (components/guidance-workspace.js discover() reads .preparation-guide__story). */
      var jaduItem='';
      if(S.projectType==="adu"&&typeof V457CorrectnessEngine!=="undefined"){
        var jaduGuidance=V457CorrectnessEngine.jadu(S.answers);
        if(jaduGuidance.status==="confirmed-guidance")jaduItem='<li>'+esc(jaduGuidance.meteringText+" "+jaduGuidance.serviceText)+'</li>';
      }
      if(!I.projectLabel&&!jaduItem)return '';
      return card("interpretation","interpretation","s-interp-h","Our interpretation",
        '<ul class="disc">'+(I.projectLabel?'<li>'+esc(I.projectLabel)+' <span class="muted">(based on your description; not yet confirmed)</span></li>':'')+jaduItem+'</ul>',false);
    })()
    +card("confirmation","confirmation","s-confirm-h","Needs confirmation",'<ul class="disc list-plain">'+confirm+'</ul>',false)
    +card("possible","possible","s-may-h","May be needed", summaryHelpfulDefinitionsHtml()+((may||summaryDocs)?('<ul class="disc">'+may+'</ul>'+summaryDocs):''), false)
    +card("utility","utility","s-utility-h","PG&E involvement",
        '<ul class="disc"><li>New service, added capacity, gas changes, or interconnection \u2014 to be confirmed with PG&E.</li></ul>',false);
  var left='<div><div class="eyebrow">Your project summary</div>'+preparationGuideNavHtml()
    +'<section class="cardbox preparation-guide" aria-labelledby="preparation-guide-heading"><div class="cardhead preparation-guide__head"><div class="guide-subject"><span class="eyebrow">Your guidance</span><h1 id="preparation-guide-heading">Your project preparation guide</h1><p class="guide-subject__project">'+esc(projTitle)+'</p><p class="muted">Based on your current answers. Copy or download this guide for a conversation with a contractor, your city or county, or PG&amp;E.</p></div>'
      +'<div class="cardbtns"><button class="btn primary" data-act="download">'+icon("download",17)+'Download</button><button class="btn ghost" data-act="copy">Copy</button></div></div>'
      +'<div class="preparation-guide__story story-stack">'+story+'</div>'
      +'<div class="summary-boundary-note"><span><strong>Boundary:</strong> Notes you entered are customer-authored and not verified by PG&E, and are not automatically transferred into an application. Copy and Download stay on this device.</span></div></section>'
    +'<section class="cardbox"><div class="guidance-card__state-header"><span class="guidance-card__state-icon" aria-hidden="true">'+icon("state-next-action")+'</span><h2 class="subhead" id="s-whatnext-h">What happens next?</h2></div><p class="muted">One likely preparation path \u2014 not a guaranteed or tracked sequence.</p><ol class="steps">'+next+'</ol></section>'
    +costTimelineAnswerHtml(c)
    +costTimelineUncertaintyHtml()
    +timingOwnerExperienceHtml(c)
    +panelCostTiersHtml(S.projectType)
    +(typeof ExplainableInsightCard!=='undefined'?ExplainableInsightCard.renderSummary(S.projectType,S.answers,{skipped:S.skipped,invalidatedAnswers:S.invalidatedAnswers}):'')+(typeof ProgressiveInsights!=='undefined'?ProgressiveInsights.forSummary(S.projectType,S.answers,{skipped:S.skipped,invalidatedAnswers:S.invalidatedAnswers}):'')
    +livingPlanningGuideHtml(I)
    +decisionImpactHtml()
    +whereNavigatorFitsHtml()
    +'<section class="cardbox boundary" aria-labelledby="s-beforeyouapply-h"><div class="eyebrow">Before you apply</div><h2 id="s-beforeyouapply-h">Finish your recommended next action first</h2>'
      +'<p>Project Navigator helps you prepare. It does not start an application, submit your information, approve your project, determine requirements, or establish a cost or schedule.</p>'
      +'<div class="note"><span><strong>Keep your guide:</strong> Not automatically transferred into a future PG&E application.</span></div></section>'
    +'<section class="cardbox" role="note" aria-labelledby="preparation-end-h"><div class="eyebrow">Preparation guide</div>'
      +'<h2 id="preparation-end-h">You have reached the end of your preparation guide.</h2>'
      +'<p>When you\u2019re done, return to the survey or your facilitator instructions. You can also move back through the topics above to review or change any answer \u2014 nothing here is final.</p></section>'
    +'<div class="summary-reset-action"><button type="button" class="btn secondary" data-act="open-workspace-reset">Clear my answers</button></div>'
    +'<div class="summary-document-footer summary-pane-actions"><div class="navrow"><button class="btn ghost" data-act="back">'+icon("arrow-left",16)+'Back</button></div></div>'
    +'<div class="summary-document-footer summary-exploration-footer">'+anxiety()+'</div></div>';
  return '<section class="grid two">'+left+rail(I)+'</section>';
}

;
