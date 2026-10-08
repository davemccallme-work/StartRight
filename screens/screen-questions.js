
/* ============================ STEP 1 — one question at a time ============================
   V44.38 P0-1: Next/Review disabled state derives from isQuestionResolved(q) (fields-aware),
   fixing the compound panelCapacityCompare screen where progression required Skip.

   V44.39 R1 REGRESSION FIX (SME): inline consistency notices (e.g. "Panel intent and ratings
   may not align" / 200A->100A) went missing on the compound capacity screen. Root cause:
   step1() filtered findings by `f.questionIds.indexOf(q.id)`, but on the compound screen
   q.id is "panelCapacityCompare" while the findings carry the SUB-FIELD ids
   ("panelExistingCapacity","panelProposedCapacity"). The filter is now FIELD-AWARE: it matches
   a finding if any of the question's field ids (or the question id) appears in questionIds.
   This restores inline flagging for panel-rating-direction, same-capacity-rating-mismatch, and
   same-capacity-missing-existing on the compound screen. No state, keys, or hooks change.
   =================================================================================== */
/* V44.39 R1: field-aware ids for a question (compound questions expose sub-field ids). */
function questionConsistencyIds(q){
  return (q&&q.fields&&q.fields.length)?q.fields.map(function(f){return f.id;}):[q.id];
}
/* V45.6.9.9: selected-answer inline response (governed). Definitions above the choices stay with QuestionHelp.
   Falls back to ContextualQuestionResponse when no governed model; never renders an empty accordion. */
