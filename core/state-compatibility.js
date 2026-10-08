/* D9A compatibility evaluation. Does not mutate source state. */
(function(root){'use strict';
function evaluate(answerId,context){context=context||{};if((context.applicableQuestionIds||[]).indexOf(answerId)<0)return 'not_applicable';if((context.incompatibleQuestionIds||[]).indexOf(answerId)>=0)return 'invalidate';if((context.confirmationQuestionIds||[]).indexOf(answerId)>=0)return 'require_confirmation';return 'retain';}
function plan(state,context){var answers=(state&&state.answers)||{},out={retain:[],invalidate:[],not_applicable:[],require_confirmation:[]};Object.keys(answers).forEach(function(id){out[evaluate(id,context)].push(id);});return out;}
root.StateCompatibility={evaluate:evaluate,plan:plan};
})(typeof window!=='undefined'?window:this);
