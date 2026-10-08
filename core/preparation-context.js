/* ============================ V44.28 SHARED PREPARATION CONTEXT ============================
   A derived, read-only guidance model shared by the preparation guide and advisor.
   This module does not persist state, mutate customer answers, determine requirements,
   or create application/project status. */
'use strict';
function preparationProjectTitle(state){
  var s=state||S,match=(PROJECT_TYPES||[]).filter(function(p){return p.id===s.projectType;})[0]||{};
  return match.title||s.projectType||'Your project';
}
function preparationRecord(kind,id){
  if(typeof planningRecord==='function')return planningRecord(kind,id);
  return {disposition:'ask-next',note:''};
}
function createPreparationContext(state){
  var s=state||S,I=(typeof deriveCustomerGuidance==="function"?deriveCustomerGuidance(s):interpret()),groups={questionsToAskNext:[],planningNotes:[],topicsToRevisit:[]};
  function add(kind,id,title,who,needsConfirmation,source){
    var r=preparationRecord(kind,id),item={
      id:id,kind:kind,title:title,who:who||'the appropriate project professional',
      note:r.note||'',disposition:r.disposition||'ask-next',
      needsConfirmation:!!needsConfirmation,source:source||'Project Navigator guidance'
    };
    if(item.disposition==='noted')groups.planningNotes.push(item);
    else if(item.disposition==='revisit')groups.topicsToRevisit.push(item);
    else groups.questionsToAskNext.push(item);
  }
  (I.confirmation||I.confirm||[]).forEach(function(label){var m=confirmMeta(label);add('confirm',label,label,m.who,true,'Needs confirmation');});
  (DECISIONS||[]).filter(function(d){return !d.appliesTo||d.appliesTo.indexOf(s.projectType)>=0;}).forEach(function(d){add('decision',d.id,d.title,decisionOwner(d),false,'Project Navigator suggestion');});
  return {
    projectType:s.projectType||'',scenarioId:I.scenarioId||'',projectTitle:preparationProjectTitle(s),
    customerFacts:(I.known||[]).slice(),interpretation:I.interpretation||I.projectLabel||'',
    questionsToAskNext:groups.questionsToAskNext,
    planningNotes:groups.planningNotes,
    topicsToRevisit:groups.topicsToRevisit,
    possibleNeeds:(I.possible||I.mayNeed||[]).slice(),timingConsiderations:(I.delays||I.timeline||[]).slice(),timingBenchmarks:(I.timingBenchmarks||[]).slice(),disclosures:(I.disclosures||[]).slice(),
    generalQuestions:(I.questions||[]).slice(),recommendedNextAction:{
      action:(I.recommendedNextAction||{}).action||I.recommendation||'',who:(I.recommendedNextAction||{}).who||I.owner||'',why:(I.recommendedNextAction||{}).why||I.why||'',after:(I.recommendedNextAction||{}).after||I.after||''
    }
  };
}
function preparationQuestionsByAudience(context){
  var c=context||createPreparationContext(),out={contractor:[],localAuthority:[],utility:[],customer:[],other:[]};
  c.questionsToAskNext.concat(c.topicsToRevisit).forEach(function(item){
    var who=String(item.who||'').toLowerCase(),key='other';
    if(/contractor|electrician|designer|engineer/.test(who))key='contractor';
    else if(/city|county|ahj|local/.test(who))key='localAuthority';
    else if(/pg&e|pge|utility/.test(who))key='utility';
    else if(/customer|homeowner|you/.test(who))key='customer';
    out[key].push(item);
  });
  return out;
}
function preparationAdvisorSuggestions(context){
  var c=context||createPreparationContext(),items=['Help me prepare my next conversation','Explain what remains unconfirmed','What information should I bring?'];
  if(c.projectType==='panel')items.splice(1,0,'What should I ask my electrician?');
  if(c.projectType==='adu')items.splice(1,0,'What should I ask the city or county?');
  return items;
}
function findPreparationTopic(context,query){
  var c=context||createPreparationContext(),needle=String(query||'').toLowerCase();
  if(!needle)return null;
  var all=c.questionsToAskNext.concat(c.planningNotes,c.topicsToRevisit);
  for(var i=0;i<all.length;i++){
    var item=all[i],hay=(item.title+' '+item.who+' '+item.note).toLowerCase();
    if(hay.indexOf(needle)>=0||needle.indexOf(String(item.title).toLowerCase())>=0)return item;
  }
  return null;
}
if(typeof module!=='undefined'&&module.exports)module.exports={
  createPreparationContext:createPreparationContext,
  preparationQuestionsByAudience:preparationQuestionsByAudience,
  preparationAdvisorSuggestions:preparationAdvisorSuggestions,
  findPreparationTopic:findPreparationTopic
};

;
