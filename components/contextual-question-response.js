/* 2026-10-05: val() returned S.answers[q.id] as-is for a multichoice question (e.g. panelLoads) —
   an array, not a string. [] is truthy in JS, so the `if(!v)return html` bail in render() never
   caught the unanswered case, and esc([]) stringifies to '', producing a visible but content-less
   `About ""` accordion. Arrays now join into a readable label and an empty array now correctly
   falls through to '' (falsy), bailing out exactly like any other unanswered question. */
var ContextualQuestionResponse=(function(){function val(q){if(q.fields)return q.fields.map(function(f){return S.answers[f.id];}).filter(Boolean).join(' / ');var v=S.answers[q.id];if(Array.isArray(v))return v.join(', ');return v||'';}function render(q,html){var v=val(q);if(!v)return html;var narrow=typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(max-width: 760px)').matches;return '<details class="answer-context"'+(narrow?'':' open')+'><summary><span>About “'+esc(v)+'”</span><small>Definition, guidance, and examples</small></summary><div class="answer-context__body">'+html+'</div></details>';}return{render:render};})();
