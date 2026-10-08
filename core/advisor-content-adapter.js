/* V44.49.61 ADVISOR CONTENT ADAPTER
   Scenario-aware preparation guidance. Never changes project type or canonical answers. */
'use strict';
var AdvisorContentAdapter=(function(){
  function safeText(v){return typeof esc==='function'?esc(String(v==null?'':v)):String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function scenarios(){return typeof ADVISOR_SCENARIOS!=='undefined'?ADVISOR_SCENARIOS:{};}
  function list(){var s=scenarios();return Array.isArray(s)?s:Object.keys(s).map(function(k){var x=s[k];if(x&&typeof x==='object'&&!x.id)x.id=k;return x;}).filter(Boolean);}
  function aliases(x){return [x.id,x.title].concat(x.aliases||[]).filter(Boolean).map(function(v){return String(v).toLowerCase();});}
  function match(question,context){
    var q=String(question||'').toLowerCase(),hits=[];
    list().forEach(function(x){var score=0;aliases(x).forEach(function(a){if(a&&q.indexOf(a)>=0)score=Math.max(score,a.length);});if(score)hits.push({scenario:x,score:score});});
    hits.sort(function(a,b){return b.score-a.score;});
    if(!hits.length)return {status:'none'};
    if(hits.length>1&&hits[0].score===hits[1].score)return {status:'clarify',candidates:[hits[0].scenario.id,hits[1].scenario.id],question:'Will the panel size, equipment location, or electrical power needed change?'};
    return {status:'matched',scenario:hits[0].scenario,confidence:'strong'};
  }
  function resourceById(id){
    var r=typeof PUBLIC_SERVICE_RESOURCES!=='undefined'?PUBLIC_SERVICE_RESOURCES:{};
    if(Array.isArray(r))return r.filter(function(x){return x&&x.id===id;})[0]||null;
    return r[id]||null;
  }
  function safeResource(id){var r=resourceById(id);if(!r||r.customerSafe===false)return null;try{var u=new URL(r.url);if(u.protocol!=='https:'||/sharepoint\.com$/i.test(u.hostname))return null;}catch(e){return null;}return r;}
  function resourcesHtml(ids,messageId){
    var seen={},items=(ids||[]).map(safeResource).filter(function(r){if(!r||seen[r.id])return false;seen[r.id]=1;return true;}).slice(0,3);if(!items.length)return '';
    var heading='pn-public-resources-h-'+String(messageId||Date.now()).replace(/[^A-Za-z0-9_-]/g,'-');
    return '<section class="pn-public-resources" aria-labelledby="'+heading+'"><h4 id="'+heading+'">PG&amp;E resources</h4><ul>'+items.map(function(r){return '<li><a href="'+safeText(r.url)+'" target="_blank" rel="noopener noreferrer">'+safeText(r.actionLabel||r.title)+'<span class="sr">, opens in a new tab</span></a></li>';}).join('')+'</ul></section>';
  }
  function answerHtml(result,context,messageId){
    if(result.status==='clarify')return '<div class="pn-ans"><h3 class="aq">One detail will help</h3><p>'+safeText(result.question)+'</p></div>';
    if(result.status!=='matched')return '';
    var s=result.scenario,c=context||{},next=s.nextAction||s.recommendation||c.recommendation||'',who=s.helper||s.owner||'',why=s.why||'',after=s.after||'';
    return '<div class="pn-ans"><h3 class="aq">'+safeText(s.title||'Planning guidance')+'</h3>'+(next?'<h4>A good next step</h4><p>'+safeText(next)+'</p>':'')+(who?'<h4>Who can answer this question?</h4><p>'+safeText(who)+'</p>':'')+(why?'<h4>Why this matters</h4><p>'+safeText(why)+'</p>':'')+(after?'<h4>What happens afterward</h4><p>'+safeText(after)+'</p>':'')+resourcesHtml(s.resourceIds||s.resources||[],messageId)+'</div>';
  }
  return {match:match,answerHtml:answerHtml,resourcesHtml:resourcesHtml};
})();
/* Wrap only after core/advisor.js has defined pnRespond. Grounded answers keep priority. */
if(typeof pnRespond==='function'&&!pnRespond._pnScenarioAdapter){
  var pnBaseRespond=pnRespond;
  pnRespond=function(question){
    var q=String(question||'').trim();
    if(typeof QuestionHelp!=='undefined'&&QuestionHelp.advisorHtml(q))return pnBaseRespond(q);
    if(typeof pnGroundedIntent==='function'&&pnGroundedIntent(q))return pnBaseRespond(q);
    var context=typeof pnPreparationContext==='function'?pnPreparationContext():{};
    var result=AdvisorContentAdapter.match(q,context);
    if(result.status!=='none'){
      var html=AdvisorContentAdapter.answerHtml(result,context,'msg-'+String((typeof pnHistory!=='undefined'?pnHistory.length:0)+1));
      if(html){pnAdd('assistant',html+(typeof pnBoundary==='function'?pnBoundary():'')+(typeof pnButtons==='function'?pnButtons(['Return to my plan']):''));return;}
    }
    return pnBaseRespond(q);
  };
  pnRespond._pnScenarioAdapter=true;
}
if(typeof module!=='undefined'&&module.exports)module.exports={AdvisorContentAdapter:AdvisorContentAdapter};
