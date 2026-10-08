var panelPhotoExamplesOpen=false;
var aduDocumentExampleOpen="";
/* ============================ STEP 2 — six preparation states (NO scoring) ============================
   V44.38: #5 semantic labels, #2 accordions. V44.39 Sprint 1: Q2 CTA relabel.
   V44.39 Sprint 2:
     - U2-Phase-A: step-2 secondary cards adopt the calm "Your next action" grammar via the
       scoped stylesheet (soft header tint + neutral body + thin accent). No markup change needed;
       the CSS keys off `.secondary-guidance .guidance-card--*` and the state-header structure.
     - U2-Phase-B: Needs-confirmation rows become per-row progressive disclosures (compact summary:
       chip + label + who; body: what/why + planning controls + note + coach). First item open;
       beyond three items collapse under "Show N more to confirm". Reduces density while keeping the
       dominant next action and the first confirmation visible (per ruling). All hooks preserved:
       data-confirm-label, data-planning-note="confirm", planning-disposition, data-act="pnav-seed".
     - G1-Phase-2: linkGlossaryTerms() applied to selected BODY copy (recommended-action "why" and
       document-card descriptions), first occurrence per block. Headings are left unlinked.
   =================================================================================== */
function stHeading(key, fallback){
  return (typeof GUIDANCE_STATES !== "undefined" && GUIDANCE_STATES[key]) ? GUIDANCE_STATES[key].heading : fallback;
}
function stIcon(key, fallback){
  return (typeof GUIDANCE_STATES !== "undefined" && GUIDANCE_STATES[key]) ? GUIDANCE_STATES[key].icon : fallback;
}
/* Safe wrapper: use the auto-linker when present, else fall back to esc(). */
function glossaryBody(text){ return (typeof linkGlossaryTerms==="function")?linkGlossaryTerms(text):esc(String(text==null?'':text)); }
var GUIDANCE_STATE_KEY={known:"known",needsconfirm:"confirmation",mayneed:"possible",timing:"delay",interpretation:"interpretation"};
function prepCard(cls,iconKey,headingId,title,defn,body){
  if(cls==="ask") {
    return '<section class="cardbox question-card" aria-labelledby="'+esc(headingId)+'">'
      +'<div class="guidance-card__state-header"><span class="guidance-card__state-icon" aria-hidden="true">'+icon(iconKey)+'</span>'
      +'<h2 class="subhead" id="'+esc(headingId)+'">'+esc(title)+'</h2></div>'
      +'<p class="state-def">'+defn+'</p>'+body+'</section>';
  }
  var stateName=GUIDANCE_STATE_KEY[cls]||cls;
  return guidanceCard(stateName,headingId,'<p class="state-def">'+defn+'</p>'+body);
}
/* Single source of truth for this screen's real section anchors — also consumed by
   core/navigation-model.js for the "Review & confirm" topic's Level 2 mega-menu destinations.
   Keep this in sync with the actual id="..." anchors rendered in step2() below. */
