'use strict';
/* Shared VM context for V45.6.9.9+ inline-response tests. */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function ctx(opts={}){const c=vm.createContext({esc,icon:()=>''});c.window=c;c.S={answers:{}};
  const files=['data.js','data/visual-example-catalog.js','data/learning-card-registry.js','data/progressive-visual-rules.js','data/progressive-insights.js']
   .concat(opts.noDocs?[]:['data/document-guidance-catalog.js','data/document-reference-examples.js','core/document-guidance-engine.js','components/document-guidance-card.js'])
   .concat(opts.noCatalog?[]:['data/answer-response-catalog.js'])
   .concat(['core/question-inline-response-engine.js','components/question-inline-response.js']);
  for(const f of files)vm.runInContext(read(f),c,{filename:f});
  c.Q=id=>({aduType:c.ADU_TYPE_QUESTION,aduAddressStatus:c.ADU_ADDRESS_STATUS_QUESTION,aduMeterServiceIntent:c.ADU_METER_SERVICE_INTENT_QUESTION,aduServiceMethod:c.ADU_SERVICE_METHOD_QUESTION,aduAdjacentService:c.ADU_ADJACENT_SERVICE_QUESTION,panelIntent:c.PANEL_INTENT_QUESTION,panelServiceMethod:c.PANEL_SERVICE_METHOD_QUESTION,panelExistingCapacity:c.PANEL_EXISTING_CAPACITY_QUESTION,panelCapacityCompare:c.PANEL_CAPACITY_COMPARE_QUESTION,panelLoads:c.PANEL_LOAD_QUESTION}[id]);
  c.derive=(pt,qid,answers,o={})=>c.QuestionInlineResponseEngine.derive({projectType:pt,question:c.Q(qid),answers,skipped:o.skipped||[],invalidatedAnswers:o.invalidatedAnswers||{}});
  return c;}
module.exports={ctx,read,root};
