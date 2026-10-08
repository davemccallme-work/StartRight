/* V45.7.2 intake simplification, loaded after events. Property remains the virtual question at
   index 0; Energy Needs is filtered from active sequences. Legacy energy may deserialize but is
   never used as current guidance. */
(function(root){'use strict';
var baseQuestions=root.questionsForProject,baseDraft=root.applicationDraftFromState,baseFastRender=root.FastInsights&&root.FastInsights.render;
if(typeof baseQuestions==='function')root.questionsForProject=function(projectType){return baseQuestions(projectType).filter(function(q){return q&&q.id!=='energy';});};
root.startFastFactsLoading=function(){
  if(root._pnFastFactsLoading)return false;if(root.S.projectType!=="adu"&&root.S.projectType!=="panel")return false;
  root.ensureResidentialPropertyDefault();root.S.step=1;root.S.questionIndex=0;root.S.fastFactsPhase="question";root.S.highestReachedQuestion=Math.max(root.S.highestReachedQuestion||0,0);root.markReached(1);
  var pending={projectType:root.S.projectType,property:root.S.answers.property};root._pnFastFactsLoading=pending;root._pnRenderIntent="navigation";root._pnNavDir="forward";root.render();root.scheduleDraftSave();
  setTimeout(function(){if(root._pnFastFactsLoading!==pending)return;root._pnFastFactsLoading=null;if(root.S.step!==1||root.S.questionIndex!==0||root.S.projectType!==pending.projectType||root.S.answers.property!==pending.property||!root.fastFactsEligible(root.S.answers.property))return;root.S.fastFactsPhase="results";root._pnRenderIntent="navigation";root.render();root.scheduleDraftSave();},1500);return true;
};
if(root.actions){root.actions['project-continue']=function(){if(root.S.projectType!=="adu"&&root.S.projectType!=="panel")return false;return root.startFastFactsLoading();};delete root.actions['fast-facts-edit'];}
if(root.FastInsights&&typeof baseFastRender==='function')root.FastInsights.render=function(c){var h=baseFastRender.call(root.FastInsights,c);return String(h).replace(/<button class="btn secondary" type="button" data-act="fast-facts-edit">Change my answer<\/button>/g,'').replace(/<span class="ff-facts__row"><strong>Property type:<\/strong>[\s\S]*?<\/span>/g,'');};
if(typeof baseDraft==='function')root.applicationDraftFromState=function(state){var d=baseDraft(state),src=state&&state.answerSources&&state.answerSources.property;if(src==='prototype-default'&&d&&d.fields&&d.fields.propertyType)d.fields.propertyType={disposition:'populate',value:state.answers.property,provenance:'prototype-default',source:'answers.property'};return d;};
})(typeof window!=='undefined'?window:this);
