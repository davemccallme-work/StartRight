/* V45.7.5.8 canonical Junior ADU meter guard. */
(function(root){'use strict';
var RULE_ID='ADU.JADU.METERING';
function apply(runtime){runtime=runtime||{};var applies=runtime.projectClassification==='jadu'||runtime.aduType==='Junior ADU'||(runtime.answers&&runtime.answers.aduType==='Junior ADU');if(!applies)return null;return {ruleId:RULE_ID,eligibilityConclusion:'ineligible',separateMeterEligible:false,secondMeterEligibility:false,secondServiceEligibility:null,provenanceState:'governed_rule',recommendedAction:'use_canonical_jadu_guidance',heading:'Junior ADU metering',message:'A Junior ADU cannot be separately metered.',boundary:'This metering rule does not by itself determine whether another service connection is available.'};}
root.JaduConflictControl={RULE_ID:RULE_ID,apply:apply};if(typeof module!=='undefined'&&module.exports)module.exports=root.JaduConflictControl;
})(typeof window!=='undefined'?window:this);
