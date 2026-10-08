/* ============================ state.js — Project Navigator V44 ============================
   Application state (S), draft autosave/restore, interpret() using the six preparation states,
   routeProjectType() (V44: ADU anchor + JADU/second-meter recognition), and shared helpers
   (esc/term/toast). Loaded after data.js. */

var S = {step:0, projectType:"", projectTypeConfirmed:false,
  answers:{description:"",projectLocation:"",aduType:"",aduAddressStatus:"",aduMeterServiceIntent:"",aduServiceMethod:"",aduAdjacentService:"",panelIntent:"",panelExistingCapacity:"",panelServiceMethod:"",panelProposedCapacity:"",panelLoads:[],property:"",energy:"",timing:""},
  questionIndex:0, fastFactsPhase:"question", highestReachedQuestion:0, skipped:[], rejected:[], highestReachedStep:0,
  answerSources:{property:""},
  whyOpen:false, openDecision:"", discoverText:"", discoverCandidates:[], discoverClarify:false,
  activeCustomerQuery:"", progressiveOpen:{}, planningRecords:{}, invalidatedAnswers:{}, answerStates:{}, provenanceStates:{}, decisionRecords:{}, exportReviewDecisions:{}, recognitionReview:{sourceText:"",candidates:[],rejected:[],open:false,confirmedByCustomer:false}};

/* ---- shared customer-owned planning records ------------------------------------- */
function normalizePlanningDisposition(value){return value==="answered"?"noted":value==="set-aside"?"revisit":value==="open"?"ask-next":value||"ask-next";}
function planningRecordKey(kind,id){return String(kind||"topic")+"::"+String(id||"");}
function planningRecord(kind,id){S.planningRecords=S.planningRecords||{};var rec=S.planningRecords[planningRecordKey(kind,id)]||{disposition:"ask-next",note:""};return {disposition:normalizePlanningDisposition(rec.disposition||rec.status),note:rec.note||""};}
function setPlanningRecord(kind,id,patch){S.planningRecords=S.planningRecords||{};var key=planningRecordKey(kind,id),old=planningRecord(kind,id);S.planningRecords[key]={disposition:normalizePlanningDisposition((patch&&patch.disposition)||old.disposition),note:(patch&&Object.prototype.hasOwnProperty.call(patch,"note"))?String(patch.note||""):old.note};return S.planningRecords[key];}
function planningDispositionLabel(value){value=normalizePlanningDisposition(value);return value==="noted"?"I added a note":value==="revisit"?"Review later":"Question to ask";}

/* ---- draft-form review decisions -----------------------------------------------
   Customer-controlled and reversible. A decision is valid only while its source value matches. */
function exportReviewDecisionKey(route,logicalField){return String(route||'')+'::'+String(logicalField||'');}
function exportReviewSourceSnapshot(value){return JSON.stringify(value==null?null:value);}
function exportReviewDecision(route,logicalField,currentValue){
  S.exportReviewDecisions=S.exportReviewDecisions||{};var rec=S.exportReviewDecisions[exportReviewDecisionKey(route,logicalField)];
  if(!rec||rec.sourceSnapshot!==exportReviewSourceSnapshot(currentValue))return '';
  return rec.decision==='include'||rec.decision==='leave-blank'?rec.decision:'';
}
function setExportReviewDecision(route,logicalField,decision,currentValue){
  S.exportReviewDecisions=S.exportReviewDecisions||{};var key=exportReviewDecisionKey(route,logicalField);
  if(decision!=='include'&&decision!=='leave-blank'){delete S.exportReviewDecisions[key];return '';}
  S.exportReviewDecisions[key]={decision:decision,sourceSnapshot:exportReviewSourceSnapshot(currentValue)};return decision;
}
function clearIncompatibleExportReviewDecisions(route){
  S.exportReviewDecisions=S.exportReviewDecisions||{};Object.keys(S.exportReviewDecisions).forEach(function(key){if(key.indexOf(String(route||'')+'::')!==0)delete S.exportReviewDecisions[key];});
}
var ANSWER_DEPENDENCIES={panelIntent:{"Replace the panel at the same capacity":["panelProposedCapacity"],"Relocate the panel":["panelProposedCapacity"]},aduMeterServiceIntent:{"Use the existing meter and service":["aduServiceMethod","aduAdjacentService"]}};
function invalidateDependentAnswers(id,value){var ids=(ANSWER_DEPENDENCIES[id]&&ANSWER_DEPENDENCIES[id][value])||[];ids.forEach(function(x){S.answers[x]=Array.isArray(S.answers[x])?[]:"";var i=S.skipped.indexOf(x);if(i>=0)S.skipped.splice(i,1);});}
function setCanonicalAnswer(id,value){invalidateDependentAnswers(id,value);S.answers[id]=value;recomputeRuntimeState();if(typeof InsightInstrumentation!=='undefined')InsightInstrumentation.answerChanged(id);return value;}
/* ---- project-type transition hygiene ---------------------------------------------
   Shared customer answers remain available, but scenario-specific answers, skips, and
   transient disclosures are cleared when their owning route is left. */
