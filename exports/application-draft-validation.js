/* V44.26.0 APPLICATION DRAFT VALIDATION */
'use strict';
function validateApplicationDraft(draft){
  var errors=[];
  if(!draft||!draft.provenance||draft.provenance.draftOnly!==true)errors.push('draft-only provenance missing');
  if(draft&&draft.provenance&&draft.provenance.generatedFrom!=='Project Navigator prototype')errors.push('unexpected generator');
  if(draft&&draft.panel&&draft.adu)errors.push('route-specific sections overlap');
  var text=JSON.stringify(draft||{});
  ['signatureValue','agreementAccepted','projectNumber','calculatedLoad','pdfField'].forEach(function(key){if(text.indexOf('"'+key+'"')>=0)errors.push('prohibited export key: '+key);});
  return {valid:errors.length===0,errors:errors};
}
if(typeof module!=='undefined'&&module.exports)module.exports={validateApplicationDraft:validateApplicationDraft};

;
