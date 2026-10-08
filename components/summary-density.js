/* V44.49.46 final-summary density controller.
   Presentation only. Does not derive, persist, or mutate customer guidance. */
(function(root){'use strict';
var SECONDARY=[
  {keys:['utility'],label:'Who may be involved',preview:'Detailed roles and responsibilities'},
  {keys:['whatNext'],label:'What happens next',preview:'Detailed preparation sequence'},
  {keys:['possible'],label:'Possible documents and preparation details',preview:'Conditional supporting guidance'},
  {keys:['costAnswer','cost','costTiers','timing'],label:'Planning references',preview:'Timing factors, methodology, and source detail'},
  {keys:['plan','decisionImpact'],label:'Planning notes and supporting details',preview:'Customer-authored notes and lower-priority planning detail'},
  {keys:['fit','beforeApply'],label:'Before formal application',preview:'Supporting boundary and handoff detail'}
];
var ALWAYS_VISIBLE=['recommended','known','confirmation','delay','finish'];
function key(card){
 if(card.querySelector('#s-next-h'))return'recommended';
 if(card.querySelector('#s-known-h'))return'known';
 if(card.querySelector('#s-confirm-h'))return'confirmation';
 if(card.querySelector('#s-delay-h')||card.classList.contains('guidance-card--delay'))return'delay';
 if(card.querySelector('#preparation-end-h'))return'finish';
 if(card.querySelector('#s-may-h'))return'possible';
 if(card.querySelector('#s-utility-h')||card.querySelector('#timing-owner-heading'))return'utility';
 if(card.querySelector('#s-whatnext-h'))return'whatNext';
 if(card.querySelector('#cost-timeline-answer-h'))return'costAnswer';
 if(card.querySelector('#cost-uncertainty-h'))return'cost';
 if(card.classList.contains('cost-tiers'))return'costTiers';
 if(card.querySelector('#s-timing-h'))return'timing';
 if(card.querySelector('#living-guide-heading')||card.classList.contains('living-guide'))return'plan';
 if(card.classList.contains('decision-impact-panel'))return'decisionImpact';
 if(card.querySelector('#where-fits-h')||card.classList.contains('where-navigator-fits'))return'fit';
 if(card.querySelector('#before-apply-h'))return'beforeApply';
 return'';
}
function disclosure(group,cards){var d=document.createElement('details');d.className='summary-density-disclosure';d.dataset.summaryDensity=group.keys.join(',');var s=document.createElement('summary');s.innerHTML='<span><strong>'+group.label+'</strong><small>'+group.preview+'</small></span><span class="summary-density-disclosure__action">Show details</span>';d.appendChild(s);var b=document.createElement('div');b.className='summary-density-disclosure__body';cards.forEach(function(c){b.appendChild(c);});d.appendChild(b);d.addEventListener('toggle',function(){var a=d.querySelector('.summary-density-disclosure__action');if(a)a.textContent=d.open?'Hide details':'Show details';});return d;}
function mount(rootNode){var guide=rootNode&&rootNode.querySelector?rootNode.querySelector('.preparation-guide'):null;if(!guide||guide.dataset.summaryDensityMounted==='1')return;var story=guide.querySelector('.preparation-guide__story');if(!story)return;var cards=Array.prototype.slice.call(story.children),map={};cards.forEach(function(c){var k=key(c);if(k)map[k]=c;});SECONDARY.forEach(function(g){var list=g.keys.map(function(k){return map[k];}).filter(Boolean);if(!list.length)return;var anchor=list[0],d=disclosure(g,list);story.insertBefore(d,anchor);});guide.dataset.summaryDensityMounted='1';}
root.SummaryDensity={mount:mount,ALWAYS_VISIBLE:ALWAYS_VISIBLE.slice(),SECONDARY:SECONDARY.slice()};
})(typeof window!=='undefined'?window:this);