var UNDERSTANDING_SECTION_ITEMS=[
  ["recommended-action","Next action"],
  ["u-known-h","You told us"],
  ["u-confirm-h","Needs confirmation"],
  ["u-may-h","May be needed"],
  ["u-timing-h","Timing"],
  ["u-ask-h","Questions"]
];
function understandingNavMarkup(){
  var items=UNDERSTANDING_SECTION_ITEMS;
  return '<nav class="understanding-nav" aria-label="On this page"><div class="understanding-nav__head"><strong>On this page</strong><span>Jump to a section</span></div><ul class="understanding-nav__list">'
    +items.map(function(x,i){return '<li><button class="understanding-nav__button" type="button" data-act="jump-understanding-section" data-section-id="'+x[0]+'"'+(i===0?' aria-current="location"':'')+'><span class="understanding-nav__number" aria-hidden="true">'+(i+1)+'</span><span>'+x[1]+'</span></button></li>';}).join('')
    +'</ul></nav>';
}
function step2(){
  var I=interpret();
  var known=I.known.length?'<div class="known-tile-grid">'+I.known.map(function(x){return '<div class="known-tile">'+evidenceBadge("customer")+'<span class="known-tile__value">'+esc(x)+'</span></div>';}).join("")+'</div>':'<p class="muted">Nothing has been confirmed from your answers yet.</p>';
  /* U2-Phase-B: each confirmation is a compact, keyboard-operable disclosure. First one open.
     2026-10-05: dropped the per-row stateChip("Needs confirmation") pill \u2014 components.visual-
     examples.css's .confirm-row__head::after already renders that exact same "Needs confirmation"
     badge on every row (and on the section's own heading), so the two together said it twice in the
     same line for no reason. "Why it matters" moved from an always-expanded paragraph into the same
     inline (i) term-button/term-definition reveal already used everywhere else in the app for
     optional context (state.js's term(), screens/screen-start.js's helpful-definition cards) \u2014
     reusing it here instead of a third disclosure pattern needs no new JS: core/events.js's
     GlossaryController is already mounted on #app and toggles any .term-button by its aria-controls
     id, this or not. */
  function confirmRow(l,primary){var m=confirmMeta(l),rec=planningRecord("confirm",l);
    var whyId='confirm-why-'+String(l).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    return '<details class="confirm-row confirmation-planning-row"'+(primary?' open':'')+' data-confirm-label="'+esc(l)+'">'
      +'<summary class="confirm-row__summary">'
        +'<span class="confirm-row__head">'+(primary?'<span class="tag">Start here</span> ':'')+'<span class="confirm-row__label">'+esc(l)+'</span></span>'
        +'<span class="confirm-row__who">Who can confirm: '+esc(m.who)+'</span>'
      +'</summary>'
      +'<div class="confirm-row__body">'
        +'<div class="cc confirm-row__def">'+evidenceBadge(confirmProvenance(l))+' '+term(l)+'</div>'
        +'<div class="cc confirm-row__ask"><b>What to ask:</b> \u201c'+esc(m.ask)+'\u201d <button class="term-button" type="button" data-definition-action="project-context" data-term-label="'+esc(l)+'" aria-expanded="false" aria-controls="'+whyId+'" aria-label="Show why '+esc(l)+' matters for this project"><span class="term-button__cue" aria-hidden="true">i</span></button></div>'
        +'<div id="'+whyId+'" class="term-definition confirm-row__why" role="note" hidden><strong>Why it matters:</strong> '+glossaryBody(m.why)+'</div>'
        +'<div class="planning-controls" role="group" aria-label="How you want to organize '+esc(l)+'"><button class="planning-control '+(rec.disposition==="ask-next"?'is-active':'')+'" data-act="planning-disposition" data-kind="confirm" data-record-id="'+esc(l)+'" data-disposition="ask-next">Ask next</button><button class="planning-control '+(rec.disposition==="noted"?'is-active':'')+'" data-act="planning-disposition" data-kind="confirm" data-record-id="'+esc(l)+'" data-disposition="noted">I have a note</button><button class="planning-control '+(rec.disposition==="revisit"?'is-active':'')+'" data-act="planning-disposition" data-kind="confirm" data-record-id="'+esc(l)+'" data-disposition="revisit">May revisit</button></div>'
        +'<label class="planning-note"><span>Your planning note <small>Customer-authored and saved on this device</small></span><textarea data-planning-note="confirm" data-record-id="'+esc(l)+'" placeholder="Record what you learned or want to ask...">'+esc(rec.note)+'</textarea></label>'
        +'<div class="rowact"><button class="btn secondary sm" data-act="pnav-seed" data-question="'+esc('Help me prepare this question for my '+((PROJECT_TYPES.filter(function(p){return p.id===S.projectType;})[0]||{}).title||"project")+' project: \u201c'+l+'\u201d. Who can confirm this: '+m.who+'. The question to ask: \u201c'+m.ask+'\u201d')+'">'+icon("message-circle",15)+'Prepare this conversation</button></div>'
      +'</div></details>';}
  var confirmList;
  if(I.confirm.length){
    var firstThree=I.confirm.slice(0,3),rest=I.confirm.slice(3);
    confirmList=firstThree.map(function(l,i){return confirmRow(l,i===0);}).join("")
      +(rest.length?('<details class="confirm-more"><summary>Show '+rest.length+' more to confirm</summary>'+rest.map(function(l){return confirmRow(l,false);}).join("")+'</details>'):'');
  }else{
    confirmList='<div class="row">You set aside every item. You can restore any below.</div>';
  }
  var consistencyRows=(I.consistency||[]).map(function(f){var first=f.questionIds&&f.questionIds[0];return '<article class="row consistency-finding consistency-finding--'+esc(f.kind)+'"><div class="consistency-finding__labels"><span class="tag">Check these answers</span><span class="consistency-finding__state">Needs confirmation</span></div><h3 class="consistency-finding__title">'+esc(f.title)+'</h3><div class="cc">'+esc(f.detail)+'</div><div class="cc"><b>Who can confirm:</b> '+esc(f.who)+'</div><div class="cc"><b>What to ask:</b> '+esc(f.ask)+'</div>'+(first?'<div class="rowact"><button class="btn secondary sm" data-act="edit-question" data-question-id="'+esc(first)+'">Review answer</button><button class="btn secondary sm" data-act="pnav-seed" data-question="'+esc('Help me prepare to discuss this possible mismatch: '+f.title+'. '+f.detail+' Who may help: '+f.who+'. Suggested question: '+f.ask)+'">'+icon("message-circle",15)+'Plan the conversation</button></div>':'')+'</article>';}).join("");
  /* 2026-10-05: dropped the per-item stateChip("Needs confirmation") here too \u2014 the group's own
     "Skipped \u2014 still needs confirmation" subhead already says that once for the whole list. */
  var deferred=I.deferred.length?('<div class="subhead">Skipped \u2014 still needs confirmation</div>'+I.deferred.map(function(l){return '<div class="row">'+esc(l)+'</div>';}).join("")):'';
  var rejected=S.rejected.length?('<details class="rejected"'+(S.rejectedOpen?' open':'')+'><summary>Items I set aside ('+S.rejected.length+')</summary><div class="rejbody"><p class="muted small">A contractor, local authority, or PG&E may still determine these matter.</p>'+S.rejected.map(function(l){return '<div class="rejitem"><span>'+esc(l)+'</span><button class="restore" data-act="restore" data-a="'+esc(l)+'">Restore</button></div>';}).join("")+'</div></details>'):'';
  function docIconKey(name){
    var map={
      "Residential load sheet":"doc-load-sheet",
      "Site plan / aerial view":"doc-site-plan",
      "Building floor plan":"doc-floor-plan",
      "Scaled exterior elevation plan":"doc-exterior",
      "AHJ unique-address letter or permit":"doc-address",
      "Service photos":"doc-service-photos",
      "Existing-service photos":"doc-service-photos",
      "Panel cut sheet":"doc-panel-cut-sheet",
      "Single-line diagram (SLD)":"doc-single-line",
      "Utility / civil plan":"doc-civil-plans"
    };
    return map[name]||"doc-load-sheet";
  }
  function panelPhotoExamples(){return '<div class="photo-examples-backdrop" data-act="close-photo-examples" aria-hidden="true"></div><section class="photo-examples" id="panelPhotoExamples" role="dialog" aria-modal="true" aria-labelledby="panel-photo-examples-heading" tabindex="-1"><div class="photo-examples__head"><h3 id="panel-photo-examples-heading">Illustrative photo examples</h3><button class="btn ghost sm" type="button" data-act="close-photo-examples">Close examples</button></div><p class="photo-examples__boundary">Research prototype only. Nothing has been uploaded, reviewed, submitted, approved, or stored.</p><div class="photo-example-pair">'+VisualExamples.forAsset('PHO-METER-GOOD-001')+VisualExamples.forAsset('PHO-PANEL-GOOD-001')+'</div><details class="photo-examples__conditional"><summary>If your electric service is overhead</summary><div class="photo-example-pair">'+VisualExamples.forAsset('PHO-MAST-GOOD-001')+VisualExamples.forAsset('DGM-EQ-008')+'</div></details><p class="photo-examples__safety"><strong>Safety reminder:</strong> Do not remove covers, open electrical equipment, touch wires, or approach overhead connections to take photos. Use an existing photo if available, or ask a qualified electrician for help.</p></section>';}
  function aduDocumentExampleCard(x){
    return '<article class="photo-example-card document-example-card" aria-labelledby="document-example-'+esc(x.id)+'"><div class="photo-example-card__visual document-example-card__visual" role="img" aria-label="'+esc(x.alt)+'">'+icon("file-text")+'</div><div class="photo-example-card__content"><div class="photo-example-card__meta">'+evidenceBadge(x.evidence==="Confirmed guidance"?"sourced":"illustrative")+' Synthetic example</div><h4 id="document-example-'+esc(x.id)+'">'+esc(x.title)+'</h4><p><strong>What to include:</strong> '+esc(x.include)+'</p><p><strong>Why it may help:</strong> '+esc(x.why)+'</p></div></article>';
  }
  function aduDocumentExamples(key){
    var x=ADU_DOCUMENT_EXAMPLES[key];if(!x)return '';
    return '<div class="photo-examples-backdrop" data-act="close-document-examples" aria-hidden="true"></div><section class="photo-examples document-examples" id="documentExamplesModal" role="dialog" aria-modal="true" aria-labelledby="document-examples-heading" tabindex="-1"><div class="photo-examples__head"><div><span class="document-guidance-card__status">Illustrative synthetic examples</span><h3 id="document-examples-heading">'+esc(x.title)+'</h3></div><button class="btn ghost sm" type="button" data-act="close-document-examples">Close examples</button></div><p class="photo-examples__boundary">'+esc(x.boundary)+'</p><div class="photo-example-list">'+x.examples.map(aduDocumentExampleCard).join('')+'</div><p class="photo-examples__safety"><strong>Important:</strong> '+esc(x.note)+'</p></section>';
  }
  function documentCard(d,status){
    return '<article class="document-guidance-card">'
      +'<div class="document-guidance-card__head">'
        +'<span class="document-guidance-card__icon" aria-hidden="true">'+icon(docIconKey(d.doc))+'</span>'
        +'<div><span class="document-guidance-card__status">'+esc(status)+'</span><h3>'+esc(d.doc)+'</h3></div>'
      +'</div>'
      +(typeof QuestionHelp!=="undefined"?QuestionHelp.forDocument(d.doc):'')
      /* 2026-10-06: forDocument() returns '' when no real example image resolves for this document
         — fall back to the same docIconKey() glyph already shown as the head badge above, centered
         and sized like a real thumbnail instead of leaving the image slot empty. */
      +(typeof VisualExamples!=="undefined"?(VisualExamples.forDocument(d.doc)||('<figure class="visual-example visual-example--icon-fallback"><span class="visual-example__icon" aria-hidden="true">'+icon(docIconKey(d.doc))+'</span></figure>')):'')
      +'<dl class="document-guidance-card__details">'
        +'<div><dt>What it should show</dt><dd>'+glossaryBody(d.onit)+'</dd></div>'
        +'<div><dt>Why it may matter</dt><dd>'+glossaryBody(d.why)+'</dd></div>'
        +'<div><dt>Who usually obtains it</dt><dd>'+esc(DOC_WHO_LABEL[d.who]||d.who)+'</dd></div>'
        +'<div><dt>When it applies</dt><dd>'+esc(d.trigger)+'</dd></div>'
      +'</dl>'
      +((S.projectType==="panel"&&/photo/i.test(d.doc)||S.projectType==="adu"&&d.doc==="Existing-service photos")?('<div class="document-guidance-card__actions"><button id="panelPhotoExamplesTrigger" class="btn secondary sm" type="button" data-act="show-photo-examples" aria-expanded="'+(panelPhotoExamplesOpen?'true':'false')+'" aria-controls="panelPhotoExamples">Show examples</button></div>'+(panelPhotoExamplesOpen?panelPhotoExamples():'')):'')
      +(S.projectType==="adu"&&ADU_DOCUMENT_EXAMPLES[d.doc]?('<div class="document-guidance-card__actions"><button id="aduDocumentExampleTrigger-'+esc(ADU_DOCUMENT_EXAMPLES[d.doc].id)+'" class="btn secondary sm" type="button" data-act="show-document-examples" data-document="'+esc(d.doc)+'" aria-expanded="'+(aduDocumentExampleOpen===d.doc?'true':'false')+'" aria-controls="documentExamplesModal">Show examples</button></div>'+(aduDocumentExampleOpen===d.doc?aduDocumentExamples(d.doc):'')):'')
    +'</article>';
  }
  function scenarioDocumentGuidance(){
    if(S.projectType!=="adu"&&S.projectType!=="panel")return '';
    var req=docReqFor(S.projectType);if(!req)return '';
    var heading=S.projectType==="adu"?"Documents to discuss for an ADU":"Documents to discuss for a panel project";
    var headingId=S.projectType+"-documents-heading",baseline='',sections='';
    if(S.projectType==="panel"){
      var g=panelDocumentGroups();
      baseline=g.usually.map(function(d){return documentCard(d,"Typically part of the intake document set");}).join("");
      if(g.matched.length)sections+='<h3 class="document-group-heading">May be relevant based on your answers</h3><div class="document-guidance-list">'+g.matched.map(function(d){return documentCard(d,"May be needed");}).join("")+'</div>';
      if(g.unknown.length)sections+='<h3 class="document-group-heading">Applicability not yet known</h3><div class="document-guidance-list">'+g.unknown.map(function(d){return documentCard(d,"Needs confirmation");}).join("")+'</div>';
      if(g.other.length)sections+='<details class="document-guidance-conditional"><summary>Other conditional documents</summary><div class="document-guidance-list">'+g.other.map(function(d){return documentCard(d,"May be needed if applicable");}).join("")+'</div></details>';
    }else{
      baseline=req.baseline.map(function(d){return documentCard(d,"Typically part of the intake document set");}).join("");
      sections='<details class="document-guidance-conditional"><summary>Other documents that may be needed</summary><div class="document-guidance-list">'+req.conditional.map(function(d){return documentCard(d,"May be needed if applicable");}).join("")+'</div></details>';
    }
    return '<section class="scenario-document-guidance scenario-document-guidance--'+esc(S.projectType)+'" aria-labelledby="'+headingId+'">'
      +'<div class="eyebrow">Prepare before you apply</div><h2 id="'+headingId+'">'+esc(heading)+'</h2><p>'+esc(req.intro)+'</p>'
      +'<div class="document-guidance-list">'+baseline+'</div>'+sections
      +'<p class="muted small"><strong>Planning guidance only:</strong> this is not an upload checklist, completeness review, technical review, or approval. Confirm the applicable document set before a formal application.</p></section>';
  }
  var scenarioDocuments=scenarioDocumentGuidance();
  var may=I.mayNeed.length?I.mayNeed.map(function(l){return '<div class="row">'+esc(l)+'</div>';}).join(""):'<p class="muted">Nothing conditional identified yet.</p>';
  var timing=I.timeline.length?('<div class="timing-banner">'+icon("triangle-alert",16)+'<span>These may need extra discussion, permits, or utility review. Flag anything relevant early with <b>'+esc(I.owner)+'</b>.</span></div>'+I.timeline.map(function(x){return '<article class="tcard"><h3>'+esc(x)+'</h3><p>'+esc(timingDesc(x))+'</p></article>';}).join("")):'<p class="muted">No timing factors identified yet.</p>';
  var ask=I.questions.map(function(x){return '<li>'+esc(x)+'</li>';}).join("");
  var meterService='';
  if(S.projectType==="adu"){
    meterService='<section class="meter-service-explainer" aria-labelledby="meter-service-heading">'
      +'<div class="eyebrow">Meter and service are different</div>'
      +'<h2 id="meter-service-heading">How electricity reaches the property</h2>'
      +'<p>A <strong>meter</strong> measures electricity use. A <strong>service connection</strong> brings electricity from the PG&amp;E system to the property.</p>'
      +meterServiceVisual()
      +'<p class="muted small"><strong>For your ADU:</strong> this shows the relationship only — confirm the actual arrangement with PG&amp;E and your city or county during formal review.</p>'+'<div class="rowact"><button class="btn secondary sm" data-act="pnav-seed" data-question="Help me compare meter and service concepts for my ADU and prepare questions for PG&amp;E and my city or county.">'+icon("message-circle",15)+'Compare and prepare</button></div>'
      +'</section>';
  }
  var interpBody = I.projectLabel
    ? '<div class="row">'+evidenceBadge("interpretation")+' '+esc(I.projectLabel)+' <button class="linkbtn" data-act="go" data-step="0">Change</button></div>'
    : '';
  /* 2026-10-03 (P0.1, 10.1.26 feedback): the governed JADU metering rule previously only appeared
     transiently while answering the ADU-type question (components/v45.7-correctness-guidance.js).
     It must also persist into this Understanding screen and the Scenario Guide, which clones from it. */
  if(S.projectType==="adu"&&typeof V457CorrectnessEngine!=="undefined"){
    var jaduGuidance=V457CorrectnessEngine.jadu(S.answers);
    if(jaduGuidance.status==="confirmed-guidance")interpBody+='<div class="row">'+evidenceBadge("interpretation")+' '+esc(jaduGuidance.meteringText+" "+jaduGuidance.serviceText)+' <button class="linkbtn" data-act="edit-question" data-question-id="aduType">Review ADU type</button></div>';
  }
  var evidenceKey='<div class="evidence-key" aria-label="What the source labels mean">'
    +'<span class="ek">'+evidenceBadge("customer")+' from your answers</span>'
    +'<span class="ek">'+evidenceBadge("interpretation")+' our working read</span>'
    +'<span class="ek">'+evidenceBadge("sourced")+' from PG&E intake guidance</span>'
    +'<span class="ek">'+evidenceBadge("illustrative")+' example only</span></div>';
  var left='<div><div class="eyebrow">What we understand</div><h1 class="big">Here is what we understand so far.</h1>'
    +'<p class="lede">This is guidance, not approval. We lead with your recommended next action, then separate what\u2019s known, what needs confirming, and what could affect timing. There is no readiness score.</p>'
    +'<div class="understanding-workspace-frame">'+understandingNavMarkup()+'<div class="understanding-reading-pane">'
    +'<section class="cardbox lead" id="recommended-action" tabindex="-1"><div class="eyebrow">Recommended next action</div>'
      +'<div class="evidence-legend"><span class="who">Where this comes from</span> '+roleBadge((GUIDANCE[S.projectType]||GUIDANCE.unsure).sourceRole)
      +' <span class="muted small">'+esc(sourceRole((GUIDANCE[S.projectType]||GUIDANCE.unsure).sourceRole).desc)+'</span></div>'
      +'<h2>'+esc(I.recommendation)+'</h2>'
      +'<div class="leadmeta"><div><strong>Who takes this step:</strong> '+esc(I.owner)+'</div><div><strong>Why it matters:</strong> '+glossaryBody(I.why)+'</div></div>'
      +'<div class="rowact"><button class="btn primary" type="button" data-act="understanding-next" onclick="continueFromUnderstanding(); return false;">See questions before you begin '+icon("arrow-right",16)+'</button><button class="btn secondary" data-act="pnav-seed" data-question="'+esc('Help me prepare for this recommended next action: '+I.recommendation+'. Who may help: '+I.owner+'. Why it may matter: '+I.why)+'">'+icon("message-circle",16)+'Plan this conversation</button></div></section>'
    +'<section class="secondary-guidance" aria-labelledby="secondary-guidance-heading">'
    +'<div class="secondary-guidance__intro"><span class="eyebrow" id="secondary-guidance-heading">For your reference</span><p class="muted small">Supporting detail behind your recommended next action \u2014 review as needed.</p></div>'
    +'<div class="rstack">'
    +prepCard("known", stIcon("known","state-known"), "u-known-h", stHeading("known","You told us"),
        "The details you provided. Nothing here is an approval.", known)
    +(interpBody
        ? prepCard("interpretation", stIcon("interpretation","state-interpretation"), "u-interp-h",
            stHeading("interpretation","Our interpretation"),
            "Our working read of your description \u2014 not confirmed. You can change it.", interpBody)
        : '')
    +meterService
    +prepCard("needsconfirm", stIcon("confirmation","state-confirmation"), "u-confirm-h", stHeading("confirmation","Needs confirmation"),
        "Working interpretations, not requirements. Each shows who can confirm it and what to ask.", consistencyRows+confirmList+deferred+rejected+evidenceKey)
    +prepCard("mayneed", stIcon("possible","state-possible"), "u-may-h", stHeading("possible","May be needed"),
        "Documents or steps that could apply once a trigger is confirmed.", may+scenarioDocuments)
    +prepCard("timing", stIcon("delay","state-delay"), "u-timing-h", stHeading("delay","Could affect timing"),
        "Things that may affect timing. This is not a schedule or a measure of completion.", timing)
    +prepCard("ask", "message-circle", "u-ask-h", "Question to ask",
        "Specific questions for a contractor, AHJ, or PG&E.", '<ul class="disc">'+ask+'</ul>')
    +'</div>'
    +'</section></div></div>'
    +'<div class="navrow"><button class="btn ghost" data-act="back">'+icon("arrow-left",16)+'Back</button><button class="btn secondary" type="button" data-act="understanding-next" onclick="continueFromUnderstanding(); return false;">Questions before you begin '+icon("arrow-right",16)+'</button></div></div>';
  return '<section class="grid two">'+left+rail(I)+'</section>';
}

;

;