var PANEL_ANSWER_IDS=["panelIntent","panelExistingCapacity","panelServiceMethod","panelProposedCapacity","panelLoads"];
var ADU_ANSWER_IDS=["aduType","aduAddressStatus","aduMeterServiceIntent","aduServiceMethod","aduAdjacentService"];
function resetAnswerIds(ids){ids.forEach(function(id){S.answers[id]=(id==="panelLoads")?[]:"";var i=S.skipped.indexOf(id);if(i>=0)S.skipped.splice(i,1);});}
function setProjectType(nextType){
  nextType=String(nextType||"");var previous=S.projectType;
  if(previous&&previous!==nextType){
    if(previous==="panel")resetAnswerIds(PANEL_ANSWER_IDS);
    if(previous==="adu")resetAnswerIds(ADU_ANSWER_IDS);
  }
  S.projectType=nextType;S.projectTypeConfirmed=!!nextType;S.fastFactsPhase="question";S.questionIndex=0;S.highestReachedQuestion=0;S.rejected=[];S.highestReachedStep=0;S.whyOpen=false;S.openDecision="";S.planningRecords={};S.decisionRecords={};clearIncompatibleExportReviewDecisions(nextType);recomputeRuntimeState();
  if(typeof panelPhotoExamplesOpen!=="undefined")panelPhotoExamplesOpen=false;
  if(typeof aduDocumentExampleOpen!=="undefined")aduDocumentExampleOpen="";
  if(typeof document!=="undefined"&&document.body)document.body.classList.remove("photo-examples-open");
}

