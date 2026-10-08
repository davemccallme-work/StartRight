/* 2026-10-05: "Try a simulated document check" — a scripted, front-end-only exercise showing what a
   document preparation check might look like. NOT a real upload: no file is ever read, analyzed,
   reviewed, or stored, and nothing here is written to S/S.answers or any export/draft structure —
   this module owns its own session-only state entirely separately from the app's real answer state,
   the same hard boundary this app already keeps between illustrative content and real guidance
   (see exports/application-draft.js, which this module is never read by).
   Wired through the existing delegated actions table in core/events.js (data-act="simdoc-select"/
   "simdoc-check"/"simdoc-remove"), re-rendered via the existing stableRender() helper — no new
   rendering mechanism or second event listener. */
/* 2026-10-05: no outer `var SimulatedDocumentCheck=` around this IIFE — the established pattern used
   by every sibling file in this directory (e.g. document-guidance-card.js) assigns the public API as
   a property on `root` INSIDE the IIFE and calls it standalone for that side effect. Wrapping it in
   `var SimulatedDocumentCheck=(function(root){...root.SimulatedDocumentCheck={...}...})(window)`
   self-stomps: the IIFE's own implicit `undefined` return becomes the outer assignment's value,
   overwriting the very property the IIFE just set on `root` (== window, the same global binding as
   the outer `var`) a moment earlier. Confirmed live — window.SimulatedDocumentCheck existed as a
   hoisted key but its value was always undefined until this was removed. */
