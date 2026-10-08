/* V44.44 structured recognition contract. Candidates never determine canonical state. */
'use strict';
var RECOGNITION_STATUSES=['candidate','confirmed','corrected','rejected'];
var RECOGNITION_FORBIDDEN_FIELDS=['scenarioId','timing','timingBenchmarks','cost','costEstimate','expressEligibility','recommendedNextAction','requirements','approval','readiness'];
var RECOGNITION_ALLOWED_FIELDS={
 projectType:['adu','panel'],
 aduType:['Detached ADU','Attached ADU','Junior ADU','I’m not sure'],
 aduAddressStatus:['Yes, a separate address is assigned','The address request is in progress','No separate address is assigned','I’m not sure'],
 aduMeterServiceIntent:['Use the existing meter and service','Add a separate meter','Add a separate service connection','I’m not sure'],
 aduServiceMethod:['Overhead','Underground','I’m not sure'],
 aduAdjacentService:['Yes, next to existing equipment','No, not next to existing equipment','I’m not sure'],
 panelIntent:['Increase the panel capacity','Replace the panel at the same capacity','Add electrical equipment; panel change not decided','Relocate the panel','I’m not sure'],
 panelExistingCapacity:['Less than 100 amps','100 amps','125 amps','150 amps','200 amps','More than 200 amps','I’m not sure'],
 panelServiceMethod:['Overhead service','Underground service','I’m not sure'],
 panelProposedCapacity:['100 amps','125 amps','150 amps','200 amps','320 amps','400 amps or more','I’m not sure'],
 panelLoads:['EV charger','Heat pump or electric HVAC','Electric water heater','Electric range or cooking equipment','Solar or battery','Other electrical equipment','No added equipment','I’m not sure'],
 property:['Single-family home','Multi-family property','Commercial property','Not sure'],
 energy:['A separate meter or service','More electrical capacity','New electric service','Not sure yet']
};
function recognitionValueAllowed(field,value){var allowed=RECOGNITION_ALLOWED_FIELDS[field];if(!allowed)return false;if(field==='panelLoads')return Array.isArray(value)&&value.every(function(x){return allowed.indexOf(x)>=0;});return allowed.indexOf(value)>=0;}
function validateRecognitionCandidates(input){var list=Array.isArray(input)?input:[],accepted=[],rejected=[];list.forEach(function(raw){var c={field:String(raw&&raw.field||''),value:raw&&raw.value,sourceText:String(raw&&raw.sourceText||''),status:'candidate'};if(RECOGNITION_FORBIDDEN_FIELDS.indexOf(c.field)>=0||!recognitionValueAllowed(c.field,c.value)){c.status='rejected';rejected.push(c);}else accepted.push(c);});return {accepted:accepted,rejected:rejected};}
function createRecognitionReview(sourceText,input){var v=validateRecognitionCandidates(input);return {sourceText:String(sourceText||''),candidates:v.accepted,rejected:v.rejected,open:v.accepted.length>0,confirmedByCustomer:false};}
function confirmRecognitionCandidate(state,index){var s=state||S,r=s.recognitionReview||{},c=(r.candidates||[])[index];if(!c||c.status==='rejected')return false;if(c.field==='projectType')setProjectType(c.value);else setCanonicalAnswer(c.field,c.field==='panelLoads'?normalizePanelLoads(c.value):c.value);c.status='confirmed';r.confirmedByCustomer=true;return true;}
function rejectRecognitionCandidate(state,index){var r=(state||S).recognitionReview||{},c=(r.candidates||[])[index];if(!c)return false;c.status='rejected';return true;}
if(typeof module!=='undefined'&&module.exports)module.exports={RECOGNITION_ALLOWED_FIELDS:RECOGNITION_ALLOWED_FIELDS,RECOGNITION_FORBIDDEN_FIELDS:RECOGNITION_FORBIDDEN_FIELDS,validateRecognitionCandidates:validateRecognitionCandidates,createRecognitionReview:createRecognitionReview,confirmRecognitionCandidate:confirmRecognitionCandidate,rejectRecognitionCandidate:rejectRecognitionCandidate};

;