function recomputeRuntimeState(){return typeof RecomputationPipeline!=="undefined"?RecomputationPipeline.apply(S):null;}
/* ---- draft autosave (this-device only) ---- */
var DRAFT_KEY = "pnV44Draft";
var DRAFT_SCHEMA = "v44.2";
var DRAFT_RUNTIME_VERSION = "V44.48";
var LEGACY_DRAFT_SCHEMAS = ["v44","v44.1"];
var storageOK = (function(){try{localStorage.setItem("__p","1");localStorage.removeItem("__p");return true;}catch(e){return false;}})();
var draftSaved = false, draftRestored = false, saveTimer = null;
function currentQuestionId(){var qs=questionsForProject(S.projectType),q=qs[S.questionIndex];return q&&q.id?q.id:"";}
function serializeDraft(){return {schema:DRAFT_SCHEMA,runtimeVersion:DRAFT_RUNTIME_VERSION,fastFactsPhase:S.fastFactsPhase,projectType:S.projectType,answers:S.answers,skipped:S.skipped,rejected:S.rejected,invalidatedAnswers:S.invalidatedAnswers||{},step:S.step,questionId:currentQuestionId(),questionIndex:S.questionIndex,highestReachedQuestion:S.highestReachedQuestion,highestReachedStep:S.highestReachedStep,progressiveOpen:S.progressiveOpen,planningRecords:S.planningRecords,exportReviewDecisions:S.exportReviewDecisions,discoverText:S.discoverText,activeCustomerQuery:S.activeCustomerQuery,answerSources:S.answerSources||{}};}
function persistDraft(explicit){
  if(!storageOK){updateSaveStatus("error");return false;}
  try{localStorage.setItem(DRAFT_KEY,JSON.stringify(serializeDraft()));draftSaved=true;if(explicit)draftRestored=false;updateSaveStatus("saved");
    if(explicit)toast("Saved on this device only — so you can return later. No application was started or submitted.");return true;}
  catch(e){updateSaveStatus("error");return false;}
}
function scheduleDraftSave(){if(saveTimer)clearTimeout(saveTimer);saveTimer=setTimeout(function(){saveTimer=null;persistDraft(false);},600);}
function migrateDraft(raw){
  if(!raw||typeof raw!=="object"||Array.isArray(raw))return null;
  if(raw.schema!==DRAFT_SCHEMA&&LEGACY_DRAFT_SCHEMAS.indexOf(raw.schema)<0)return null;
  var d=Object.assign({},raw),runtimeChanged=d.runtimeVersion!==DRAFT_RUNTIME_VERSION;d.schema=DRAFT_SCHEMA;d.runtimeVersion=DRAFT_RUNTIME_VERSION;d.resetTransientNavigation=runtimeChanged;
  if(!d.answers||typeof d.answers!=="object"||Array.isArray(d.answers))d.answers={};
  if(!d.answerSources||typeof d.answerSources!=="object"||Array.isArray(d.answerSources))d.answerSources={};
  if(!Array.isArray(d.skipped))d.skipped=[];if(!Array.isArray(d.rejected))d.rejected=[];if(!d.invalidatedAnswers||typeof d.invalidatedAnswers!=="object"||Array.isArray(d.invalidatedAnswers))d.invalidatedAnswers={};
  if(!d.planningRecords||typeof d.planningRecords!=="object"||Array.isArray(d.planningRecords))d.planningRecords={};
  if(!d.exportReviewDecisions||typeof d.exportReviewDecisions!=="object"||Array.isArray(d.exportReviewDecisions))d.exportReviewDecisions={};
  return d;
}
function restoredQuestionIndex(d,questions){
  if(d.questionId){for(var i=0;i<questions.length;i++)if(questions[i].id===d.questionId)return i;}
  return typeof d.questionIndex==="number"&&d.questionIndex>=0&&d.questionIndex<questions.length?d.questionIndex:0;
}
function loadDraft(){
  if(!storageOK)return false;var raw=null;
  try{raw=JSON.parse(localStorage.getItem(DRAFT_KEY));}catch(e){return false;}
  var d=migrateDraft(raw);if(!d)return false;
  var nextAnswers=Object.assign({},S.answers,d.answers),nextProjectType=String(d.projectType||"");
  if(!Array.isArray(nextAnswers.panelLoads))nextAnswers.panelLoads=[];nextAnswers.panelLoads=normalizePanelLoads(nextAnswers.panelLoads);
  if(nextAnswers.panelIntent!=="Increase the panel capacity")nextAnswers.panelProposedCapacity="";
  S.projectType=nextProjectType;S.projectTypeConfirmed=!!nextProjectType;S.answers=nextAnswers;S.answerSources=d.answerSources||{};
  S.skipped=d.skipped.slice();S.rejected=d.rejected.slice();S.step=d.resetTransientNavigation?0:((d.step>=0&&d.step<=4)?d.step:0);
  var restoredQuestions=questionsForProject(S.projectType);S.questionIndex=d.resetTransientNavigation?0:restoredQuestionIndex(d,restoredQuestions);
  S.fastFactsPhase=(!d.resetTransientNavigation&&S.step===1&&S.questionIndex===0&&d.fastFactsPhase==="results"&&fastFactsEligible(S.answers.property))?"results":"question";
  if(S.step>=1&&!fastFactsEligible(S.answers.property)){S.step=1;S.questionIndex=0;S.fastFactsPhase="question";}
  S.highestReachedQuestion=Math.max(S.questionIndex,typeof d.highestReachedQuestion==="number"?d.highestReachedQuestion:S.questionIndex);
  S.highestReachedStep=(typeof d.highestReachedStep==="number")?d.highestReachedStep:S.step;
  S.progressiveOpen=(d.progressiveOpen&&typeof d.progressiveOpen==="object"&&!Array.isArray(d.progressiveOpen))?d.progressiveOpen:{};
  S.planningRecords=d.planningRecords;S.exportReviewDecisions=d.exportReviewDecisions;clearIncompatibleExportReviewDecisions(S.projectType);
  Object.keys(S.planningRecords).forEach(function(key){var rec=S.planningRecords[key]||{};S.planningRecords[key]={disposition:normalizePlanningDisposition(rec.disposition||rec.status),note:rec.note||""};});
  S.decisionRecords={};S.discoverText=d.discoverText||"";S.activeCustomerQuery=d.activeCustomerQuery||"";
  draftSaved=true;draftRestored=true;return true;
}
function updateSaveStatus(){
  var el=document.getElementById("saveStatus");if(!el)return;
  /* Push 3: clearer local save/restore comprehension \u2014 emphasize this-device-only storage and
     how to return, without implying any PG&E submission. Copy only. */
  var label = !storageOK ? "Not saved \u2014 this browser is blocking on-device storage"
    : draftSaved ? (draftRestored?"We restored your saved answers from this device.":"Saved on this device \u2014 reopen here to continue")
    : "Not saved yet \u2014 your progress stays on this device only";
  var state = !storageOK ? "error" : draftSaved ? "saved" : "idle";
  el.setAttribute("data-state",state);
  var msg=el.querySelector(".save-status__message")||el; msg.textContent=label;
}
function save(){persistDraft(true);}
function clearCustomerWorkspace(){
  if(saveTimer){clearTimeout(saveTimer);saveTimer=null;}
  if(storageOK){try{localStorage.removeItem(DRAFT_KEY);}catch(e){}}
  var fresh={step:0,projectType:"",projectTypeConfirmed:false,
    answers:{description:"",projectLocation:"",aduType:"",aduAddressStatus:"",aduMeterServiceIntent:"",aduServiceMethod:"",aduAdjacentService:"",panelIntent:"",panelExistingCapacity:"",panelServiceMethod:"",panelProposedCapacity:"",panelLoads:[],property:"",energy:"",timing:""},
    answerSources:{property:""},
    questionIndex:0,fastFactsPhase:"question",highestReachedQuestion:0,skipped:[],rejected:[],highestReachedStep:0,
    whyOpen:false,openDecision:"",discoverText:"",discoverCandidates:[],discoverClarify:false,
    activeCustomerQuery:"",progressiveOpen:{},planningRecords:{},decisionRecords:{},exportReviewDecisions:{}, recognitionReview:{sourceText:"",candidates:[],rejected:[],open:false,confirmedByCustomer:false}};
  Object.keys(S).forEach(function(key){delete S[key];});
  Object.keys(fresh).forEach(function(key){S[key]=fresh[key];});
  draftSaved=false;draftRestored=false;
  if(typeof applicationExportReviewOpen!=="undefined")applicationExportReviewOpen=false;
  if(typeof panelPhotoExamplesOpen!=="undefined")panelPhotoExamplesOpen=false;
  if(typeof aduDocumentExampleOpen!=="undefined")aduDocumentExampleOpen="";
  if(typeof pnHistory!=="undefined")pnHistory.length=0;
  if(typeof ArrivalScene!=="undefined"&&ArrivalScene){ArrivalScene.channel=null;ArrivalScene.view="selector";ArrivalScene.assistantPrompt=null;}
  if(typeof document!=="undefined"&&document.body)document.body.classList.remove("photo-examples-open");
  updateSaveStatus();
  return true;
}

