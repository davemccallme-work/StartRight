/* V44.26.1 DRAFT EXPORT MANIFEST
   Traceable, form-neutral plan derived from applicationDraftFromState().
   This module does not contain PDF field names and does not generate a document. */
'use strict';
var APPLICATION_DRAFT_LABELS={
  description:'Work description',propertyType:'Property type',stage:'Project stage',
  panelIntent:'Panel work being considered',existingPanelCapacity:'Existing main-breaker rating',
  proposedPanelCapacity:'Proposed capacity being considered',panelServiceMethod:'Service method',
  plannedLoads:'Planned equipment or electrical loads',aduType:'ADU type',
  aduAddressStatus:'ADU address status',aduMeterServiceIntent:'Meter or service arrangement being considered',
  aduServiceMethod:'Service method',aduAdjacentService:'Relationship to existing service equipment',
  projectAddress:'Project address',applicantContacts:'Applicant contact information',
  contractorDetails:'Contractor details',totalElectricLoad:'Calculated electric load',
  requestedVoltage:'Requested voltage',serviceAndMeterCounts:'Number of services or meters',signature:'Signature and date'
};
function applicationDraftLabel(id){return APPLICATION_DRAFT_LABELS[id]||id;}
function manifestItem(logicalField,field){
  return {logicalField:logicalField,label:applicationDraftLabel(logicalField),source:field.source||null,value:Object.prototype.hasOwnProperty.call(field,'value')?field.value:null,provenance:field.provenance||null,disposition:field.disposition,reason:field.reason||null};
}
function addDraftField(groups,logicalField,field,reviewRequired){
  if(!field)return;
  var item=manifestItem(logicalField,field);
  if(field.disposition==='populate'){
    if(reviewRequired){item.disposition='confirm-before-adding';item.reason='customer-review-required';groups.confirmBeforeAdding.push(item);}
    else groups.populated.push(item);
  }else groups.omitted.push(item);
}
function createApplicationExportManifest(state){
  var draft=applicationDraftFromState(state),groups={
    provenance:{generatedFrom:'Project Navigator prototype',draftOnly:true,formNeutral:true},
    supported:draft.supported,populated:[],confirmBeforeAdding:[],omitted:[],warnings:(draft.warnings||[]).slice()
  };
  addDraftField(groups,'description',draft.project.description,false);
  addDraftField(groups,'propertyType',draft.project.propertyType,true);
  addDraftField(groups,'stage',draft.project.stage,false);
  if(draft.panel){
    addDraftField(groups,'panelIntent',draft.panel.intent,true);
    addDraftField(groups,'existingPanelCapacity',draft.panel.existingCapacity,false);
    addDraftField(groups,'proposedPanelCapacity',draft.panel.proposedCapacity,false);
    addDraftField(groups,'panelServiceMethod',draft.panel.serviceMethod,false);
    addDraftField(groups,'plannedLoads',draft.panel.plannedLoads,false);
  }
  if(draft.adu){
    addDraftField(groups,'aduType',draft.adu.type,false);
    addDraftField(groups,'aduAddressStatus',draft.adu.addressStatus,true);
    addDraftField(groups,'aduMeterServiceIntent',draft.adu.meterServiceIntent,true);
    addDraftField(groups,'aduServiceMethod',draft.adu.serviceMethod,false);
    addDraftField(groups,'aduAdjacentService',draft.adu.adjacentToExisting,true);
  }
  (draft.omitted||[]).forEach(function(item){groups.omitted.push({logicalField:item.logicalField,label:applicationDraftLabel(item.logicalField),source:null,value:null,provenance:null,disposition:'blank',reason:item.reason});});
  if(groups.confirmBeforeAdding.length)groups.warnings.push('Some customer-provided answers need review before they could be added to a draft form.');
  groups.warnings.push('Draft only. Review every populated and blank field. Nothing has been submitted to PG&E.');
  return groups;
}
if(typeof module!=='undefined'&&module.exports)module.exports={createApplicationExportManifest:createApplicationExportManifest,applicationDraftLabel:applicationDraftLabel};

;
