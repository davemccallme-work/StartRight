/* Draft 5C: read-only comprehension layer for active ADU and Panel Upgrade paths. */
(function(root){
'use strict';
var pilotMap={aduType:['adu-type'],panelExistingCapacity:['main-breaker'],panelCapacityCompare:['main-breaker'],panelServiceMethod:['electric-service'],aduServiceMethod:['electric-service'],aduMeterServiceIntent:['electric-service']};
var documentTermMap={
  'Panel cut sheet':['panel-cut-sheet'],
  'Single-line diagram':['single-line-diagram'],
  'Single line diagram':['single-line-diagram'],
  'Service photos':['electric-service'],
  'Overhead service photos':['overhead-service'],
  'Underground service photos':['underground-service']
};
function records(){return root.COMPREHENSION_CONTENT&&Array.isArray(root.COMPREHENSION_CONTENT.records)?root.COMPREHENSION_CONTENT.records:[];}
function record(id){var list=records();for(var i=0;i<list.length;i++)if(list[i].id===id)return list[i];return null;}
function safe(v){return typeof esc==='function'?esc(String(v||'')):String(v||'').replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c];});}
function unique(ids){var seen={};return (ids||[]).filter(function(id){if(seen[id])return false;seen[id]=true;return true;});}
function questionIds(questionId){var map=root.COMPREHENSION_CONTENT&&root.COMPREHENSION_CONTENT.questionToTermIds||{};return unique(map[questionId]||[]).filter(function(id){var x=record(id);return x&&x.tier===1;});}
function detail(label,body,kind){return body?'<details class="question-help__detail '+kind+'"><summary>'+safe(label)+'</summary><div class="question-help__detail-body"><p>'+safe(body)+'</p></div></details>':'';}
function legacyCard(x,context){if(!x||!x.definition)return '';var id='question-help-'+context+'-'+x.id,label=context==='document'?'About this document':'What this means';return '<section class="question-help question-help--'+context+'" data-question-help="'+safe(x.id)+'" aria-labelledby="'+id+'-heading"><div class="question-help__core"><div class="question-help__eyebrow">'+label+'</div><h3 id="'+id+'-heading">'+safe(x.displayTerm)+'</h3><p>'+safe(x.definition)+'</p></div><div class="question-help__details">'+detail(context==='document'?'Why it may be requested':'Why we are asking about '+x.displayTerm,x.whyAsked,'question-help__why')+detail(context==='document'?'Who can help or where to confirm':'Where to find or confirm '+x.displayTerm,x.findIt,'question-help__find')+(x.safetyNote?'<p class="question-help__safety"><strong>Safety:</strong> '+safe(x.safetyNote)+'</p>':'')+'</div></section>';}
/* 2026-10-05: on the question screen, a full question-help row (eyebrow+term+definition+two
   expandable <details>+safety note, each ~140-200px tall) pushed the actual answer choices
   further down the card for every term a question happened to trigger — sometimes two or three
   per question. Mirrors screens/screen-start.js's helpfulDefinitionTerm() "Helpful definitions"
   cards instead: the same compact .helpful-definition grid (term + one-line definition, with an
   (i) button revealing the rest) already used on the project-choice page, reusing its exact CSS
   and its existing GlossaryController click delegation (data-definition-action="project-context")
   rather than introducing a second toggle mechanism. The "why asking"/"find it"/safety content
   that used to be two separate <details> moves into that one (i) reveal panel instead, since the
   compact card has room for only one disclosure, not two nested ones. forDocument()'s cards (the
   Understanding screen, not part of this request) keep the original legacyCard layout unchanged. */
function compactCard(x){
  if(!x||!x.definition)return '';
  var id='question-help-question-'+x.id;
  var revealBody=(x.whyAsked?'<p>Why we are asking about '+safe(x.displayTerm)+': '+safe(x.whyAsked)+'</p>':'')
    +(x.findIt?'<p>Where to find or confirm '+safe(x.displayTerm)+': '+safe(x.findIt)+'</p>':'')
    +(x.safetyNote?'<p class="helpful-definition__safety"><strong>Safety:</strong> '+safe(x.safetyNote)+'</p>':'');
  return '<article class="helpful-definition" data-question-help="'+safe(x.id)+'"><div class="helpful-definition__standing"><div class="helpful-definition__eyebrow">What this means</div><h3 id="'+id+'-heading">'+safe(x.displayTerm)+'</h3><p>'+safe(x.definition)+'</p></div>'
    +(revealBody?('<button class="term-button helpful-definition__info" type="button" data-definition-action="project-context" data-term-label="'+safe(x.displayTerm)+'" aria-expanded="false" aria-controls="'+id+'" aria-label="Show more about '+safe(x.displayTerm)+'"><span class="term-button__cue" aria-hidden="true">i</span></button><div id="'+id+'" class="term-definition helpful-definition__reveal" role="status" aria-live="polite" hidden>'+revealBody+'</div>'):'')
    +'</article>';
}
function card(x,context){return context==='question'?compactCard(x):legacyCard(x,context);}
function renderRecords(ids,context){return unique(ids).map(function(id){return card(record(id),context);}).join('');}
function forQuestion(questionId){var html=renderRecords(questionIds(questionId),'question');return html?'<div class="question-help-grid">'+html+'</div>':'';}
function forDocument(documentName){return renderRecords(documentTermMap[documentName]||[],'document');}

function byAlias(value){var key=String(value||'').toLowerCase().trim(),map=root.COMPREHENSION_CONTENT&&root.COMPREHENSION_CONTENT.aliasToId||{},id=map[key]||key;return record(id);}
function compactTerm(value){var x=byAlias(value);if(!x)return '';var id='summary-comprehension-'+x.id;return '<article class="summary-comprehension-term" data-comprehension-term="'+safe(x.id)+'" aria-labelledby="'+id+'"><h4 id="'+id+'">'+safe(x.displayTerm)+'</h4><p>'+safe(x.definition)+'</p>'+detail('Why it may matter',x.whyAsked,'summary-comprehension-term__why')+'</article>';}
function advisorMatch(question){var q=String(question||'').toLowerCase(),map=root.COMPREHENSION_CONTENT&&root.COMPREHENSION_CONTENT.aliasToId||{},keys=Object.keys(map).sort(function(a,b){return b.length-a.length;});for(var i=0;i<keys.length;i++)if(q.indexOf(keys[i])>=0)return record(map[keys[i]]);return null;}
function advisorHtml(question){var x=advisorMatch(question);if(!x)return '';return '<div class="pn-ans pn-comprehension-answer" data-comprehension-term="'+safe(x.id)+'"><h3 class="aq">'+safe(x.displayTerm)+'</h3><p>'+safe(x.definition)+'</p>'+(x.whyAsked?'<h4>Why it may matter</h4><p>'+safe(x.whyAsked)+'</p>':'')+(x.findIt?'<h4>Where to find or confirm it</h4><p>'+safe(x.findIt)+'</p>':'')+(x.safetyNote?'<p><strong>Safety:</strong> '+safe(x.safetyNote)+'</p>':'')+'</div>';}
root.QuestionHelp={forQuestion:forQuestion,forDocument:forDocument,questionIds:questionIds,documentTermMap:documentTermMap,pilotMap:pilotMap,compactTerm:compactTerm,advisorMatch:advisorMatch,advisorHtml:advisorHtml};
})(typeof window!=='undefined'?window:this);