/* ---- step reachability (prerequisite based; guidance not workflow) ---- */
var DEFAULT_RESIDENTIAL_PROPERTY="Single-family home";
function ensureResidentialPropertyDefault(){
  if(S.projectType!=="adu"&&S.projectType!=="panel")return false;
  if(fastFactsEligible(S.answers.property))return false;
  setCanonicalAnswer("property",DEFAULT_RESIDENTIAL_PROPERTY);
  S.answerSources=S.answerSources||{};S.answerSources.property="prototype-default";
  var i=S.skipped.indexOf("property");if(i>=0)S.skipped.splice(i,1);
  return true;
}
function fastFactsEligible(value){return value===DEFAULT_RESIDENTIAL_PROPERTY||value==="Not sure";}
function derivedEnergyNeed(a){a=a||S.answers||{};if(S.projectType==="adu"){
  if(a.aduMeterServiceIntent==="Add a separate service connection")return "New electric service";
  if(a.aduMeterServiceIntent==="Add a separate meter")return "A separate meter or service";
  if(a.aduMeterServiceIntent==="Use the existing meter and service")return "More electrical capacity";
 }if(S.projectType==="panel"){
  if(a.panelIntent==="Increase the panel capacity")return "More electrical capacity";
  if(a.panelIntent==="Add electrical equipment; panel change not decided")return "More electrical capacity";
 }return "Not sure yet";}

function isQuestionResolved(q){if(!q)return false;if(q.id==="property"&&!fastFactsEligible(S.answers.property))return false;
  if(q.fields&&q.fields.length){var allSet=q.fields.every(function(f){var fv=S.answers[f.id];return Array.isArray(fv)?fv.length>0:!!(fv&&String(fv).trim());});return allSet||S.skipped.indexOf(q.id)>=0;}
  var v=S.answers[q.id];var has=Array.isArray(v)?v.length>0:!!(v&&String(v).trim());return has||S.skipped.indexOf(q.id)>=0;}