(function(root){'use strict';
  var STEPS=['File to add','Added to prototype','Simulated processing','Simulated check'];
  var PHASE_STEP={idle:-1,adding:0,added:1,processing:2,checked:3};
  var STATE={fixtureId:null,phase:'idle'};
  var timer=null;
  function clearTimer(){if(timer){clearTimeout(timer);timer=null;}}
  function fixtures(){return typeof SIMULATED_DOCUMENT_FIXTURES!=='undefined'?SIMULATED_DOCUMENT_FIXTURES:[];}
  function fixtureById(id){return fixtures().filter(function(f){return f.documentId===id;})[0]||null;}
  function catalogEntry(documentId){
    var docs=(typeof DOCUMENT_GUIDANCE_CATALOG!=='undefined'&&DOCUMENT_GUIDANCE_CATALOG.documents)||{};
    var key=Object.keys(docs).filter(function(k){return docs[k].id===documentId;})[0];
    return key?docs[key]:null;
  }
  function asset(assetId){return typeof LearningCardRegistry!=='undefined'?LearningCardRegistry.byId(assetId):null;}
  function select(documentId){
    if(!fixtureById(documentId))return;
    clearTimer();
    STATE.fixtureId=documentId;STATE.phase='adding';
    rerender();
    timer=setTimeout(function(){STATE.phase='added';timer=null;rerender();},700);
  }
  function check(){
    if(STATE.phase!=='added')return;
    clearTimer();
    STATE.phase='processing';
    rerender();
    timer=setTimeout(function(){STATE.phase='checked';timer=null;rerender();},1450);
  }
  function remove(){
    clearTimer();
    STATE.fixtureId=null;STATE.phase='idle';
    rerender();
  }
  /* 2026-10-05: stableRender() still calls the app's FULL render() underneath — fine for the
     one-off, user-initiated state changes it was built for elsewhere (e.g. recognition-review
     accept/reject), but this component's own transitions fire repeatedly, including from its own
     setTimeout callbacks mid-sequence. Confirmed live: every one of those full re-renders rebuilds
     every <details>-based accordion on the page from scratch, snapping every OTHER open accordion
     (starting with "Your living preparation plan", the one this component lives inside) back to
     closed — "the accordion drawers collapse, losing place." A scoped outerHTML swap of just this
     component's own container avoids touching the rest of the page/accordion tree entirely; clicks
     still reach it afterward because this app's click handling is delegated from a stable ancestor
     (core/events.js), not bound to the individual elements being replaced. */
  function rerender(){var el=typeof document!=='undefined'?document.querySelector('.simulated-document-check'):null;if(el)el.outerHTML=render();}
  function picker(){
    return '<div class="simdoc-picker" role="group" aria-label="Choose an example document">'+fixtures().map(function(f){
      var cat=catalogEntry(f.documentId);if(!cat)return '';
      var active=STATE.fixtureId===f.documentId&&STATE.phase!=='idle';
      return '<button type="button" class="simdoc-picker__option'+(active?' is-selected':'')+'" data-act="simdoc-select" data-fixture="'+esc(f.documentId)+'"'+(STATE.phase!=='idle'&&!active?' disabled':'')+' aria-pressed="'+(active?'true':'false')+'">'
        +'<span class="simdoc-picker__icon" aria-hidden="true">'+icon(cat.icon)+'</span>'
        +'<span class="simdoc-picker__label">'+esc(cat.title)+'</span>'
      +'</button>';
    }).join('')+'</div>';
  }
  function flow(){
    var current=PHASE_STEP[STATE.phase];
    return '<ol class="simdoc-flow">'+STEPS.map(function(label,i){
      var cls=i<current?'is-complete':i===current?'is-current'+(STATE.phase==='adding'||STATE.phase==='processing'?' is-processing':''):'';
      return '<li class="simdoc-flow__step'+(cls?' '+cls:'')+'"><span class="simdoc-flow__marker" aria-hidden="true">'+(i<current?icon('circle-check'):(i+1))+'</span><span class="simdoc-flow__label">'+esc(label)+'</span></li>';
    }).join('')+'</ol>';
  }
  function resultCard(f){
    var passed=f.outcome==='passed';
    return '<div class="simdoc-result'+(passed?'':' needs')+'">'
      +'<div class="simdoc-result__header">'
        +'<span class="simdoc-result__icon" aria-hidden="true">'+icon(passed?'circle-check':'triangle-alert')+'</span>'
        +'<div><p class="simdoc-result__eyebrow">Scripted example result</p><h4>'+(passed?'Simulated check passed':'Simulated check: needs another file')+'</h4></div>'
      +'</div>'
      +'<div class="simdoc-result__body">'
        +'<section><h5>What this example appears to show</h5><ul>'+f.present.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul></section>'
        +(f.missing&&f.missing.length?'<section><h5>What we could not identify</h5><ul>'+f.missing.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul></section>':'')
        +'<section><h5>Suggested next step</h5><p>'+esc(f.nextStep)+'</p></section>'
      +'</div>'
      +'<p class="simdoc-result__boundary">Simulated preparation exercise only. No customer document was analyzed or reviewed. Nothing has been uploaded, reviewed, submitted, approved, or stored.</p>'
    +'</div>';
  }
  function card(){
    var f=fixtureById(STATE.fixtureId);if(!f)return '';
    var cat=catalogEntry(f.documentId);if(!cat)return '';
    var a=asset(f.assetId);
    return '<article class="simdoc-card simdoc-card--'+esc(STATE.phase)+'">'
      +'<div class="simdoc-card__head">'
        +'<span class="simdoc-card__icon" aria-hidden="true">'+icon(cat.icon)+'</span>'
        +'<div><p class="simdoc-card__eyebrow">Example document</p><h4>'+esc(cat.title)+'</h4></div>'
      +'</div>'
      +(a?'<div class="simdoc-preview"><img src="'+a.src+'" alt="'+esc(a.alt)+'" loading="lazy"></div>':'')
      +flow()
      +'<div class="simdoc-card__actions">'
        +(STATE.phase==='added'?'<button type="button" class="btn primary sm" data-act="simdoc-check">Run simulated check</button>':'')
        +(STATE.phase==='adding'?'<p class="simdoc-status" aria-live="polite">Adding to the prototype&hellip;</p>':'')
        +(STATE.phase==='processing'?'<p class="simdoc-status" aria-live="polite">Running the simulated check&hellip;</p>':'')
        +(STATE.phase==='added'||STATE.phase==='checked'?'<button type="button" class="btn secondary sm" data-act="simdoc-remove">Remove</button>':'')
      +'</div>'
      +(STATE.phase==='checked'?resultCard(f):'')
    +'</article>';
  }
  function render(){
    return '<div class="simulated-document-check" data-simdoc>'
      +'<p class="simdoc-intro"><strong>This is a simulation only.</strong> No file is uploaded, analyzed, reviewed, or stored. Choose an example document below to see how a simulated preparation check might look.</p>'
      +picker()
      +(STATE.phase!=='idle'?card():'')
      +'<p class="simdoc-boundary muted small">A simulated result never changes project eligibility, cost, timing, application status, or any open confirmation question. Nothing has been uploaded, reviewed, submitted, approved, or stored.</p>'
    +'</div>';
  }
  root.SimulatedDocumentCheck={render:render,select:select,check:check,remove:remove};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.SimulatedDocumentCheck;
})(typeof window!=='undefined'?window:this);
