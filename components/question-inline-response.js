/* V45.6.9.9 SELECTED-ANSWER INLINE RESPONSE (presentation only)
   One native <details> below the answer choices. Open by default per new answer; a customer
   collapse is remembered in module memory only. announce() writes to #status; focus never moves.
   V45.6.10:
     - reference example images beside released documents (e.g. single-line diagram example)
     - renderPreview(): per-option "What this choice means" disclosure shown before selection.
       Previews are closed by default, never select the option, and are never persisted. */
var QuestionInlineResponse=(function(root){'use strict';
  function safe(v){return typeof esc==='function'?esc(String(v==null?'':v)):String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  var collapsed={},opened={},lastAnnounced=null,installed=false;
  /* 2026-10-06: on phones an auto-opened response grew the page by thousands of px right under the
     reader's thumb on every selection, so they lost their place. At narrow widths it now starts closed
     (summary still visible under the choices) and only opens when the reader opens it; desktop keeps
     open-by-default. */
  function narrow(){return !!(root.matchMedia&&root.matchMedia('(max-width: 760px)').matches);}
  function isOpen(key){return narrow()?!!opened[key]:!collapsed[key];}
  function slug(key){return String(key).replace(/[^A-Za-z0-9_-]+/g,'-').slice(0,80);}
  function asset(id){return root.LearningCardRegistry?root.LearningCardRegistry.byId(id):null;}
  function figure(id,caption,cls){var a=asset(id);if(!a)return '';return '<figure class="inline-response__figure '+(cls||'')+'" data-reference-id="'+safe(id)+'"><img src="'+a.src+'" alt="'+safe(a.alt)+'" loading="lazy" data-lightbox-title="'+safe(a.title)+'" data-lightbox-caption="'+safe(caption)+'"><figcaption><strong>'+safe(a.title)+'</strong><span>'+safe(caption)+'</span></figcaption></figure>';}
  function references(m){var list=(m.referenceExamples||[]);if(!list.length)return '';return '<div class="inline-response__references">'+list.map(function(r){return r.shownAbove?'<p class="inline-response__note" data-reference-shown-above="'+safe(r.assetId)+'">An example '+(r.documentId==='DOC-SLD'?'single-line diagram':'of this document')+' is shown above.</p>':figure(r.assetId,r.caption,'inline-response__figure--reference');}).join('')+'</div>';}
  function documents(m){if(!m.documents||!m.documents.length)return '';var list=(root.DocumentGuidance&&root.DocumentGuidance.renderInline)?root.DocumentGuidance.renderInline(m.documents):'';if(!list)return '';var ids=root.VisualGuidanceMap?root.VisualGuidanceMap.combined(m.documents.map(function(x){return x.id;}),m.visualIds||[]):[],shared=ids.length&&root.VisualGuidanceCard?root.VisualGuidanceCard.render(ids,{hideVisuals:true}):'',h='inline-response-docs-'+slug(m.responseKey);return '<details class="inline-response__details inline-response__documents"><summary><span>Documents or photos that may help</span><small>Optional preparation details</small></summary><section class="inline-response__section" aria-labelledby="'+h+'"><h2 class="inline-response__heading sr" id="'+h+'">Documents or photos that may help</h2>'+list+shared+(shared?'':references(m))+'<p class="inline-response__note">These are shown because of your answers. They are not a list of required documents.</p></section></details>';}
  function render(m,innerHtml){
    if(!m)return innerHtml||'';
    installToggle();
    var key=m.responseKey,open=isOpen(key),h='inline-response-def-'+slug(key);
    return '<details class="answer-context inline-response" data-inline-response="'+safe(m.responseId)+'" data-inline-response-key="'+safe(key)+'" data-inline-response-label="'+safe(m.displayLabel)+'"'+(open?' open':'')+'>'
      +'<summary class="inline-response__summary"><span>About “'+safe(m.displayLabel)+'”</span><small>Definition, guidance, and examples</small></summary>'
      +'<div class="answer-context__body inline-response__body" data-density-contract="answer-primary-details">'
      +'<section class="inline-response__section inline-response__definition" aria-labelledby="'+h+'"><h2 class="inline-response__heading" id="'+h+'">What this answer means</h2><p>'+safe(m.definition)+'</p>'+(m.uncertainty?'<p class="inline-response__uncertainty"><strong>Still to confirm:</strong> '+safe(m.uncertainty)+'</p>':'')+'</section>'
      +(innerHtml||'')
      +documents(m)
      +(m.preparation?'<details class="inline-response__details inline-response__prepare"><summary><span>A practical next step</span><small>'+safe(m.preparation)+'</small></summary><section class="inline-response__section"><h2 class="inline-response__heading sr">A practical next step</h2><p>'+safe(m.preparation)+'</p></section></details>':'')
      +'<p class="inline-response__boundary">'+safe(m.boundary)+'</p>'
      +'</div></details>';
  }
  /* 2026-10-05: was a <details class="option-preview"> accordion stacked under the label (one more
     expandable row per choice that had governed preview copy). Now a standard (i) term-button —
     the same control and the same core/events.js-mounted GlossaryController click delegation used
     for every other inline definition in the app — sitting beside the label (screens/screen-
     shared.js's choiceRadioFieldset() wraps label+this in .choice-option for that layout) instead
     of a second disclosure pattern underneath it. */
  function renderPreview(p){if(!p)return '';var id='option-preview-'+slug(p.previewKey);var body='<p>'+safe(p.definition)+'</p>'+(p.uncertainty?'<p class="option-preview__uncertainty"><strong>Still to confirm:</strong> '+safe(p.uncertainty)+'</p>':'')+(p.visualIds||[]).map(function(vid){return figure(vid,'Example only, if you choose this answer. It is not a determination about your project.','option-preview__figure');}).join('')+'<p class="option-preview__note">Reading this does not select the answer.</p>';return '<button class="term-button choice-option__info" type="button" data-definition-action="project-context" data-term-label="'+safe(p.title)+'" data-option-preview="'+safe(p.previewKey)+'" aria-expanded="false" aria-controls="'+id+'" aria-label="What “'+safe(p.title)+'” means"><span class="term-button__cue" aria-hidden="true">i</span></button><div id="'+id+'" class="term-definition choice-option__reveal" role="note" hidden>'+body+'</div>';}
  function installToggle(){if(installed||typeof document==='undefined'||!document.addEventListener)return;installed=true;document.addEventListener('toggle',function(e){var d=e.target;if(!d||!d.matches||!d.matches('details[data-inline-response-key]'))return;var k=d.getAttribute('data-inline-response-key');if(d.open){delete collapsed[k];opened[k]=true;}else{collapsed[k]=true;delete opened[k];}},true);}
  function announce(){if(typeof document==='undefined')return;var d=document.querySelector('#app details[data-inline-response-key]'),s=document.getElementById('status');if(!s)return;if(!d){lastAnnounced=null;return;}var k=d.getAttribute('data-inline-response-key');if(k===lastAnnounced)return;lastAnnounced=k;s.textContent='';setTimeout(function(){s.textContent='Guidance for '+d.getAttribute('data-inline-response-label')+' is now available below the choices.';},30);}
  function reset(){collapsed={};opened={};lastAnnounced=null;}
  function getState(){return {collapsed:Object.keys(collapsed),lastAnnounced:lastAnnounced};}
  return {render:render,renderPreview:renderPreview,announce:announce,reset:reset,getState:getState};
})(typeof window!=='undefined'?window:this);
if(typeof module!=='undefined'&&module.exports)module.exports=QuestionInlineResponse;