function setAnswer(questionId,value){S.answers[questionId]=value;var i=S.skipped.indexOf(questionId);if(i>=0)S.skipped.splice(i,1);if(typeof InsightInstrumentation!=='undefined')InsightInstrumentation.answerChanged(questionId);return value;}
function activeQuestions(){return questionsForProject(S.projectType);}
function allQuestionsResolved(){return activeQuestions().every(isQuestionResolved);}
function highestReachable(){
  if(!S.projectTypeConfirmed)return 0;
  var r=1; if(allQuestionsResolved())r=2;
  if(S.highestReachedStep>=2)r=Math.max(r,3);
  if(S.highestReachedStep>=3)r=Math.max(r,4);
  return r;
}
function isStepReachable(step){if(step>1&&!fastFactsEligible(S.answers.property))return false;if(step<=0)return true;return step<=Math.max(highestReachable(),S.highestReachedStep);}
function markReached(step){if(step>S.highestReachedStep)S.highestReachedStep=step;}

function navigateToStep(step){
  step=Math.max(0,Math.min(4,step));
  if(step>1&&!fastFactsEligible(S.answers.property)){toast("Choose an available property type first.");return false;}
  if(step>0&&!S.projectTypeConfirmed){toast("Pick what you\u2019re planning first, then you can move between topics.");return false;}
  if(!isStepReachable(step)){toast("Finish the earlier topic first.");return false;}
  _pnNavDir=(step<S.step)?"back":"forward";
  if(step===1&&!fastFactsEligible(S.answers.property)){S.questionIndex=0;S.fastFactsPhase="question";}
  S.step=step;S.whyOpen=false;markReached(step);render();return true;
}
function continueFromUnderstanding(){
  if(S.step!==2)return false;
  var previous=(typeof pnNavigationSnapshot==="function")?pnNavigationSnapshot():null;
  _pnNavDir="forward";_pnRenderIntent="state";S.step=3;S.whyOpen=false;markReached(3);render();
  if(typeof pnRecordBrowserNavigation==="function")pnRecordBrowserNavigation(previous);
  scheduleDraftSave();try{window.scrollTo(0,0);}catch(e){}return false;
}
function navigateToQuestion(i){var qs=activeQuestions();i=Math.max(0,Math.min(qs.length-1,i));if(i>0&&!fastFactsEligible(S.answers.property)){i=0;S.fastFactsPhase="question";}_pnNavDir=(i<S.questionIndex)?"back":"forward";S.step=1;S.questionIndex=i;S.highestReachedQuestion=Math.max(S.highestReachedQuestion||0,i);S.whyOpen=false;markReached(1);render();}