function inlineServiceAdequacyGuidance(q){
  if(S.projectType!=='panel'||!q||['panelIntent','panelExistingCapacity','panelCapacityCompare','panelProposedCapacity','panelLoads'].indexOf(q.id)<0)return '';
  if(typeof V457ServiceContextEngine==='undefined')return '';
  var f=Object.assign({projectType:S.projectType},S.answers||{}),svc=V457ServiceContextEngine.servicePotential(f);
  if(!svc||svc.status!=='eligible')return '';
  return '<aside class="consistency-notice v457-correctness v457-correctness--info v457-service-adequacy-inline" role="status" data-service-adequacy-guidance="true"><strong>Panel size does not confirm service adequacy</strong><p>'+esc(svc.text)+'</p></aside>';
}
function inlineAnswerResponse(q){
  var opts={skipped:S.skipped,invalidatedAnswers:S.invalidatedAnswers};
  var inner=(typeof ExplainableInsightCard!=='undefined'?ExplainableInsightCard.renderQuestion(S.projectType,S.answers,opts,q.id):'')
    +(typeof ProgressiveInsights!=='undefined'?ProgressiveInsights.forQuestion(q.id,S.projectType,S.answers,opts):'')
    +(typeof VisualExamples!=='undefined'?VisualExamples.forQuestion(q.id):'');
  inner+=inlineServiceAdequacyGuidance(q);
  if(typeof QuestionInlineResponseEngine!=='undefined'&&typeof QuestionInlineResponse!=='undefined'){
    var m=null;try{m=QuestionInlineResponseEngine.derive({projectType:S.projectType,question:q,answers:S.answers,skipped:S.skipped,invalidatedAnswers:S.invalidatedAnswers});}catch(err){m=null;}
    if(m)return QuestionInlineResponse.render(m,inner);
  }
  if(!String(inner).trim())return '';
  return typeof ContextualQuestionResponse!=='undefined'?ContextualQuestionResponse.render(q,inner):inner;
}
/* V45.6.10: per-option preview disclosure rendered after each choice card. Never selects or persists. */
function optionPreview(q,value){
  if(typeof QuestionInlineResponseEngine==='undefined'||typeof QuestionInlineResponse==='undefined'||S.questionIndex===0)return '';
  var p=null;try{p=QuestionInlineResponseEngine.preview({projectType:S.projectType,question:q,value:value,answers:S.answers});}catch(err){p=null;}
  return p?QuestionInlineResponse.renderPreview(p):'';
}
function step1(){
  var qs=activeQuestions(); var q=qs[S.questionIndex]; var body;
  var hasComprehensionHelp=(typeof QuestionHelp!=="undefined"&&QuestionHelp.questionIds(q.id).length>0);
  var whyShort=(function(w){w=String(w||"");var m=w.match(/^[\s\S]*?[.!?](?=\s|$)/);var one=(m?m[0]:w).trim();return (one&&one.length<w.trim().length)?one:"";})(q.why);
  if(q.type==="textarea"){
    var chips=(q.examples||[]).map(function(ex){return '<button class="chip" data-act="example" data-ex="'+esc(ex)+'">'+esc(ex)+'</button>';}).join("");
    body='<label class="sr" for="q">'+esc(q.label)+'</label><textarea id="q" data-act="answer" placeholder="'+esc(q.placeholder)+'">'+esc(S.answers[q.id]||"")+'</textarea>'+(chips?'<div class="qrow">'+chips+'</div>':'');
  }else if(q.type==="multichoice"){
    var selected=Array.isArray(S.answers[q.id])?S.answers[q.id]:[];
    body='<fieldset class="choice-fieldset choice-fieldset--compact choice-fieldset--checkbox"><legend class="sr">'+esc(q.label)+'</legend>'
      +q.options.map(function(o){var on=selected.indexOf(o)>=0;return '<label class="choice-radio choice-checkbox">'
        +'<input type="checkbox" name="'+esc(q.id)+'" value="'+esc(o)+'" data-act="multi-choice"'+(on?' checked':'')+'>'
        +'<span class="choice-radio__text"><strong class="choice-radio__title">'+esc(o)+'</strong></span></label>';}).join("")
      +'</fieldset>';
  }else if(q.type==="panelCompare"){
    body='<div class="panel-compare">'+q.fields.map(function(fld){var cur=S.answers[fld.id];
      return '<fieldset class="choice-fieldset choice-fieldset--compact panel-compare__field"><legend class="panel-compare__legend">'+esc(fld.legend||fld.label||fld.id)+'</legend>'
        +fld.options.map(function(o){var on=cur===o;return '<label class="choice-radio"><input type="radio" name="'+esc(fld.id)+'" value="'+esc(o)+'" data-act="compare-choice" data-answer-key="'+esc(fld.id)+'"'+(on?' checked':'')+'><span class="choice-radio__text"><strong class="choice-radio__title">'+esc(o)+'</strong></span></label>';}).join("")
        +'</fieldset>';}).join("")
      +'<p class="panel-compare__note muted small">The proposed size is what you\u2019re considering \u2014 it is not approved or necessarily required. Choose \u201cI\u2019m not sure\u201d for either value independently.</p></div>';
  }else{
    body=choiceRadioFieldset({
      name:q.id,
      legend:q.label,
      legendClassName:"sr",
      act:"choice",
      variant:q.variant||"compact",
      options:q.options.map(function(o){
        var item=(typeof o==="string")?{value:o,title:o}:o;
        return {value:item.value,title:item.title,desc:item.desc||"",illustration:item.illustration?aduTypeIllustration(item.illustration):"",checked:S.answers[q.id]===item.value,after:optionPreview(q,item.value)};
      })
    });
  }
  /* V44.39 R1: field-aware consistency filter (was q.id-only, which missed compound sub-fields). */
  var qIds=questionConsistencyIds(q);
  var related=consistencyFindings().filter(function(f){
    return (f.questionIds||[]).some(function(id){return qIds.indexOf(id)>=0;});
  });
  var consistencyNotice=related.length?('<aside class="consistency-notice" role="status"><strong>This may not match another answer</strong>'+related.map(function(f){return '<p>'+esc(f.detail)+'</p><p class="muted small">'+esc(f.ask)+'</p>';}).join("")+'</aside>'):'';
  var qFlags=(typeof requirementFlags==="function")?requirementFlags(S.projectType,q.id,S.answers):[];
  var qFlagNotice=qFlags.length?('<aside class="qflags" role="status" aria-label="Things to confirm about this choice">'+qFlags.map(function(fl){return '<div class="qflag qflag--'+fl.tone+'"><span class="qflag__icon" aria-hidden="true">'+icon(fl.tone==="caution"?"circle-help":"sparkles",16)+'</span><p>'+esc(fl.text)+'</p></div>';}).join('')+'<p class="qflags__note muted small">'+esc(typeof REQUIREMENT_FLAG_DISCLAIMER!=="undefined"?REQUIREMENT_FLAG_DISCLAIMER:"Illustrative guidance \u2014 confirmed through PG&E review.")+'</p></aside>'):'';
  var proj=PROJECT_TYPES.filter(function(p){return p.id===S.projectType;})[0];
  var restate=proj?('We think this may be <strong>'+esc(proj.title)+'</strong>. <button class="linkbtn" data-act="go" data-step="0">Change project type</button>'):'We\u2019ll only note what you tell us, and flag anything still unconfirmed.';
  /* V45.0: the existing property question is the sole Fast Facts question.
     Reuse its canonical answer and explicit Next control; do not create a second field. */
  if(S.questionIndex===0&&q.id==="property"&&typeof _pnFastFactsLoading!=="undefined"&&_pnFastFactsLoading)return '<section class="fast-facts insight-loading col" role="status" aria-live="polite" aria-label="Preparing project guidance"><span class="insight-loading__mark" aria-hidden="true"></span><h1 tabindex="-1">Preparing your project guidance</h1><p>We are organizing general information about the project type you selected. No property or utility review is taking place.</p></section>';
  if(S.questionIndex===0&&q.id==="property"&&S.fastFactsPhase==="results")return fastFactsResults();
  if(S.questionIndex===0&&q.id==="property"){
    ensureResidentialPropertyDefault();
    if(typeof _pnFastFactsLoading!=="undefined"&&!_pnFastFactsLoading){setTimeout(function(){
      if(S.step===1&&S.questionIndex===0&&S.fastFactsPhase!=="results"&&typeof startFastFactsLoading==="function")startFastFactsLoading();
    },0);}
    return '<section class="fast-facts insight-loading col" role="status" aria-live="polite" aria-label="Preparing project guidance"><span class="insight-loading__mark" aria-hidden="true"></span><h1 tabindex="-1">Preparing your project guidance</h1><p>We are organizing general information about the project type you selected.</p></section>';
  }
  var left='<div class="question-workspace"><div class="eyebrow question-workspace__eyebrow">A few questions</div>'+questionNavigator(qs)
    +'<div class="question-reading-pane"><div class="panel question-understanding-summary"><h2 class="mini">What we understand so far</h2><p>'+restate+'</p></div><div class="question-card-slot">'
    +'<div class="question-deck" role="region" aria-label="Current project question"><div class="question-deck__track"><article class="question-deck__card" data-question-card data-question-index="'+S.questionIndex+'" aria-labelledby="question-heading">'
    +'<div class="question-deck__position">Project detail</div><h1 class="big" id="question-heading" tabindex="-1">'+esc(q.label)+'</h1>'+(q.helper?'<p class="lede">'+esc(q.helper)+'</p>':'')
    +(!hasComprehensionHelp&&whyShort?'<p class="why-inline"><span class="why-inline__icon" aria-hidden="true">'+icon("circle-help",15)+'</span><span>'+esc(whyShort)+'</span></p>':'')
    +(!hasComprehensionHelp?'<button class="linkbtn whytoggle" data-act="togglewhy" aria-expanded="'+(S.whyOpen?'true':'false')+'">'+icon("circle-help",16)+'<span class="whytoggle__label">'+(whyShort?'More on why this matters':'Why this matters')+'</span></button><div class="miniwhy-shell '+(S.whyOpen?'is-open':'')+'" aria-hidden="'+(S.whyOpen?'false':'true')+'"><div class="miniwhy" '+(S.whyOpen?'':'inert')+'>'+esc(q.why)+'</div></div>':'')
    +(typeof QuestionHelp!=="undefined"?QuestionHelp.forQuestion(q.id):'')
    +'<div class="field">'+body+'</div>'+inlineAnswerResponse(q)
    +(typeof V457CorrectnessGuidance!=='undefined'?V457CorrectnessGuidance.forQuestion(S.projectType,S.answers,q.id):'')
    + consistencyNotice + qFlagNotice
    +'<div class="skiprow"><button class="skiplink" data-act="skip">Skip for now</button></div>'
    +'<div class="question-deck__controls" data-explicit-advance="true"><button class="question-deck__arrow question-deck__arrow--previous" data-act="deck-previous" aria-label="Previous question" '+(S.questionIndex===0?'disabled':'')+'>'+icon("arrow-left",22)+'<span>Previous</span></button><button class="question-deck__arrow question-deck__arrow--next" '+(S.questionIndex===qs.length-1?'onclick="event.stopPropagation();return startUnderstandingGeneration();"':'data-act="deck-next"')+' aria-label="'+(S.questionIndex===qs.length-1?'Build what we understand so far':'Next question')+'" '+(isQuestionResolved(q)?'':'disabled')+'><span>'+(S.questionIndex===qs.length-1?'Review what needs confirming':'Next')+'</span>'+icon("arrow-right",22)+'</button></div>'
    +'<div class="question-deck__footnotes"><p class="muted small">This is navigation only \u2014 we won\u2019t record an answer. We\u2019ll add it to <strong>Needs confirmation</strong> and show who may be able to answer it. If you have a view but aren\u2019t certain, choose \u201cI\u2019m not sure\u201d instead.</p>'+anxiety()+'</div>'
    +'</article></div><div class="sr" id="questionDeckStatus" aria-live="polite" aria-atomic="true">Current topic: '+esc(questionNavLabel(q))+'</div></div></div></div></div>';
  return '<section class="grid two question-email-layout">'+left+rail(interpret())+'</section>';
}

