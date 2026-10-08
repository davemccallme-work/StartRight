/* V44.26.0 APPLICATION DRAFT ADAPTER
   Pure derived view of customer-provided Project Navigator state.
   No PDF names, application status, submission behavior, or persisted conclusions. */
'use strict';
function draftText(value){var text=String(value==null?'':value).trim();return text&&!/not sure/i.test(text)?text:null;}
function draftDisposition(state,questionId,value){
  var skipped=!!(state&&Array.isArray(state.skipped)&&state.skipped.indexOf(questionId)>=0);
  var uncertain=Array.isArray(value)?value.some(function(x){return /not sure/i.test(String(x));}):/not sure/i.test(String(value==null?'':value));
  var empty=Array.isArray(value)?value.length===0:!String(value==null?'':value).trim();
  if(skipped||uncertain||empty)return {disposition:'blank',reason:'needs-confirmation'};
  return {disposition:'populate',value:Array.isArray(value)?value.slice():value,provenance:'customer'};
}
function draftField(state,questionId,value){var result=draftDisposition(state,questionId,value);result.source='answers.'+questionId;return result;}
function selectedDraftServiceMethod(state){
  var a=(state&&state.answers)||{},raw=state&&state.projectType==='panel'?a.panelServiceMethod:state&&state.projectType==='adu'?a.aduServiceMethod:'';
  if(/overhead/i.test(String(raw)))return 'overhead';if(/underground/i.test(String(raw)))return 'underground';return null;
}
function draftPanelLoads(state){
  var a=(state&&state.answers)||{},values=Array.isArray(a.panelLoads)?a.panelLoads.slice():[];
  if(values.indexOf('I’m not sure')>=0||values.indexOf("I'm not sure")>=0)return [];
  return values;
}
function applicationDraftFromState(state){
  state=state||{};var a=state.answers||{},route=String(state.projectType||'');
  var supported=route==='panel'||route==='adu';
  var draft={
    provenance:{generatedFrom:'Project Navigator prototype',draftOnly:true,derivedAtDownload:true},
    supported:supported,
    project:{
      type:supported?route:null,
      description:draftField(state,'description',a.description),
      propertyType:draftField(state,'property',a.property),
      stage:draftField(state,'timing',a.timing)
    },
    electric:{serviceMethod:selectedDraftServiceMethod(state)},
    panel:null,
    adu:null,
    omitted:[
      {logicalField:'projectAddress',reason:'not-collected'},
      {logicalField:'applicantContacts',reason:'not-collected'},
      {logicalField:'contractorDetails',reason:'not-collected'},
      {logicalField:'totalElectricLoad',reason:'technical-calculation-required'},
      {logicalField:'requestedVoltage',reason:'technical-determination-required'},
      {logicalField:'serviceAndMeterCounts',reason:'must-not-be-inferred'},
      {logicalField:'signature',reason:'never-auto-populate'}
    ],
    warnings:[]
  };
  if(route==='panel')draft.panel={
    intent:draftField(state,'panelIntent',a.panelIntent),
    existingCapacity:draftField(state,'panelExistingCapacity',a.panelExistingCapacity),
    proposedCapacity:a.panelIntent==='Increase the panel capacity'?draftField(state,'panelProposedCapacity',a.panelProposedCapacity):{disposition:'blank',reason:'not-applicable',source:'answers.panelProposedCapacity'},
    serviceMethod:draftField(state,'panelServiceMethod',a.panelServiceMethod),
    plannedLoads:draftField(state,'panelLoads',draftPanelLoads(state))
  };
  if(route==='adu')draft.adu={
    type:draftField(state,'aduType',a.aduType),
    addressStatus:draftField(state,'aduAddressStatus',a.aduAddressStatus),
    meterServiceIntent:draftField(state,'aduMeterServiceIntent',a.aduMeterServiceIntent),
    serviceMethod:draftField(state,'aduServiceMethod',a.aduServiceMethod),
    adjacentToExisting:draftField(state,'aduAdjacentService',a.aduAdjacentService)
  };
  if(!supported)draft.warnings.push('Draft-form preparation is currently supported only for the developed ADU and Panel journeys.');
  return draft;
}
if(typeof module!=='undefined'&&module.exports)module.exports={applicationDraftFromState:applicationDraftFromState,draftDisposition:draftDisposition,selectedDraftServiceMethod:selectedDraftServiceMethod};

;