/* ============================ INTERPRET (six preparation states, no scoring) ============================ */
function notSure(v){return !v||String(v).toLowerCase().indexOf("not sure")>=0;}
function exactAmp(v){var m=String(v||"").match(/^(\d+) amps$/i);return m?parseInt(m[1],10):null;}
function normalizePanelLoads(values){
  var list=Array.isArray(values)?values.filter(Boolean):[];
  var exclusive=["No added equipment","I’m not sure"];
  var specific=list.filter(function(x){return exclusive.indexOf(x)<0;});
  if(specific.length)return specific.filter(function(x,i,a){return a.indexOf(x)===i;});
  if(list.indexOf("I’m not sure")>=0)return ["I’m not sure"];
  if(list.indexOf("No added equipment")>=0)return ["No added equipment"];
  return [];
}
function finding(id,title,detail,who,ask,questionIds,kind){return {id:id,title:title,detail:detail,who:who,ask:ask,questionIds:questionIds||[],kind:kind||"tension"};}
function consistencyFindings(){
  var a=S.answers,out=[],energyContext=derivedEnergyNeed(a),existing=exactAmp(a.panelExistingCapacity),proposed=exactAmp(a.panelProposedCapacity);
  if(S.projectType==="panel"){
    if(a.panelIntent==="Increase the panel capacity"&&existing!==null&&proposed!==null&&proposed<=existing){
      out.push(finding("panel-rating-direction","Panel intent and ratings may not align","You selected an increase, but the capacity being considered is not higher than the existing main-breaker rating.","A licensed electrician","Confirm both ratings and whether the intended scope is an increase, a same-capacity replacement, or another change.",["panelExistingCapacity","panelProposedCapacity"],"conflict"));
    }
    if(a.panelIntent==="Replace the panel at the same capacity"&&notSure(a.panelExistingCapacity)){
      out.push(finding("same-capacity-missing-existing","The existing rating is needed to confirm a same-capacity replacement","The replacement cannot be compared with the existing panel until the existing main-breaker rating is confirmed.","A licensed electrician","Confirm the existing main-breaker rating and whether the replacement will keep the same capacity.",["panelIntent","panelExistingCapacity"],"dependency"));
    }
    if(a.panelIntent==="Replace the panel at the same capacity"&&existing!==null&&proposed!==null&&existing!==proposed){
      out.push(finding("same-capacity-rating-mismatch","The saved ratings do not match a same-capacity replacement","A saved proposed rating differs from the existing main-breaker rating.","A licensed electrician","Confirm the intended scope and both ratings.",["panelIntent","panelExistingCapacity","panelProposedCapacity"],"conflict"));
    }
    var loads=normalizePanelLoads(a.panelLoads),specific=loads.filter(function(x){return x!=="No added equipment"&&x!=="I’m not sure";});
    if(a.panelIntent==="Replace the panel at the same capacity"&&specific.length){
      out.push(finding("same-capacity-added-load","Added equipment may change the like-for-like scope","You selected a same-capacity replacement and also listed added electrical equipment.","A licensed electrician","Ask whether the added equipment changes the scope or requires a load calculation.",["panelIntent","panelLoads"],"tension"));
    }
    if(a.panelIntent==="Increase the panel capacity"&&energyContext==="A separate meter or service"){
      out.push(finding("panel-intent-meter-service","The Panel route and meter/service answer may describe different scopes","You selected a panel-capacity increase and also selected a separate meter or service as a possible need.","PG&E and a licensed electrician","Confirm whether this is primarily a panel-capacity project, an added-meter/service project, or both.",["panelIntent","energy"],"tension"));
    }
    if(a.panelIntent==="Replace the panel at the same capacity"&&energyContext==="More electrical capacity"){
      out.push(finding("same-capacity-general-capacity","The detailed Panel intent and general capacity answer may not align","You selected a same-capacity replacement and also selected more electrical capacity as a possible need.","A licensed electrician","Clarify whether capacity is staying the same or increasing.",["panelIntent","energy"],"tension"));
    }
  }
  /* V45.7.1: canonical ADU compatibility is derived and non-blocking. It participates in the
     existing field-aware consistency notice and Needs confirmation flow; it never rewrites answers. */
  if(S.projectType==="adu"&&typeof V457CorrectnessEngine!=="undefined"){
    var aduCheck=V457CorrectnessEngine.aduCompatibility(a);
    if(aduCheck.status==="incompatible"){
      out.push(finding("adu-detached-address-service-conflict","These ADU answers need confirmation",aduCheck.detail,"Your city or county and PG&E",aduCheck.ask,["aduType","aduAddressStatus","aduMeterServiceIntent"],"conflict"));
    }else if(aduCheck.reasonCode==="ADDRESS_UNCONFIRMED"&&aduCheck.suppressAffirmativeServiceGuidance){
      out.push(finding("adu-second-service-address-unconfirmed","Address status remains unconfirmed","A separate-service recommendation cannot be relied on until the address status is confirmed.","Your city or county and PG&E","Confirm whether a separate address has been assigned before relying on the separate-service path.",["aduAddressStatus","aduMeterServiceIntent"],"dependency"));
    }
  }
  var described=routeProjectType(a.description||"");
  if(S.projectTypeConfirmed&&described&&described!==S.projectType){
    var d=(PROJECT_TYPES.filter(function(x){return x.id===described;})[0]||{}).title||described;
    var chosen=(PROJECT_TYPES.filter(function(x){return x.id===S.projectType;})[0]||{}).title||S.projectType;
    out.push(finding("description-route-mismatch","Your description and selected starting point may differ","Your description sounds like "+d+", while the selected starting point is "+chosen+".","You, with the appropriate contractor or advisor","Confirm which starting point best matches the work you are planning.",["description"],"tension"));
  }
  activeQuestions().forEach(function(q){var v=a[q.id];var uncertain=Array.isArray(v)?v.indexOf("I’m not sure")>=0:notSure(v);if(v&&uncertain&&S.skipped.indexOf(q.id)<0){out.push(finding("uncertain-"+q.id,q.label+" remains unconfirmed","You selected an uncertain answer for this question.","The person identified for the related confirmation item","Confirm the answer before relying on it for project planning.",[q.id],"dependency"));}});
  return out;
}
function panelDocumentGroups(){
  var req=docReqFor("panel"),a=S.answers;if(!req)return {usually:[],matched:[],unknown:[],other:[]};
  var usually=req.baseline.filter(function(d){return d.trigger==="Always";});
  var unknown=[],matched=[],other=[];
  req.baseline.filter(function(d){return d.trigger!=="Always";}).forEach(function(d){
    if(d.doc==="Overhead service photos"){
      if(a.panelServiceMethod==="Overhead service")matched.push(d);
      else if(a.panelServiceMethod==="Underground service")other.push(d);
      else unknown.push(d);
    }else unknown.push(d);
  });
  var existing=exactAmp(a.panelExistingCapacity),proposed=exactAmp(a.panelProposedCapacity),loads=normalizePanelLoads(a.panelLoads);
  req.conditional.forEach(function(d){var yes=false,know=true;
    if(d.doc==="Scaled exterior elevation plan"){know=existing!==null&&proposed!==null;yes=know&&existing===100&&proposed>=200;}
    else if(d.doc==="Panel cut sheet"){know=proposed!==null||String(a.panelProposedCapacity).toLowerCase().indexOf("400 amps or more")>=0;yes=(proposed!==null&&proposed>=320)||String(a.panelProposedCapacity).toLowerCase().indexOf("400 amps or more")>=0;}
    else if(d.doc==="Single-line diagram (SLD)"){know=proposed!==null||String(a.panelProposedCapacity).toLowerCase().indexOf("400 amps or more")>=0;yes=(proposed!==null&&proposed>=400)||String(a.panelProposedCapacity).toLowerCase().indexOf("400 amps or more")>=0;}
    else if(d.doc==="Building permit"){know=true;yes=loads.indexOf("Solar or battery")>=0;}
    else if(d.doc==="Panel release from AHJ"){know=false;}
    if(yes)matched.push(d);else if(!know)unknown.push(d);else other.push(d);
  });return {usually:usually,matched:matched,unknown:unknown,other:other};
}
function interpret(){
  var base=GUIDANCE[S.projectType]||GUIDANCE.unsure; var a=S.answers;
  if(S.projectType==="panel")a.panelLoads=normalizePanelLoads(a.panelLoads);
  var knownValues=[a.description];
  if(S.projectType==="adu"){knownValues.push(a.aduType);knownValues.push(a.aduAddressStatus);knownValues.push(a.aduMeterServiceIntent);knownValues.push(a.aduServiceMethod);knownValues.push(a.aduAdjacentService);}
  if(S.projectType==="panel"){
    knownValues.push(typeof panelIntentDisplay==="function"?panelIntentDisplay(a.panelIntent):a.panelIntent);
    knownValues.push(a.panelServiceMethod);
    knownValues.push(a.panelExistingCapacity?"Existing main breaker: "+a.panelExistingCapacity:"");
    if(a.panelIntent==="Increase the panel capacity")knownValues.push(a.panelProposedCapacity?"Capacity being considered: "+a.panelProposedCapacity:"");
    if(Array.isArray(a.panelLoads)&&a.panelLoads.length)knownValues.push("Equipment or load selected: "+a.panelLoads.join(", "));
  }
  knownValues=knownValues.concat([a.timing]);
  var known=knownValues.filter(function(v){return !notSure(v);});
  var resolved=!notSure(derivedEnergyNeed(a));
  var recommendation=base.recommendation,why=base.why,owner=base.owner,after=base.after;
  if(S.projectType==="panel"){
    if(a.panelIntent==="Increase the panel capacity"){
      recommendation="Ask a licensed electrician to calculate how much electrical power your project will need before choosing a panel or service size.";
      why="The existing rating, proposed capacity, and equipment list are planning inputs. A load calculation and field review are needed before anyone determines whether the panel or utility service must change.";
      owner="You and a licensed electrician";
      after="Then compare the existing-panel option, right-sized equipment, load management, and any panel or service change that may need confirmation.";
    }else if(a.panelIntent==="Replace the panel at the same capacity"){
      recommendation="Confirm that the work is truly a like-for-like replacement before selecting equipment.";
      why="A same-capacity replacement may follow a different path, but relocation, added equipment, solar, battery, or other scope changes can add questions that need confirmation.";
      owner="You and a licensed electrician";
      after="Then confirm permits and whether any part of the scope requires PG&E involvement.";
    }else if(a.panelIntent==="Relocate the panel"){
      recommendation="Confirm the proposed location, clearance, and service path before selecting replacement equipment.";
      why="Relocation can affect local requirements and the connection path, but the customer-provided intent alone does not determine whether utility service work is required.";
      owner="You and a licensed electrician";
      after="Then confirm the proposed layout with your city or county and ask PG&E whether the service connection is affected.";
    }else{
      recommendation="Photograph the existing main breaker and rating label, list planned equipment, and review the scope with a licensed electrician.";
      why="Those details help distinguish a capacity increase, like-for-like replacement, relocation, or another scope without assuming the technical outcome.";
      owner="You and a licensed electrician";
      after="Then identify which load, permit, equipment, and utility questions still need confirmation.";
    }
  }
  var confirm=base.confirmations.slice();
  if(S.projectType==="adu"){
    if(!a.aduMeterServiceIntent||a.aduMeterServiceIntent==="I’m not sure")confirm.unshift("Meter and service arrangement");
    if(a.aduMeterServiceIntent==="Add a separate service connection")confirm.unshift("Whether a separate service connection applies");
    if(a.aduMeterServiceIntent==="Add a separate meter")confirm.unshift("Whether a separate meter applies");
  }
  confirm=confirm.filter(function(x,i,list){return list.indexOf(x)===i&&S.rejected.indexOf(x)<0;});
  /* skipped answers stay visible under Needs confirmation */
  var deferred=S.skipped.map(function(id){return activeQuestions().filter(function(q){return q.id===id;})[0];}).filter(Boolean).map(function(q){return q.label;});
  return {
    known:known,
    projectLabel:notSure(base.known)?"":base.known,
    confirm:confirm,                 /* Needs confirmation */
    deferred:deferred,               /* skipped -> Needs confirmation */
    mayNeed:base.confirmations.filter(function(c){return resolved&&/capacity|service|load/i.test(c);}), /* May be needed */
    timeline:base.timeline,          /* Could affect timing */
    questions:base.questions,        /* Question to ask */
    recommendation:recommendation, why:why, owner:owner, after:after, next:base.next, consistency:consistencyFindings()
  };
}

