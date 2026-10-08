/* V45.6.9.9 QUESTION INLINE-RESPONSE ENGINE (pure derivation)
   Authorities (never duplicated here):
     - ANSWER_RESPONSE_CATALOG       answer copy + document keys
     - ProgressiveInsights / ProgressiveVisuals   the only image release authority
     - DocumentGuidanceEngine        the only document release authority
     - DOCUMENT_REFERENCE_EXAMPLES   V45.6.10: which educational example accompanies a RELEASED document
   Guarantees: no writes to answers/skipped/drafts/storage/history; fail closed (null) when there is
   no canonical answer, the question is skipped or invalidated, the project is not ADU/panel, or no
   governed row matches. "I’m not sure" never releases documents or images.
   V45.6.10 additions:
     - derive(): referenceExamples — an educational example image for each released document that has
       one (e.g. "what a single-line diagram looks like"). Never the customer's configuration.
     - preview(): option-level explanation shown BEFORE selection. Hypothetical, labelled as such,
       never recorded, never releases documents. Images limited to rules controlled by that field. */
(function(root){'use strict';
var UNSURE_RX=/^(?:i[’']m not sure|not sure|not sure yet|i don[’']t know)$/i;
function g(name){return root[name]||null;}
function isUnsure(v){return UNSURE_RX.test(String(v==null?'':v).trim());}
function known(v){if(Array.isArray(v))return v.length>0;return v!==undefined&&v!==null&&String(v).trim()!=='';}
function norm(v){return String(v==null?'':v).replace(/[’‘]/g,"'").trim().toLowerCase();}
function catalog(){return g('ANSWER_RESPONSE_CATALOG');}
function optionTitle(q,field,value){var list=q&&q.fields?((q.fields.filter(function(f){return f.id===field;})[0]||{}).options||[]):(q&&q.options)||[];for(var i=0;i<list.length;i++){var o=list[i],v=typeof o==='string'?o:o.value,t=typeof o==='string'?o:(o.title||o.value);if(v===value)return t;}return value;}
function answerFieldFor(q,cat,pt){if(!q)return null;var row=(cat.rows||[]).filter(function(x){return x.projectType===pt&&x.questionId===q.id;})[0];return row?row.answerField:q.id;}
function blocked(q,field,o){o=o||{};var sk=o.skipped||[],inv=o.invalidatedAnswers||{};return sk.indexOf(q.id)>=0||sk.indexOf(field)>=0||!!inv[field]||!!inv[q.id];}
function matchRow(cat,pt,qid,value){var rows=(cat.rows||[]).filter(function(x){return x.projectType===pt&&x.questionId===qid;});var exact=rows.filter(function(x){return x.answerValue!=='*'&&norm(x.answerValue)===norm(value);})[0];if(exact)return exact;if(isUnsure(value))return rows.filter(function(x){return isUnsure(x.answerValue);})[0]||null;return rows.filter(function(x){return x.answerValue==='*';})[0]||null;}
function displayLabel(q,field,value,answers){if(q&&q.fields){return q.fields.map(function(f){var v=answers[f.id];return known(v)?optionTitle(q,f.id,v):'';}).filter(Boolean).join(' / ');}if(Array.isArray(value))return value.map(function(v){return optionTitle(q,field,v);}).join(', ');return optionTitle(q,field,value);}
function documentsFor(row,pt,answers){if(!row.documentGuidanceKeys.length)return [];var E=g('DocumentGuidanceEngine'),C=g('DOCUMENT_GUIDANCE_CATALOG');if(!E||!C||typeof E.evaluate!=='function')return [];var wanted={};row.documentGuidanceKeys.forEach(function(k){var d=C.documents&&C.documents[k];if(d)wanted[d.id]=k;});var m;try{m=E.evaluate(pt,answers);}catch(err){return [];}var out=[],seen={};['prepare','conditional','confirm'].forEach(function(status){((m&&m.groups&&m.groups[status])||[]).forEach(function(x){if(wanted[x.id]&&!seen[x.id]){seen[x.id]=1;out.push({id:x.id,key:wanted[x.id],title:x.title,description:x.description,status:status,reason:x.reason,icon:x.icon});}});});return out;}
function visualsFor(pt,answers,stage,o){var P=g('ProgressiveInsights');if(!P||typeof P.select!=='function')return [];try{return P.select(pt,answers,stage,o).map(function(r){return r.id;});}catch(err){return [];}}
/* V45.6.10: educational example for a released document; flagged shownAbove when the same asset is already displayed. */
function referenceExamplesFor(docs,pt,visualIds){var map=g('DOCUMENT_REFERENCE_EXAMPLES'),reg=g('LearningCardRegistry');if(!map||!reg)return [];var out=[];docs.forEach(function(d){var e=map[d.id];if(!e)return;var id=(e.byProjectType&&e.byProjectType[pt])||e.assetId;if(!id||!reg.byId(id))return;out.push({documentId:d.id,assetId:id,caption:e.caption,shownAbove:visualIds.indexOf(id)>=0});});return out;}
function derive(ctx){ctx=ctx||{};var pt=ctx.projectType,q=ctx.question,answers=ctx.answers||{},o={skipped:ctx.skipped||[],invalidatedAnswers:ctx.invalidatedAnswers||{}};
  var cat=catalog();if(!cat||!q||(pt!=='adu'&&pt!=='panel'))return null;
  var field=answerFieldFor(q,cat,pt),value=answers[field];
  if(!known(value)||blocked(q,field,o))return null;
  var lookup=value;if(Array.isArray(value)){if(value.length===1)lookup=value[0];else lookup='__multiple__';}
  var row=matchRow(cat,pt,q.id,lookup);if(!row)return null;
  var unsure=isUnsure(lookup);
  var key=[pt,q.id,Array.isArray(value)?value.slice().sort().join('|'):value].join('::');
  var docs=unsure?[]:documentsFor(row,pt,answers),vis=unsure?[]:visualsFor(pt,answers,q.id,o);
  return {responseId:row.responseId,responseKey:key,projectType:pt,questionId:q.id,answerField:field,answerValue:value,isUnsure:unsure,
    displayLabel:displayLabel(q,field,value,answers),definition:row.definition,preparation:row.preparation,uncertainty:row.uncertainty,
    documents:docs,visualIds:vis,referenceExamples:unsure?[]:referenceExamplesFor(docs,pt,vis),
    boundary:cat.boundary,contentStatus:row.status,provenance:{catalogVersion:cat.version,documentAuthority:'DocumentGuidanceEngine',visualAuthority:'ProgressiveInsights'}};}
/* V45.6.10 option preview: what choosing this option would mean. Single-field choice questions only. */
function preview(ctx){ctx=ctx||{};var pt=ctx.projectType,q=ctx.question,value=ctx.value;var cat=catalog();
  if(!cat||!q||q.fields||q.type==='multichoice'||(pt!=='adu'&&pt!=='panel')||!known(value))return null;
  var row=matchRow(cat,pt,q.id,value);if(!row||row.answerValue==='*')return null;
  var unsure=isUnsure(value),ids=[];
  if(!unsure){var V=g('ProgressiveVisuals');if(V&&typeof V.deriveAll==='function'){var hyp=Object.assign({},ctx.answers||{});hyp[q.id]=value;try{ids=V.applyPrecedence(V.deriveAll(pt,hyp)).filter(function(r){return r.reason.indexOf(q.id)>=0;}).map(function(r){return r.id;}).slice(0,1);}catch(err){ids=[];}}}
  return {responseId:row.responseId,previewKey:[pt,q.id,value].join('::'),value:value,title:optionTitle(q,q.id,value),definition:row.definition,uncertainty:row.uncertainty,visualIds:ids,hypothetical:true};}
var api={derive:derive,preview:preview,isUnsure:isUnsure};
root.QuestionInlineResponseEngine=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:this);
