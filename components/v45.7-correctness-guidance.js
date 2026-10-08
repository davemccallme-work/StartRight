
/* V45.7.1 presentation for correctness results. Rendering only; no rules or state writes. */
var V457CorrectnessGuidance=(function(){'use strict';
function e(v){return typeof esc==='function'?esc(String(v||'')):String(v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function note(title,body,kind){return '<aside class="consistency-notice v457-correctness v457-correctness--'+(kind||'info')+'" role="status"><strong>'+e(title)+'</strong><p>'+e(body)+'</p></aside>';}
function forQuestion(projectType,answers,qid){if(typeof V457CorrectnessEngine==='undefined')return '';var f=Object.assign({projectType:projectType},answers||{}),o=[];if(projectType==='adu'&&['aduType','aduAddressStatus','aduMeterServiceIntent'].indexOf(qid)>=0){var j=V457CorrectnessEngine.jadu(f);if(j.status==='confirmed-guidance')o.push(note('Junior ADU metering treatment',j.meteringText+' '+j.serviceText,'info'));var c=V457CorrectnessEngine.aduCompatibility(f);if(c.status==='incompatible')o.push(note('These answers need confirmation',c.detail+' '+c.ask,'warning'));else if(c.reasonCode==='ADDRESS_UNCONFIRMED'&&c.suppressAffirmativeServiceGuidance)o.push(note('Address status still needs confirmation','The separate-service path should not be relied on until the address status is confirmed.','info'));}
if(projectType==='panel'&&['panelIntent','panelLoads'].indexOf(qid)>=0){var p=V457CorrectnessEngine.permit(f);if(p.status==='eligible')o.push(note('Permit context',p.pgAndEIntakeText+' '+p.meterSetText,'info'));}
if(['panelLoads','aduMeterServiceIntent'].indexOf(qid)>=0){var l=V457CorrectnessEngine.load(f);if(l.status==='eligible')o.push(note('Load information serves a different purpose',l.text,'info'));}
if(typeof V457ServiceContextEngine!=='undefined'&&projectType==='panel'){
  var svc=V457ServiceContextEngine.servicePotential(f),ug=V457ServiceContextEngine.underground(f),ld=V457ServiceContextEngine.loadDistinction(f);
  /* V45.7.5.4: service-adequacy guidance is rendered inside the selected-answer interpretation before documents and visuals. */
  if(['panelServiceMethod','panelIntent','panelCapacityCompare','panelProposedCapacity'].indexOf(qid)>=0&&ug.status==='eligible')o.push(note('Underground service may involve additional work',ug.text,'info'));
  if(qid==='panelLoads'&&ld.status==='eligible')o.push(note('Local-jurisdiction and PG&E load information serve different reviews',ld.text,'info'));
}
return o.join('');}
return {forQuestion:forQuestion};})();
if(typeof module!=='undefined'&&module.exports)module.exports=V457CorrectnessGuidance;