/* ============================ routeProjectType (V44) ============================
   ADU is the anchor. Recognize JADU, second-meter/second-service, and common ADU synonyms so
   plain-language descriptions route to the ADU journey. ADU is tested FIRST. "service upgrade"
   (a panel phrase) does NOT trip ADU: the ADU branch matches "separate service", not bare "service". */
function routeProjectType(text){var t=String(text).toLowerCase();
  if(/\b(adu|jadu|junior adu|granny|in.?law|second unit|mother.?in|casita|dwelling|backyard cottage|second meter|separate meter|separate service|additional unit|rental unit|guest house)\b/.test(t))return "adu";
  if(/\b(solar|battery|batteries|\bpv\b|storage|photovoltaic)\b/.test(t))return "solar";
  if(/\b(ev|electric vehicle|charger|charging|tesla)\b/.test(t))return "ev";
  if(/\b(panel upgrade|service upgrade|200\s?amp|amperage|upgrade my panel|main panel|breaker box|bigger panel|increase capacity)\b/.test(t))return "panel";
  if(/\b(remodel|renovat|kitchen|bathroom|rewire|expand)\b/.test(t))return "remodel";
  return "";
}

/* ============================ HELPERS ============================ */
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
/* term(): accessible disclosure button (tap/click/keyboard). NEVER a hover-only title tooltip. */
var termDisclosureSequence=0;
function term(l){var d=GLOSSARY[l];if(!d)return esc(l);termDisclosureSequence+=1;var id="def-"+String(l).toLowerCase().replace(/\W+/g,"-")+"-"+termDisclosureSequence;
  return '<span class="term-disclosure"><button class="term-button" type="button" data-definition-action="definition" data-def="'+esc(id)+'" aria-expanded="false" aria-controls="'+esc(id)+'" aria-label="What does '+esc(l)+' mean?"><span class="term-button__label">'+esc(l)+'</span><span class="term-button__cue" aria-hidden="true">i</span></button>'+'<span id="'+esc(id)+'" class="term-definition" role="note" hidden>'+esc(d)+'</span></span>';}

/* Evidence provenance chip (execution plan §3). Renders the restored .ebadge; this is provenance, NOT a score. */
function evidenceBadge(kind){
  var map={customer:"Customer-provided",interpretation:"Working interpretation",illustrative:"Illustrative",sourced:"Source-backed"};
  var k=map[kind]?kind:"interpretation";
  return '<span class="ebadge '+k+'">'+esc(map[k])+'</span>';
}
/* Authority-role chip for the assembled guidance (which source governs). */
function roleBadge(roleId){var r=(typeof sourceRole==="function")?sourceRole(roleId):null;if(!r)return "";
  return '<span class="ebadge '+esc(r.badge)+'">'+esc(r.label)+'</span>';}
function toast(m){var t=document.getElementById("toast");if(!t)return;t.textContent=m;t.className="toast show";var st=document.getElementById("status");if(st)st.textContent=m;clearTimeout(toast._t);toast._t=setTimeout(function(){t.className="toast";},2400);}
function setActiveQuery(text){var t=String(text||"").trim();if(t)S.activeCustomerQuery=t;}

;

;

;
