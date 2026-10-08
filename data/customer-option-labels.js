/* V44.49.61 CUSTOMER LABEL COMPATIBILITY
   Keeps canonical answer values for state/routing while exposing customer-friendly labels. */
'use strict';
var CUSTOMER_OPTION_LABELS={
  energy:{
    'A separate meter or service':'A new electric meter or electrical connection',
    'More electrical capacity':'More electrical power',
    'New electric service':'A brand-new electrical connection',
    'Not sure yet':"I'm not sure yet",
    "I'm not sure":"I'm not sure yet"
  }
};
function customerOptionLabel(questionId,canonicalValue){
  var labels=CUSTOMER_OPTION_LABELS[questionId]||{};
  return labels[canonicalValue]||canonicalValue;
}
function customerOptionRecord(questionId,option){
  var item=typeof option==='string'?{value:option,title:option}:Object.assign({},option);
  item.value=item.value==null?item.title:item.value;
  item.title=customerOptionLabel(questionId,item.title==null?item.value:item.title);
  return item;
}
/* Normalize customer-visible option records after data.js is loaded. Canonical values remain unchanged. */
if(typeof QUESTIONS!=='undefined'){
  QUESTIONS.forEach(function(q){
    if(q&&q.id==='energy'&&Array.isArray(q.options))q.options=q.options.map(function(o){return customerOptionRecord(q.id,o);});
  });
}
if(typeof module!=='undefined'&&module.exports)module.exports={CUSTOMER_OPTION_LABELS:CUSTOMER_OPTION_LABELS,customerOptionLabel:customerOptionLabel,customerOptionRecord:customerOptionRecord};
