(function(root){'use strict';var C={version:'45.7.0',status:'shadow-only',rules:{
'ADU.JADU.METERING':{inputs:['aduType'],outputs:['separateMeterRequired','separateAddressRequired','attachedAduMeteringTreatmentApplies','separateMeterEligibility'],customerWordingStatus:'confirmed-not-required'},
'ADU.METER.SERVICE.SEPARATION':{inputs:['aduType','aduMeterServiceIntent'],constraint:'neither output may derive the other'},
'ADU.DETACHED.ADDRESS.SERVICE.COMPATIBILITY':{inputs:['aduType','aduAddressStatus','aduMeterServiceIntent'],minimumCase:'Detached ADU + No separate address is assigned + Add a separate service connection'},
'PERMIT.CONTEXT':{inputs:['projectType','panelIntent','panelLoads'],outputs:['applicant','issuingAuthority','pgAndEIntakeStatus','localPermitStatus','meterSetRelevance','applicability']},
'LOAD.AHJ.PGE.SEPARATION':{inputs:['projectType','panelIntent','panelLoads','aduMeterServiceIntent'],constraint:'AHJ documentation must not satisfy PG&E load information'},
'PROPERTY.VIRTUAL.DEFAULT':{status:'planned-v45.7.2'},'ENERGY.LEGACY.ISOLATION':{decisionGate:'export treatment'}}};root.V457_RULE_CONTRACTS=C;if(typeof module!=='undefined'&&module.exports)module.exports=C;})(typeof window!=='undefined'?window:this);
