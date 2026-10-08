/* V44.26.4 REVIEWED EXPORT PLAN
   Final form-neutral export plan derived at render/export time.
   Contains logical fields only. No PDF field names or document writing. */
'use strict';
function reviewedExportItem(item,disposition,reason){return {logicalField:item.logicalField,label:item.label,source:item.source||null,value:Object.prototype.hasOwnProperty.call(item,'value')?item.value:null,provenance:item.provenance||null,disposition:disposition,reason:reason||null};}
function createReviewedApplicationExportPlan(state){
  var manifest=createApplicationExportManifest(state),route=String((state&&state.projectType)||''),plan={provenance:{generatedFrom:'Project Navigator prototype',draftOnly:true,formNeutral:true,derived:true},supported:manifest.supported,included:[],unresolved:[],leftBlank:[],warnings:(manifest.warnings||[]).slice()};
  manifest.populated.forEach(function(item){plan.included.push(reviewedExportItem(item,'include','direct-customer-answer'));});
  manifest.confirmBeforeAdding.forEach(function(item){var decision=exportReviewDecision(route,item.logicalField,item.value);if(decision==='include')plan.included.push(reviewedExportItem(item,'include','customer-confirmed-for-draft'));else if(decision==='leave-blank')plan.leftBlank.push(reviewedExportItem(item,'blank','customer-chose-leave-blank'));else plan.unresolved.push(reviewedExportItem(item,'unresolved','customer-review-required'));});
  manifest.omitted.forEach(function(item){plan.leftBlank.push(reviewedExportItem(item,'blank',item.reason||'left-blank'));});
  if(plan.unresolved.length)plan.warnings.push('Some review items are still undecided and will remain blank.');
  plan.warnings.push('This reviewed plan is not an application and has not been submitted to PG&E.');
  return plan;
}
if(typeof module!=='undefined'&&module.exports)module.exports={createReviewedApplicationExportPlan:createReviewedApplicationExportPlan};

;
