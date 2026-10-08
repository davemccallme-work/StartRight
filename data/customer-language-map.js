/* V44.49.60 GOVERNED CUSTOMER LANGUAGE MAP
   Design hypothesis for customer research. Preserve canonical values, official terms,
   technical boundaries, routing, persistence, and formal-review authority. */
'use strict';
var CUSTOMER_LANGUAGE_MAP={
  'ADU':{firstUse:'Accessory Dwelling Unit (ADU), a separate living space',short:'ADU'},
  'JADU':{firstUse:'Junior Accessory Dwelling Unit (JADU), a smaller unit inside the home',short:'JADU'},
  'electrical panel':{firstUse:'electrical panel (breaker box)',short:'electrical panel'},
  'panel capacity':{firstUse:'panel capacity, or how much electrical power the panel can handle',short:'panel power limit'},
  'electrical load':{firstUse:'electrical load, or how much electricity the project needs',short:'power needed'},
  'load calculation':{firstUse:'a load calculation by a licensed electrician',short:'power calculation'},
  'electrical service':{firstUse:'electrical service, the connection that brings power to your property',short:'electrical connection'},
  'service capacity':{firstUse:'current service capacity, or the power available from your electrical connection',short:'power available from your connection'},
  'separate service':{firstUse:'a separate electrical service for the new unit',short:'separate electrical connection'},
  'meter':{firstUse:'electric meter, which measures electricity use',short:'electric meter'},
  'main breaker':{firstUse:'main breaker, the main power switch in your panel',short:'main breaker'},
  'existing main-breaker rating':{firstUse:'current panel size, shown in amps on the main breaker',short:'current panel size (amps)'},
  'proposed capacity':{firstUse:'panel size being considered, not yet approved or required',short:'possible panel size'},
  'like-for-like replacement':{firstUse:'same-size replacement (sometimes called like-for-like)',short:'same-size replacement'},
  'site plan':{firstUse:'site plan, a drawing of your property and equipment locations',short:'site plan'},
  'panel cut sheet':{firstUse:"panel cut sheet, the manufacturer's information sheet",short:'panel information sheet'},
  'single-line diagram':{firstUse:'single-line diagram (SLD), a simplified drawing of the electrical system',short:'electrical system diagram'},
  'utility review':{firstUse:'PG&E review',short:'PG&E review'},
  'address assignment':{firstUse:'official address from your city or county',short:'official address'}
};
var CUSTOMER_LANGUAGE_RULES={
  evidenceState:'design-hypothesis',defineOnFirstUse:true,officialTermWhenRecognitionNeeded:true,
  preserveCanonicalValues:true,preserveUncertainty:true,noGlobalTechnicalReplacement:true
};
if(typeof module!=='undefined'&&module.exports)module.exports={CUSTOMER_LANGUAGE_MAP:CUSTOMER_LANGUAGE_MAP,CUSTOMER_LANGUAGE_RULES:CUSTOMER_LANGUAGE_RULES};
