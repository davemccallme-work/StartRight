/* ============================ V44.28.4 SHARED PREPARATION TEXT ============================
   Copy/download output derived from the same context used by the advisor and
   on-screen Living Preparation Plan. No generated conclusion is persisted. */
'use strict';
function preparationTextLines(items,empty){
  if(!items||!items.length)return '- '+empty;
  return items.map(function(item){
    var line='- '+item.title+(item.needsConfirmation?' [Needs confirmation]':'')+' - Who may help: '+item.who;
    if(item.note)line+=' - Your planning note (customer-authored): '+item.note;
    return line;
  }).join('\n');
}
function livingPlanningGuideText(){
  if(typeof createPreparationContext!=="function")throw new Error("Shared preparation context is unavailable");
  var c=createPreparationContext(S),next=c.recommendedNextAction||{},examples=[];
  if(c.projectType==='adu')Object.keys(ADU_DOCUMENT_EXAMPLES).forEach(function(k){examples.push('- '+k+' - illustrative examples available in Project Navigator.');});
  if(c.projectType==='panel')examples.push('- Service photos - illustrative examples available in Project Navigator.');
  return [
    'Questions to ask next:',
    preparationTextLines(c.questionsToAskNext,'No topics are currently labeled Ask next.'),
    '',
    'Your planning notes:',
    preparationTextLines(c.planningNotes,'No non-empty planning notes are grouped here yet.'),
    '',
    'Topics you may revisit:',
    preparationTextLines(c.topicsToRevisit,'No topics are currently labeled May revisit.'),
    '',
    'Recommended next action:',
    '- '+(next.action||'Review your current preparation plan.'),
    next.who?'- Who may help: '+next.who:'',
    next.after?'- Afterward: '+next.after:'',
    '',
    'Examples available in Project Navigator:',
    examples.length?examples.join('\n'):'- No scenario-specific examples are available for this illustrative route.',
    '',
    'Planning-note boundary: Notes are customer-authored and do not confirm requirements, eligibility, approval, or technical readiness. Examples are illustrative; nothing has been uploaded, reviewed, submitted, approved, or stored.',
    ''
  ].filter(function(line,index,all){return line!==''||index===0||all[index-1]!=='';}).join('\n');
}

function governedTimingText(context){var c=context||createPreparationContext(S),b=c.timingBenchmarks||[];if(!b.length)return 'Historical timing references:\n- No numerical timing benchmark is available for the current confirmed scenario and eligibility conditions.';return 'Historical timing references:\n'+b.map(function(x){var value=x.values?(x.values.pgeControlled+' PG&E-controlled and '+x.values.endToEnd+' end-to-end '+x.unit):(x.value+' '+x.unit);return '- '+value+' | Source: '+(x.sourceId||'governed source')+' | '+(x.disclosure||'Historical planning reference, not a quote or project commitment.');}).join('\\n');}

function summaryText(){
  if(typeof createPreparationContext!=="function")throw new Error("Shared preparation context is unavailable");
  var c=createPreparationContext(S),I=interpret(),next=c.recommendedNextAction||{};
  function list(values,empty){return (values&&values.length?values:[empty]).map(function(v){return '- '+v;}).join('\n');}
  var goal=(S.answers.description&&!notSure(S.answers.description))?['Your project goal, in your words:','- “'+S.answers.description+'”','']:[];
  var location=(S.answers.projectLocation&&String(S.answers.projectLocation).trim())?['Project location (as you entered it):','- '+String(S.answers.projectLocation).trim(),'']:[];
  var findings=(I.consistency||[]).map(function(f){return f.title+' - '+f.detail+' Ask '+f.who+': “'+f.ask+'”';});
  var confirmation=(c.questionsToAskNext||[]).filter(function(x){return x.needsConfirmation;}).map(function(x){return x.title+' - ask '+x.who;});
  var docs=[];
  if(S.projectType==='panel'){
    var g=panelDocumentGroups();
    function documentLines(label,values){return values.map(function(d){return '- '+label+': '+d.doc+' - '+d.trigger;});}
    docs=['Documents to discuss (confirm what applies):']
      .concat(documentLines('Usually needed',g.usually))
      .concat(documentLines('May be relevant based on your answers',g.matched))
      .concat(documentLines('Applicability not yet known',g.unknown))
      .concat(documentLines('Other conditional document',g.other))
      .concat(['']);
  }
  return [
    'Project Navigator - Your project preparation guide',
    'Built from your own words. Nothing has been submitted to PG&E.',
    ''
  ].concat(goal).concat(location).concat([
    'Recommended next action:',
    '- '+(next.action||'Review your current preparation plan.'),
    next.who?'- Who may help: '+next.who:'',
    next.why?'- Why it might matter: '+next.why:'',
    next.after?'- What to do afterward: '+next.after:'',
    '',
    'What you told us:',
    list(c.customerFacts,'No details provided yet'),
    '',
    'Our interpretation (not yet confirmed):',
    c.interpretation||'Still being clarified',
    '',
    'Needs confirmation (and who can confirm):',
    list(findings.concat(confirmation),'None currently identified'),
    '',
    livingPlanningGuideText(),
    'May be needed:',
    list(c.possibleNeeds,'Nothing conditional identified yet'),
    ''
  ]).concat(docs).concat([
    'Could affect timing:',
    list(c.timingConsiderations,'No timing factors identified yet'),
    '',
    governedTimingText(c),
    '',
    
    'Boundary: Preliminary planning guidance, not an application, approval, or formal PG&E determination.'
  ]).filter(function(line,index,all){return line!==''||index===0||all[index-1]!=='';}).join('\n');
}

;
