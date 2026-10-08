/* V45.6.5: versioned, input-derived, shadow-only scope and governance model. */
(function(root){'use strict';
var SCHEMA='pn-canonical-shadow-v1',RULE_SET='pn-governance-shadow-v1';
var STATES=['answered','unanswered','not_sure','skipped','invalidated','not_applicable'];
var FALLBACK=['hide','show_may_be_needed','show_needs_confirmation','show_formal_confirmation_required'];
var RELEASE=['shadow_only','approved','pending_validation','held','superseded'];
var FIELDS=['panelIntent','panelExistingCapacity','panelProposedCapacity','panelServiceMethod','panelLoads','energy','aduType','aduMeterServiceIntent','aduAddressStatus','aduServiceMethod','aduAdjacentService'];
function own(x,k){return Object.prototype.hasOwnProperty.call(x||{},k);}
function unknown(v){return typeof v==='string'&&/^(?:i[’']m not sure|not sure|not sure yet)$/i.test(v.trim());}
function clone(v){return JSON.parse(JSON.stringify(v));}
function answer(v,opts){opts=opts||{};var state=opts.notApplicable?'not_applicable':opts.invalidated?'invalidated':opts.skipped?'skipped':v===null||v===undefined||v===''||(Array.isArray(v)&&!v.length)?'unanswered':unknown(v)||Array.isArray(v)&&v.some(unknown)?'not_sure':'answered';return {state:state,value:state==='answered'?clone(v):null,source:opts.source||'customer_input',updateReason:opts.reason||'adapted_from_inputs'};}
function fact(v,source){return v===true||v===false?{state:'answered',value:v,source:source||'derived_from_customer_input'}:{state:'unanswered',value:null,source:source||'derived_from_customer_input'};}
function numeric(v){if(typeof v==='number'&&Number.isFinite(v)&&v>0)return v;var m=typeof v==='string'&&v.match(/^(\d+)\s*amps?$/i);return m?Number(m[1]):null;}
function derive(runtime){var s=runtime||{},a=s.answers||{},pt=s.projectType,sk=Array.isArray(s.skipped)?s.skipped:[],inv=s.invalidatedAnswers||{},answers={},facts={},conflicts=[];
 FIELDS.forEach(function(k){answers[k]=answer(a[k],{notApplicable:pt==='adu'&&/^panel/.test(k)||pt==='panel'&&/^adu/.test(k),invalidated:!!inv[k],skipped:sk.indexOf(k)>=0,source:'answers.'+k});});
 var active=pt==='panel',p=answers.panelIntent.value,loads=answers.panelLoads.value,energy=answers.energy.value;
 var loadKnown=Array.isArray(loads)&&loads.length>0,hasLoad=loadKnown&&loads.some(function(x){return x!=='No added equipment'&&x!=="I’m not sure";});
 var explicitNoLoad=loadKnown&&loads.length===1&&loads[0]==='No added equipment';
 facts.addedLoad=fact(!active?null:p==='Add electrical equipment; panel change not decided'||hasLoad?true:explicitNoLoad?false:null,'panelIntent+panelLoads');
 facts.panelChange=fact(!active?null:p==='Replace the panel at the same capacity'||p==='Increase the panel capacity'||p==='Relocate the panel'?true:null,'panelIntent');
 facts.capacityChange=fact(!active?null:p==='Increase the panel capacity'?true:p==='Replace the panel at the same capacity'?false:null,'panelIntent');
 facts.equipmentRelocation=fact(!active?null:p==='Relocate the panel'?true:null,'panelIntent');
 facts.meterChange=fact(pt==='adu'&&answers.aduMeterServiceIntent.value==='Add a separate meter'?true:null,'aduMeterServiceIntent');
 facts.separateServiceRequest=fact(pt==='adu'&&answers.aduMeterServiceIntent.value==='Add a separate service connection'||active&&energy==='New electric service'?true:null,'aduMeterServiceIntent+energy');
 facts.existingPanelAmps=answer(numeric(answers.panelExistingCapacity.value),{notApplicable:!active,source:'panelExistingCapacity'});
 facts.proposedPanelAmps=answer(p==='Increase the panel capacity'?numeric(answers.panelProposedCapacity.value):null,{notApplicable:!active,source:'panelProposedCapacity'});
 facts.existingServiceAmps=answer(null,{source:'not_collected'});facts.proposedServiceAmps=answer(null,{source:'not_collected'});
 var scope='unresolved';if(active){
  if(p==='Add electrical equipment; panel change not decided')scope='added_load_panel_undecided';
  else if(p==='Replace the panel at the same capacity')scope='same_location_same_capacity';
  else if(p==='Increase the panel capacity')scope='same_location_capacity_increase';
  else if(p==='Relocate the panel')scope='relocation_capacity_unconfirmed';
  if(p==='Replace the panel at the same capacity'&&hasLoad)conflicts.push({id:'like_for_like_with_added_load',paths:['panelIntent','panelLoads'],resolution:'confirm_scope'});
  if(p==='Replace the panel at the same capacity'&&energy==='New electric service')conflicts.push({id:'like_for_like_with_new_service',paths:['panelIntent','energy'],resolution:'confirm_scope'});
  if(p==='Add electrical equipment; panel change not decided'&&explicitNoLoad)conflicts.push({id:'added_load_intent_with_no_added_equipment',paths:['panelIntent','panelLoads'],resolution:'confirm_scope'});
  if(p==='Increase the panel capacity'&&facts.existingPanelAmps.state==='answered'&&facts.proposedPanelAmps.state==='answered'&&facts.proposedPanelAmps.value<=facts.existingPanelAmps.value)conflicts.push({id:'capacity_increase_rating_mismatch',paths:['panelExistingCapacity','panelProposedCapacity'],resolution:'confirm_scope'});
  if(conflicts.length)scope='unresolved';
 }
 return {schemaVersion:SCHEMA,ruleSetVersion:RULE_SET,projectType:pt,answers:answers,facts:facts,primaryPanelScope:scope,conflicts:conflicts,customerGuidance:[]};}
function validateCatalog(c){if(!c||!Array.isArray(c.rules)||!c.version)throw Error('Invalid shadow catalog');var seen={};c.rules.forEach(function(r){if(!r||!r.id||seen[r.id])throw Error('Duplicate/missing rule ID');seen[r.id]=true;if(!r.source||!r.source.id||!own(r.source,'functionalOwner')||!r.source.authorityTier||r.source.authorityTier<1||r.source.authorityTier>6||!r.source.section||!r.source.status)throw Error('Missing source authority');if(!RELEASE.includes(r.release)||!FALLBACK.includes(r.fallback)||!r.approvalState)throw Error('Missing release metadata');if(!r.safeFallback||!FALLBACK.includes(r.safeFallback))throw Error('Missing safe fallback');if(r.release==='approved'&&r.approvalState!=='approved')throw Error('Premature release');if(!r.factPaths||r.factPaths.some(function(x){return !['addedLoad','panelChange','capacityChange','meterChange','separateServiceRequest','equipmentRelocation','existingPanelAmps','proposedPanelAmps','existingServiceAmps','proposedServiceAmps'].includes(x)}))throw Error('Unknown fact path');});return true;}
function releaseState(rule,truth){if(rule.release==='held'||rule.release==='superseded'||rule.release==='shadow_only')return 'hidden';if(rule.release==='pending_validation'||rule.approvalState!=='approved')return rule.safeFallback==='hide'?'hidden':rule.safeFallback==='show_may_be_needed'?'may_be_needed':rule.safeFallback==='show_needs_confirmation'?'needs_confirmation':'needs_formal_confirmation';if(truth!=='true')return 'hidden';return rule.fallback==='hide'?'hidden':rule.fallback==='show_may_be_needed'?'may_be_needed':rule.fallback==='show_needs_confirmation'?'needs_confirmation':'needs_formal_confirmation';}
function evaluate(runtime,catalog){validateCatalog(catalog);var result=derive(runtime);result.ruleSetVersion=catalog.version;result.evaluatedRules=catalog.rules.slice().sort(function(a,b){return a.id.localeCompare(b.id)}).map(function(r){var applicable=r.context===result.projectType,vals=(r.factPaths||[]).map(function(path){return result.facts[path]}),truth=!applicable?'not_applicable':vals.some(function(f){return !f||f.state!=='answered'})?'unknown':vals.every(function(f){return f.value===r.expected})?'true':'false';return {id:r.id,truth:truth,release:releaseState(r,truth),sourceId:r.source.id,authorityTier:r.source.authorityTier};});return result;}
var api={SCHEMA:SCHEMA,RULE_SET:RULE_SET,STATES:STATES.slice(),answer:answer,derive:derive,validateCatalog:validateCatalog,releaseState:releaseState,evaluate:evaluate};root.CanonicalShadowModel=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:this);
