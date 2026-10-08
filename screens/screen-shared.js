/* ===== screens/screen-shared.js — Project Navigator V44.39 ==========================
   Canonical semantic-state mapping + shared renderers. Depends on core/icons.js (icon(), esc()).

   V44.38: #12 no-op track() stub; #3 persistent accessible glossary modal.
   V44.39 Sprint 2 G1-Phase-2: linkGlossaryTerms(text) — a first-occurrence-per-block auto-linker
   that wraps known GLOSSARY terms in the existing accessible term() disclosure (click/keyboard/touch,
   plus the Sprint-1 hover reveal). Only the FIRST occurrence of each term per call is linked, so
   guidance never turns into a wall of links. Longest-match-first; word-boundary aware; the persistent
   header Glossary remains available everywhere.
   =================================================================================== */
   'use strict';
   /* --- #12 Analytics no-op stub (production default) ---------------------------------- */
   if (typeof track !== 'function') { var track = function(){ return; }; }

   /* --- G1-Phase-2: first-occurrence-per-block glossary auto-linker --------------------
      Contract: takes RAW (unescaped) text, returns SAFE html. Non-matched spans are esc()'d;
      the first occurrence of each glossary key is replaced with term(canonicalKey) (which itself
      renders an accessible, escaped disclosure). Requires global GLOSSARY (data.js), term()
      (state.js), esc() (icons.js) — all loaded before this module by build.js. */
   function linkGlossaryTerms(text){
     var raw = String(text == null ? '' : text);
     if (typeof GLOSSARY === 'undefined' || typeof term !== 'function') return esc(raw);
     var keys = Object.keys(GLOSSARY);
     if (!keys.length) return esc(raw);
     var canon = {};
     keys.forEach(function(k){ canon[k.toLowerCase()] = k; });
     keys.sort(function(a,b){ return b.length - a.length; });               /* longest match first */
     var escKeys = keys.map(function(k){ return k.replace(/[.*+?^${}()|[\]\\]/g, '\\<\!--SCRIPTS--><\!--/SCRIPTS-->'); });
     var re = new RegExp('(^|[^A-Za-z0-9])(' + escKeys.join('|') + ')(?![A-Za-z0-9])', 'gi');
     var seen = {}, out = '', last = 0, m;
     while ((m = re.exec(raw))) {
       var lead = m[1], surface = m[2], surfaceStart = m.index + lead.length;
       out += esc(raw.slice(last, surfaceStart));
       var key = canon[surface.toLowerCase()];
       if (key && !seen[key]) { seen[key] = 1; out += '<span class="glossary-linked" data-glossary-linked="1">' + term(key) + '</span>'; }
       else { out += esc(surface); }
       last = surfaceStart + surface.length;
       re.lastIndex = last;
     }
     out += esc(raw.slice(last));
     return out;
   }

   /* --- 0. Existing V44 shared helpers (preserved; required by every screen) ----------- */
   function anxiety(){
     return '<div class="note">'+icon("circle-help",18)
       +'<span><strong>You are still exploring.</strong> This is not an application or approval, and it does not commit you to anything.</span></div>';
   }
   function stateChip(label){
     return '<span class="pill">'+esc(label)+'</span>';
   }
   function humanHelpContext(){
     var fallback={label:"Source-backed planning help",prompt:"Help me prepare my next question without making a technical determination."};
     if(typeof S==="undefined")return fallback;
     if(S.step===1&&typeof activeQuestions==="function"){
       var q=activeQuestions()[S.questionIndex];
       if(q){
         if(q.id==="aduType")return {label:"Compare detached, attached, and junior ADUs",prompt:"Help me understand the difference between detached, attached, and junior ADUs. Keep anything uncertain under Needs confirmation."};
         if(q.id==="aduAddressStatus")return {label:"Prepare an address-assignment question",prompt:"Help me ask my city or county whether a separate address is assigned or needed, without assuming that an address determines metering or service."};
         if(q.id==="aduMeterServiceIntent")return {label:"Compare meter and service paths",prompt:"Help me understand the difference between using existing service, adding a separate meter, and considering a separate service connection. Do not determine eligibility or approval."};
         if(q.id==="aduServiceMethod")return {label:"Compare overhead and underground paths",prompt:"Help me understand overhead and underground service-path clues without determining what applies."};
         if(q.id==="aduAdjacentService")return {label:"Understand adjacent equipment",prompt:"Help me understand what next to existing service equipment means without asking me to open or touch equipment."};
         if(q.id==="panelIntent")return {label:"Clarify the panel work you are considering",prompt:"Help me distinguish a capacity increase, same-capacity replacement, and panel relocation without deciding what my project requires."};
         if(q.id==="panelExistingCapacity")return {label:"Find the main-breaker rating safely",prompt:"Help me find the existing main-breaker rating using a label or photo without removing the panel cover."};
         if(q.id==="panelServiceMethod")return {label:"Identify overhead or underground service",prompt:"Help me understand whether my electric service appears overhead or underground without making a technical determination."};
         if(q.id==="panelProposedCapacity")return {label:"Prepare a capacity question for an electrician",prompt:"Help me discuss a capacity being considered with a licensed electrician without assuming that size is needed or available."};
         if(q.id==="panelLoads")return {label:"Describe the equipment you plan to add",prompt:"Help me organize the equipment or electrical load I plan to add so I can discuss a code-based load calculation with an electrician."};
         return {label:"Get help with this question",prompt:"Help me prepare to answer: "+q.label+" Do not make a technical determination."};
       }
     }
     if(S.step===2)return {label:"Prepare your next confirmation question",prompt:"Help me prepare the recommended next question for this project. Explain who can confirm it and what information to gather, without making a determination."};
     if(S.step===4)return {label:"Review your recommended next action",prompt:"Help me understand the recommended next action in my preparation guide without starting an application."};
     return fallback;
   }
   function rail(I){
     var help=humanHelpContext();
     return '<aside class="rail"><div class="eyebrow">Get help with this step</div><h2>'+esc(I.recommendation)+'</h2>'
       +'<button class="linkbtn whytoggle" data-act="togglewhy" aria-expanded="'+(S.whyOpen?'true':'false')+'">'+icon("circle-help",15)+'<span class="whytoggle__label">Why this matters</span></button>'
       +(S.whyOpen?'<dl><dt>Why this matters</dt><dd>'+esc(I.why)+'</dd><dt>Who takes this step</dt><dd>'+esc(I.owner)+'</dd><dt>After you do this</dt><dd>'+esc(I.after)+'</dd></dl>':'')
       +'<div class="experts"><h3>Optional planning help</h3>'
       +'<button class="exbtn" type="button" data-act="pnav-seed" data-question="'+esc(help.prompt)+'"><span class="exi">'+icon("message-circle",16)+'</span><span class="ext"><b>Ask Project Navigator</b><small>Get help understanding this step or preparing a question.</small></span></button>'
       +'</div></aside>';
   }
   /* --- 1. Canonical state table (single source of truth) ------------------------------ */
   var GUIDANCE_STATES = {
     known:        { heading: 'You told us',            icon: 'state-known',          className: 'guidance-card--known' },
     interpretation:{ heading: 'Our interpretation',    icon: 'state-interpretation', className: 'guidance-card--interpretation' },
     confirmation: { heading: 'Needs confirmation',     icon: 'state-confirmation',   className: 'guidance-card--confirmation' },
     possible:     { heading: 'May be needed',          icon: 'state-possible',       className: 'guidance-card--possible' },
     delay:        { heading: 'Could affect timing',    icon: 'state-delay',          className: 'guidance-card--delay' },
     nextAction:   { heading: 'Recommended next action',icon: 'state-next-action',    className: 'guidance-card--next-action' },
     utility:      { heading: 'PG&E involvement',       icon: 'state-utility',        className: 'guidance-card--utility' }
   };
   var GUIDANCE_STATE_ALIAS = {
     known: 'known', needsconfirm: 'confirmation', unknown: 'confirmation',
     mayneed: 'possible', timing: 'delay', ask: 'nextAction',
     interpretation: 'interpretation', utility: 'utility'
   };
   function resolveStateName(name) {
     return GUIDANCE_STATES[name] ? name : (GUIDANCE_STATE_ALIAS[name] || 'confirmation');
   }
   function guidanceStateHeader(stateName, headingId) {
     var state = GUIDANCE_STATES[resolveStateName(stateName)];
     return [
       '<div class="guidance-card__state-header">',
         '<span class="guidance-card__state-icon" aria-hidden="true">',
           icon(state.icon),
         '</span>',
         '<h2 class="subhead" id="', esc(headingId), '">',
           esc(state.heading),
         '</h2>',
       '</div>'
     ].join('');
   }
   function guidanceCard(stateName, headingId, bodyHtml, opts) {
     var key = resolveStateName(stateName);
     var state = GUIDANCE_STATES[key];
     opts = opts || {};
     var emphasis = opts.primary ? ' guidance-card--primary' : '';
     var contextClass = opts.context === 'summary' ? ' guidance-card--summary guidance-card--full-width' : '';
     return [
       '<section class="guidance-card ', state.className, emphasis, contextClass, '" aria-labelledby="', esc(headingId), '">',
         guidanceStateHeader(key, headingId),
         '<div class="guidance-card__body">', (bodyHtml || ''), '</div>',
       '</section>'
     ].join('');
   }
   /* --- 3b. #3 GLOSSARY: persistent, accessible full-term modal ------------------------ */
   function glossaryModalHtml(){  
     var entries=(typeof GlossaryController!=="undefined"&&GlossaryController.entries)?GlossaryController.entries:[];  
     if(!entries.length){  
       var terms=(typeof GLOSSARY!=="undefined")?GLOSSARY:{};  
       var seen={};entries=Object.keys(terms).map(function(term){return {id:String(term).toLowerCase(),term:term,definition:terms[term]};}).filter(function(item){var key=item.term.toLowerCase().trim();if(seen[key])return false;seen[key]=1;return true;});  
     }  
     entries=entries.slice().sort(function(a,b){return a.term.localeCompare(b.term);});  
     var items=entries.map(function(item){return '<div class="glossary-entry" data-glossary-id="'+esc(item.id)+'"><dt class="glossary-entry__term">'+esc(item.term)+'</dt><dd class="glossary-entry__def">'+esc(item.definition)+'</dd></div>';}).join('');  
     return '<div class="photo-examples-backdrop" data-glossary-close="1" aria-hidden="true"></div>'
       +'<section class="photo-examples glossary-modal" id="glossaryModal" role="dialog" aria-modal="true" aria-labelledby="glossary-modal-heading" tabindex="-1">'
       +'<div class="photo-examples__head"><div><span class="document-guidance-card__status">Plain-language definitions</span><h3 id="glossary-modal-heading">Glossary</h3></div>'
       +'<button class="btn ghost sm" type="button" data-glossary-close="1">Close glossary</button></div>'
       +'<p class="photo-examples__boundary">Select a term for its definition, or browse the full glossary below. These plain-language definitions help you prepare \u2014 they are not determinations or approvals.</p>'
       +'<dl class="glossary-list">'+(items||'<p class="muted">No glossary terms are available.</p>')+'</dl>'
       +'</section>';
   }
   function openGlossary(){
     if(typeof document==="undefined")return;
     if(document.getElementById('glossaryModal'))return;
     var host=document.createElement('div');
     host.setAttribute('data-glossary-host','1');
     host.innerHTML=glossaryModalHtml();
     if(document.body){
       while(host.firstChild)document.body.appendChild(host.firstChild);
       document.body.classList.add('photo-examples-open');
     }
     var modal=document.getElementById('glossaryModal');
     if(modal){try{modal.focus();}catch(e){}}
   }
   function closeGlossary(){
     if(typeof document==="undefined")return;
     var modal=document.getElementById('glossaryModal');
     var backdrop=document.querySelector('.photo-examples-backdrop[data-glossary-close]');
     if(modal&&modal.parentNode)modal.parentNode.removeChild(modal);
     if(backdrop&&backdrop.parentNode)backdrop.parentNode.removeChild(backdrop);
     if(document.body)document.body.classList.remove('photo-examples-open');
     var btn=document.getElementById('glossaryBtn');
     if(btn){try{btn.focus();}catch(e){}}
   }
   function wireGlossaryAccess(){
     if(typeof document==="undefined")return;
     var glossaryButton=document.getElementById('glossaryBtn');if(glossaryButton){glossaryButton.setAttribute('aria-label','Glossary');glossaryButton.innerHTML='<span class="glossary-button__icon" aria-hidden="true">'+icon("book-open",20)+'</span><span class="glossary-button__label">Glossary</span>';}
     document.addEventListener('click',function(e){
       var t=e.target;
       if(!t||!t.closest)return;
       if(t.closest('[data-glossary-close]')){closeGlossary();return;}
       if(t.closest('#glossaryBtn')){track('glossary_opened');openGlossary();}
     });
     document.addEventListener('keydown',function(e){
       if(e.key==="Escape"&&document.getElementById('glossaryModal'))closeGlossary();
     });
   }
   if(typeof document!=="undefined"){
     if(document.readyState!=="loading")wireGlossaryAccess();
     else document.addEventListener('DOMContentLoaded',wireGlossaryAccess,{once:true});
   }
   /* --- 4. Canonical native-radio choice fieldset + nav helpers ----------------------- */
   var UNDERSTANDING_SECTIONS=[
     {id:"recommended-action",label:"Next action"},
     {id:"u-known-h",label:"You told us"},
     {id:"u-interp-h",label:"Interpretation",optional:true},
     {id:"u-confirm-h",label:"Confirm"},
     {id:"u-may-h",label:"Documents"},
     {id:"u-timing-h",label:"Timing"},
     {id:"u-ask-h",label:"Questions"}
   ];
   function understandingSectionNav(hasInterpretation){
     var items=UNDERSTANDING_SECTIONS.filter(function(x){return !x.optional||hasInterpretation;}).map(function(x,i){
       return '<li><button type="button" class="understanding-nav__button" data-act="jump-understanding-section" data-section-id="'+esc(x.id)+'"'+(i===0?' aria-current="location"':'')+'>'+esc(x.label)+'</button></li>';
     }).join('');
     return '<nav class="understanding-nav" aria-label="What needs confirming sections"><div class="understanding-nav__head"><strong>On this page</strong><span>Jump to a section</span></div><ol class="understanding-nav__list">'+items+'</ol></nav>';
   }
   var QUESTION_NAV_LABELS={description:"Project description",aduType:"ADU type",aduAddressStatus:"Address status",aduMeterServiceIntent:"Electrical setup",aduServiceMethod:"Service method",aduAdjacentService:"Equipment placement",panelIntent:"Panel project",panelExistingCapacity:"Existing rating",panelServiceMethod:"Service method",panelProposedCapacity:"Proposed rating",panelLoads:"Equipment and loads",property:"Property type",energy:"Energy needs",timing:"Project stage"};
   function questionNavLabel(q){return q.navLabel||QUESTION_NAV_LABELS[q.id]||q.label;}
   function questionAnswerState(q){var skipped=S.skipped.indexOf(q.id)>=0;if(skipped)return {key:"skipped",label:"Skipped"};if(isQuestionResolved(q))return {key:"answered",label:"Answered"};return {key:"unanswered",label:"Not answered"};}
   function questionNavigator(qs){
     var highest=Math.max(S.highestReachedQuestion||0,S.questionIndex),lastTopic="",items=qs.map(function(q,i){var state=questionAnswerState(q),current=i===S.questionIndex,reachable=i<=highest,topic=(typeof questionTopic==="function"?questionTopic(q):"Guidance"),topicHeading=topic!==lastTopic?'<li class="question-nav__topic"><span>'+esc(topic)+'</span></li>':'';lastTopic=topic;
       return topicHeading+'<li class="question-nav__item question-nav__item--'+state.key+(current?' is-current':'')+'">'
         +(reachable?'<button type="button" class="question-nav__button" data-act="jump-question" data-question-index="'+i+'"'+(current?' aria-current="step"':'')+'>':'<span class="question-nav__button is-disabled" aria-disabled="true">')
         +'<span class="question-nav__number">'+(i+1)+'</span><span class="question-nav__label">'+esc(questionNavLabel(q))+'</span><span class="question-nav__status">'+(current?'Current':state.label)+'</span>'
         +(reachable?'</button>':'</span>')+'</li>';}).join('');
     return '<nav class="question-nav question-nav--inbox" id="questionNavigator" aria-label="Project questions"><div class="question-nav__heading"><strong>Your questions</strong><span>Current topic: '+esc(questionNavLabel(qs[S.questionIndex]))+'</span></div><ol class="question-nav__list">'+items+'</ol></nav>';
   }
   function choiceRadioFieldset(cfg) {
     cfg = cfg || {};
     var name = esc(cfg.name || 'choice');
     var variant = cfg.variant === 'illustrated' ? 'illustrated' : 'compact';
     var act = cfg.act ? (' data-act="' + esc(cfg.act) + '"') : '';
     var fieldsetClass = 'choice-fieldset choice-fieldset--' + variant;
     var legendClass = cfg.legendClassName ? (' class="' + esc(cfg.legendClassName) + '"') : '';
     var items = (cfg.options || []).map(function (o) {
       var illus = o.illustration
         ? '<span class="choice-radio__illus" aria-hidden="true">' + o.illustration + '</span>'
         : '';
       var desc = o.desc
         ? '<span class="choice-radio__desc">' + esc(o.desc) + '</span>'
         : '';
       var checked = o.checked ? ' checked' : '';
       var disabled = o.disabled ? ' disabled' : '';
       var cardClass = 'choice-radio choice-radio--' + variant;
       /* 2026-10-05: o.after (the per-option "what this means" preview) used to render as a sibling
          <details> directly under the label — a second accordion row per option, stacking the
          vertical space of every choice that had one. It's now a single (i) icon button rendered
          OUTSIDE the <label> (components/question-inline-response.js's renderPreview()), so this
          wrapper is what lets it sit beside the label instead of under it: a label implicitly
          activates its radio on a click ANYWHERE inside it, including a nested button, so the icon
          has to be the label's sibling, not its child, for "reading this does not select the
          answer" to actually hold. .choice-option's flex-wrap puts the label and icon in one row
          and lets the icon's own reveal panel (full flex-basis) drop to its own row beneath both. */
       var label = [
         '<label class="', cardClass, '">',
           '<input type="radio" name="', name, '" value="', esc(o.value), '"', act, checked, disabled, '>',
           illus,
           '<span class="choice-radio__text">',
             '<strong class="choice-radio__title">', esc(o.title), '</strong>',
             desc,
           '</span>',
         '</label>'
       ].join('');
       return o.after ? ('<div class="choice-option">' + label + o.after + '</div>') : label;
     }).join('');
     return [
       '<fieldset class="', fieldsetClass, '">',
         '<legend', legendClass, '>', esc(cfg.legend || ''), '</legend>',
         items,
       '</fieldset>'
     ].join('');
   }
   var SUMMARY_STORY_ORDER = [
     'yourProject','known','interpretation','confirmation','possible','delay','utility','nextAction','whatNext'
   ];
   if (typeof module !== 'undefined' && module.exports) {
     module.exports = {
       GUIDANCE_STATES: GUIDANCE_STATES, resolveStateName: resolveStateName,
       guidanceStateHeader: guidanceStateHeader, guidanceCard: guidanceCard,
       choiceRadioFieldset: choiceRadioFieldset, SUMMARY_STORY_ORDER: SUMMARY_STORY_ORDER,
       anxiety: anxiety, stateChip: stateChip, rail: rail, humanHelpContext: humanHelpContext,
       glossaryModalHtml: glossaryModalHtml, track: track, linkGlossaryTerms: linkGlossaryTerms
     };
   }

function recognitionReviewHtml(){
  var r=S.recognitionReview||{},items=(r.candidates||[]).filter(function(c){return c.status!=="rejected";});if(!r.open||!items.length)return "";
  return '<section class="recognition-review" aria-labelledby="recognition-review-heading"><div class="eyebrow">We understood</div><h2 id="recognition-review-heading">Review these interpreted details</h2><p>These are candidate details from your description. They are not confirmed requirements or technical determinations.</p><ul>'+items.map(function(c,i){return '<li><span><strong>'+esc(c.field)+'</strong>: '+esc(Array.isArray(c.value)?c.value.join(', '):c.value)+'</span><span class="recognition-review__actions"><button class="linkbtn" data-act="recognition-confirm" data-candidate-index="'+i+'">Use this detail</button><button class="linkbtn" data-act="recognition-reject" data-candidate-index="'+i+'">Remove</button></span></li>';}).join('')+'</ul><button class="btn ghost" data-act="recognition-dismiss">Start with questions instead</button></section>';
}

;

;