;

;

/* V45.1: static unavailable items cannot inherit radio, hover, focus or click behavior. */
function fastFactsPropertyChoices(){
  var choices=['Single-family home','Not sure'],unavailable=['Multi-family property','Commercial property'];
  return '<fieldset class="choice-fieldset fast-facts__choices"><legend class="sr">What type of property is this project for?</legend>'
    +choices.map(function(value){return '<label class="choice-radio fast-facts__choice"><input type="radio" name="property" value="'+esc(value)+'" data-act="choice"'+(S.answers.property===value?' checked':'')+'><span class="choice-radio__text"><strong class="choice-radio__title">'+esc(value)+'</strong></span></label>';}).join('')
    +unavailable.map(function(value){return '<div class="fast-facts__unavailable" role="note" aria-label="'+esc(value)+', coming soon"><strong>'+esc(value)+'</strong><span class="fast-facts__badge">Coming soon</span></div>';}).join('')+'</fieldset>';
}
function fastFactsResults(){
  if(!fastFactsEligible(S.answers.property)||['adu','panel'].indexOf(S.projectType)<0)return '<section class="fast-facts col"><h1 tabindex="-1">Preparing project guidance</h1><button class="btn primary" type="button" data-act="fast-facts-project">Change project type</button></section>';
  return FastInsights.render({projectType:S.projectType,property:S.answers.property,nextQuestion:questionsForProject(S.projectType)[1],answers:S.answers,skipped:S.skipped});
}
