/* V44.49.61 GOVERNED CUSTOMER LANGUAGE RUNTIME
   Presentation-only normalization. Does not change canonical answers, routing, or persistence. */
'use strict';
var CustomerLanguage=(function(){
  function record(term){
    if(typeof CUSTOMER_LANGUAGE_MAP==='undefined')return null;
    return CUSTOMER_LANGUAGE_MAP[term]||CUSTOMER_LANGUAGE_MAP[String(term||'').toLowerCase()]||null;
  }
  function read(term,key){var r=record(term);return r&&(r[key]||r.definition||r.firstUse||r.short)||String(term||'');}
  return {has:function(term){return !!record(term);},firstUse:function(term){return read(term,'firstUse');},short:function(term){return read(term,'short');},definition:function(term){return read(term,'definition');}};
})();
function pnPlainLanguageHtml(html){
  return String(html==null?'':html)
    .replace(/code-based load calculation/gi,"an electrician's calculation of how much electrical power the project may need")
    .replace(/Draft review only\./g,'This is only a draft.');
}
function pnNormalizeCustomerLanguage(){
  if(typeof GLOSSARY!=='undefined'&&GLOSSARY['Load calculation'])GLOSSARY['Load calculation']="A licensed electrician's calculation of how much electrical power the home or project may need. It helps evaluate panel and service options.";
  if(typeof GUIDANCE!=='undefined'&&GUIDANCE.panel){
    GUIDANCE.panel.recommendation='Ask a licensed electrician to calculate how much electrical power your project will need before choosing a panel or service size.';
    if(Array.isArray(GUIDANCE.panel.next))GUIDANCE.panel.next=GUIDANCE.panel.next.map(function(x){return pnPlainLanguageHtml(x);});
  }
  if(typeof TIMING_DESC!=='undefined'&&TIMING_DESC['Load calculation'])TIMING_DESC['Load calculation']='Waiting for an electrician to calculate the electrical power needed can hold up design decisions.';
  if(typeof DELAY_FACTORS!=='undefined')DELAY_FACTORS.forEach(function(x){if(x&&x.derisk)x.derisk=pnPlainLanguageHtml(x.derisk);});
  if(typeof QuestionHelp!=='undefined'){
    ['forQuestion','forDocument','advisorHtml','compactTerm'].forEach(function(name){
      if(typeof QuestionHelp[name]==='function'&&!QuestionHelp[name]._pnPlainLanguage){
        var base=QuestionHelp[name];
        var wrapped=function(){return pnPlainLanguageHtml(base.apply(QuestionHelp,arguments));};
        wrapped._pnPlainLanguage=true;QuestionHelp[name]=wrapped;
      }
    });
  }
  if(typeof step0==='function'&&!step0._pnPlainLanguage){var baseStep0=step0;step0=function(){return pnPlainLanguageHtml(baseStep0());};step0._pnPlainLanguage=true;}
}
pnNormalizeCustomerLanguage();
if(typeof module!=='undefined'&&module.exports)module.exports={CustomerLanguage:CustomerLanguage,pnPlainLanguageHtml:pnPlainLanguageHtml,pnNormalizeCustomerLanguage:pnNormalizeCustomerLanguage};
