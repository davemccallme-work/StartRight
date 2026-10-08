/* ============================ events + init ============================ */
function handleDiscoverGuess(){var inp=document.getElementById("discoverInput");var v=inp?inp.value.trim():S.discoverText;S.discoverText=v;
  if(!v){toast("Add a short description first.");return;}
  setActiveQuery(v);if(!S.answers.description)S.answers.description=v;
  var sug=suggestProjectTypes(v);S.discoverCandidates=sug.candidates.map(function(c){return c.id;});S.discoverClarify=(sug.mode==="clarify"||!S.discoverCandidates.length);
  scheduleDraftSave();stableRender(".discovery","#discoverInput");}
function mountExamplesModal(modalId){setTimeout(function(){var modal=document.getElementById(modalId),overlay=document.querySelector(".photo-examples-backdrop");if(document.body){if(overlay)document.body.appendChild(overlay);if(modal)document.body.appendChild(modal);document.body.classList.add("photo-examples-open");}if(modal){try{modal.focus();}catch(e){}}},0);}
function removeExamplesModal(modalId,triggerId){var modal=document.getElementById(modalId),overlay=document.querySelector(".photo-examples-backdrop");if(modal&&modal.parentNode)modal.parentNode.removeChild(modal);if(overlay&&overlay.parentNode)overlay.parentNode.removeChild(overlay);if(document.body)document.body.classList.remove("photo-examples-open");render();setTimeout(function(){var x=document.getElementById(triggerId);if(x){try{x.focus();}catch(e){}}},0);}
function comfortableScrollToElement(target,duration,done){
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var start=window.pageYOffset||document.documentElement.scrollTop||0;
  var nav=document.querySelector(".understanding-nav"),offset=(nav?nav.offsetHeight:0)+24;
  var end=Math.max(0,target.getBoundingClientRect().top+start-offset),distance=end-start;
  if(reduce||Math.abs(distance)<2){window.scrollTo(0,end);if(done)done();return;}
  var started=null,ms=Math.max(520,Math.min(duration||820,1050));
  function easeInOut(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
  function frame(now){if(started===null)started=now;var progress=Math.min(1,(now-started)/ms);window.scrollTo(0,start+distance*easeInOut(progress));if(progress<1)requestAnimationFrame(frame);else if(done)done();}
  requestAnimationFrame(frame);
}
function setupProgressiveGuidance(){
  document.querySelectorAll("details.progressive-guidance").forEach(function(d){if(!d.hasAttribute("data-disclosure-ready")){d.open=false;d.setAttribute("data-disclosure-ready","1");}});
}
function setupResponsiveKnownSummary(){var narrow=window.matchMedia&&window.matchMedia("(max-width: 760px)").matches;document.querySelectorAll("details.responsive-known").forEach(function(d){if(!narrow){d.open=true;d.removeAttribute("data-mobile-initialized");return;}if(!d.hasAttribute("data-mobile-initialized")){d.open=false;d.setAttribute("data-mobile-initialized","1");}});}
var understandingSectionObserver=null;
function setActiveUnderstandingSection(id){document.querySelectorAll('.understanding-nav__button').forEach(function(b){if(b.getAttribute('data-section-id')===id)b.setAttribute('aria-current','location');else b.removeAttribute('aria-current');});}
function setupUnderstandingSectionObserver(){
  if(understandingSectionObserver){understandingSectionObserver.disconnect();understandingSectionObserver=null;}
  var nav=document.querySelector('.understanding-nav');if(!nav||typeof IntersectionObserver==='undefined')return;
  var buttons=nav.querySelectorAll('[data-section-id]'),targets=[];buttons.forEach(function(b){var x=document.getElementById(b.getAttribute('data-section-id'));if(x)targets.push(x);});
  understandingSectionObserver=new IntersectionObserver(function(entries){var visible=entries.filter(function(e){return e.isIntersecting;}).sort(function(a,b){return b.intersectionRatio-a.intersectionRatio;});if(visible.length)setActiveUnderstandingSection(visible[0].target.id);},{root:null,rootMargin:'-25% 0px -60% 0px',threshold:[0,.25,.6]});
  targets.forEach(function(x){understandingSectionObserver.observe(x);});
}
function updateQuestionNextButton(){var next=document.querySelector('.question-deck__arrow--next, .fast-facts [data-act="deck-next"]');if(next)next.disabled=!isQuestionResolved(activeQuestions()[S.questionIndex]);}
function questionDeckReady(direction){if(direction==="previous")return S.questionIndex>0;return isQuestionResolved(activeQuestions()[S.questionIndex]);}
var _pnFastFactsLoading=null;
/* V45.6.9.9: polite announcement after an answer change. Focus stays on the chosen control. */
function pnAnnounceInlineResponse(){if(typeof QuestionInlineResponse==='undefined')return;setTimeout(function(){QuestionInlineResponse.announce();},90);}
/* V45.6.10: image viewer + carousel enhancement after every render (idempotent). */
function pnEnhanceImages(){var app=document.getElementById('app');if(!app)return;if(typeof IllustrationCarousel!=='undefined')IllustrationCarousel.enhance(app);if(typeof ImageViewer!=='undefined'){ImageViewer.install();ImageViewer.enhance(app);}}
function commitQuestionCardMove(direction){if(_pnFastFactsLoading)return false;if(S.step===1&&S.questionIndex===0&&S.fastFactsPhase==="results")return false;if(!questionDeckReady(direction))return false;if(direction==="previous"&&S.questionIndex===1){S.questionIndex=0;S.fastFactsPhase="results";render();}else if(direction==="previous")navigateToQuestion(S.questionIndex-1);else if(S.questionIndex===0){var pending={projectType:S.projectType,property:S.answers.property};_pnFastFactsLoading=pending;render();setTimeout(function(){if(_pnFastFactsLoading!==pending)return;_pnFastFactsLoading=null;if(S.step!==1||S.questionIndex!==0||S.projectType!==pending.projectType||S.answers.property!==pending.property||!fastFactsEligible(S.answers.property))return;S.fastFactsPhase="results";_pnRenderIntent="navigation";render();scheduleDraftSave();},1500);}else if(S.questionIndex<activeQuestions().length-1)navigateToQuestion(S.questionIndex+1);else navigateToStep(2);scheduleDraftSave();return true;}
function updateProjectSelectionDom(id){
  document.querySelectorAll('[data-act="ptype"]').forEach(function(x){var on=x.getAttribute('data-id')===id;x.classList.toggle('active',on);x.setAttribute('aria-checked',on?'true':'false');var mark=x.querySelector('[data-project-mark]');if(mark)mark.innerHTML=icon(on?'check':'arrow-right',on?20:18);});
  var next=document.querySelector('[data-act="go"][data-step="1"]');if(next){next.disabled=false;next.removeAttribute('aria-describedby');}
  var help=document.getElementById('s0help');if(help)help.hidden=true;
  var selected=document.querySelector('[data-act="ptype"][data-id="'+id+'"]');if(selected){selected.classList.add('is-state-updated');setTimeout(function(){selected.classList.remove('is-state-updated');},850);try{selected.focus({preventScroll:true});}catch(err){selected.focus();}}
  pnUpdateChrome();
}
function updateExportReviewDecisionDom(field,decision){
  var dialog=document.getElementById('applicationExportReview');if(!dialog)return false;
  var scrollTop=dialog.scrollTop,scrollLeft=dialog.scrollLeft;
  var selector='[data-act="export-review-decision"][data-logical-field="'+CSS.escape(field)+'"]';
  var buttons=dialog.querySelectorAll(selector);
  buttons.forEach(function(button){var on=button.getAttribute('data-decision')===decision;button.classList.toggle('is-active',on);button.setAttribute('aria-pressed',on?'true':'false');});
  var status=dialog.querySelector('[data-export-review-status]');
  if(status)status.textContent=decision==='include'?'Draft choice updated: include this item.':'Draft choice updated: leave this item blank.';
  dialog.scrollTop=scrollTop;dialog.scrollLeft=scrollLeft;
  if(typeof requestAnimationFrame==='function')requestAnimationFrame(function(){var current=document.getElementById('applicationExportReview');if(current===dialog){current.scrollTop=scrollTop;current.scrollLeft=scrollLeft;}});
  return true;
}
function updateConfirmationDispositionDom(kind,id,disposition){
  var row=document.querySelector('[data-confirm-label="'+CSS.escape(id)+'"]');if(!row)return false;
  row.querySelectorAll('[data-act="planning-disposition"]').forEach(function(x){var on=x.getAttribute('data-disposition')===disposition;x.classList.toggle('is-active',on);x.setAttribute('aria-pressed',on?'true':'false');});
  row.classList.add('is-state-updated');setTimeout(function(){row.classList.remove('is-state-updated');},850);
  var active=row.querySelector('[data-disposition="'+disposition+'"]');if(active){try{active.focus({preventScroll:true});}catch(err){active.focus();}}
  return true;
}
/* 2026-10-06: on mobile, picking an answer opened the inline-response accordion below and the page jumped.
   Two causes: (1) the pin was taken on the question card's top, but the card is taller than the screen so
   its top is off-screen and says nothing about where the tapped option sits; (2) the correction ran a frame
   late (rAF) after the browser had already painted/anchored the swapped DOM. Now the tapped control itself
   (the focusSelector element's label, when given and on-screen) is the anchor, the correction is applied
   synchronously right after the swap, then re-checked next frame for late layout (images/fonts). The
   browser's own scroll anchoring is switched off for the swap so it can't double-correct. */
function stableRender(anchorSelector,focusSelector){
  function pick(){var f=focusSelector&&document.querySelector(focusSelector),fl=f&&f.closest?(f.closest("label")||f):null;if(fl){var r=fl.getBoundingClientRect();if(r.bottom>0&&r.top<(window.innerHeight||0))return{sel:focusSelector,label:true,top:r.top};}var a=anchorSelector?document.querySelector(anchorSelector):document.querySelector("#app");return a?{sel:anchorSelector||"#app",label:false,top:a.getBoundingClientRect().top}:null;}
  function node(pin){var e=document.querySelector(pin.sel);return e&&pin.label&&e.closest?(e.closest("label")||e):e;}
  var pin=pick(),x=window.pageXOffset||0,app=document.getElementById("app"),root=document.documentElement;
  function restore(){if(!pin)return;var n=node(pin);if(!n)return;var d=n.getBoundingClientRect().top-pin.top;if(Math.abs(d)>1)window.scrollTo(x,(window.pageYOffset||0)+d);}
  if(root)root.style.overflowAnchor="none";if(app)app.style.overflowAnchor="none";
  _pnRenderIntent="state";_pnMorph=true;try{render();}finally{_pnMorph=false;}
  restore();
  var after=anchorSelector?document.querySelector(anchorSelector):document.querySelector("#app");if(after){after.classList.add("is-state-updated");setTimeout(function(){after.classList.remove("is-state-updated");},850);}
  var focus=focusSelector&&document.querySelector(focusSelector);if(focus){try{focus.focus({preventScroll:true});}catch(err){focus.focus();}}
  requestAnimationFrame(function(){restore();if(root)root.style.overflowAnchor="";if(app)app.style.overflowAnchor="";});
}
var advisorReturnFocus=null;
var workspaceResetReturnFocus=null;
function setWorkspaceResetOpen(open){
  var dialog=document.getElementById("resetWorkspaceDialog"),backdrop=document.getElementById("resetWorkspaceBackdrop");
  if(!dialog||!backdrop)return;
  dialog.hidden=!open;backdrop.hidden=!open;
  document.body.classList.toggle("reset-workspace-open",open);
  if(open){setTimeout(function(){var safe=dialog.querySelector('[data-act="cancel-workspace-reset"]');if(safe)safe.focus();else dialog.focus();},0);}
}
function closeWorkspaceReset(){setWorkspaceResetOpen(false);var target=workspaceResetReturnFocus;workspaceResetReturnFocus=null;setTimeout(function(){if(target&&document.contains(target))target.focus();},0);}
var summarySectionObserver=null;
function summarySectionTargets(){var out=[];document.querySelectorAll('.summary-section-nav__button[data-section-id]').forEach(function(b){var x=document.getElementById(b.getAttribute('data-section-id'));if(x)out.push(x.closest('section')||x);});return out;}
function setActiveSummarySection(id){var label='';document.querySelectorAll('.summary-section-nav__button').forEach(function(b){var on=b.getAttribute('data-section-id')===id;b.classList.toggle('is-active',on);if(on){b.setAttribute('aria-current','location');label=b.textContent||'';try{b.scrollIntoView({block:'nearest',inline:'center'});}catch(e){}}else b.removeAttribute('aria-current');});var status=document.querySelector('.summary-section-nav__status');if(status&&label)status.textContent='Current guide section: '+label;}
function setupSummarySectionObserver(){if(summarySectionObserver){summarySectionObserver.disconnect();summarySectionObserver=null;}var nav=document.querySelector('.summary-section-nav');if(!nav||typeof IntersectionObserver==='undefined')return;summarySectionObserver=new IntersectionObserver(function(entries){var visible=entries.filter(function(e){return e.isIntersecting;}).sort(function(a,b){return b.intersectionRatio-a.intersectionRatio;});if(visible.length){var h=visible[0].target.querySelector('[id]');if(h)setActiveSummarySection(h.id);}}, {root:null,rootMargin:'-20% 0px -55% 0px',threshold:[0,.2,.55]});summarySectionTargets().forEach(function(x){summarySectionObserver.observe(x);});}
function moveSummarySection(direction){var buttons=[].slice.call(document.querySelectorAll('.summary-section-nav__button')),active=document.querySelector('.summary-section-nav__button.is-active'),i=Math.max(0,buttons.indexOf(active)),next=Math.max(0,Math.min(buttons.length-1,i+direction));if(buttons[next])actions['summary-section-jump'](buttons[next]);}
var pnNavigationLockedUntil=0;
var pnApplyingBrowserHistory=false;
function pnIsTextEditingTarget(target){if(!target)return false;var tag=String(target.tagName||'').toLowerCase();return tag==='input'||tag==='textarea'||tag==='select'||target.isContentEditable===true;}
function pnNavigationSnapshot(){return {pn:true,step:S.step,questionIndex:S.questionIndex||0,fastFactsPhase:S.step===1&&S.questionIndex===0?S.fastFactsPhase:"question"};}
function pnRecordBrowserNavigation(previous){if(pnApplyingBrowserHistory)return;var next=pnNavigationSnapshot();if(previous&&previous.step===next.step&&previous.questionIndex===next.questionIndex&&previous.fastFactsPhase===next.fastFactsPhase)return;try{history.pushState(next,'',location.href);}catch(e){}}
function pnRunNavigation(action){var now=Date.now();if(now<pnNavigationLockedUntil)return false;pnNavigationLockedUntil=now+520;var before=pnNavigationSnapshot();action();setTimeout(function(){pnRecordBrowserNavigation(before);},0);return true;}
function pnVisibleAdvanceControl(){if(_pnFastFactsLoading)return null;if(S.step===1&&S.questionIndex===0&&S.fastFactsPhase==="results")return document.querySelector('[data-act="fast-facts-continue"]');if(S.step===0)return document.querySelector('#app [data-act="project-continue"]:not(:disabled)');if(S.step===1)return document.querySelector('[data-act="deck-next"]:not(:disabled)');if(S.step===2)return document.querySelector('#app [data-act="understanding-next"]:not(:disabled)');return document.querySelector('#app [data-act="go"]:not(:disabled),#app [data-act="next"]:not(:disabled)');}
function pnVisibleBackControl(){if(_pnFastFactsLoading)return document.querySelector('[data-act="fast-facts-edit"]');if(S.step===1&&S.questionIndex===0&&S.fastFactsPhase==="results")return document.querySelector('[data-act="fast-facts-edit"]');if(S.step===1&&S.questionIndex>0)return document.querySelector('[data-act="deck-previous"]:not(:disabled)');return document.querySelector('#app [data-act="back"]:not(:disabled)');}
function setupPredictableHistory(){try{history.replaceState(pnNavigationSnapshot(),'',location.href);}catch(e){}window.addEventListener('popstate',function(e){_pnFastFactsLoading=null;var target=e.state;if(!target||target.pn!==true)return;pnApplyingBrowserHistory=true;pnNavigationLockedUntil=Date.now()+520;if(target.step===1&&typeof target.questionIndex==='number'){S.fastFactsPhase=target.fastFactsPhase==="results"&&target.questionIndex===0&&fastFactsEligible(S.answers.property)?"results":"question";navigateToStep(1);navigateToQuestion(target.questionIndex);}else navigateToStep(target.step);setTimeout(function(){pnApplyingBrowserHistory=false;},0);});}
function setupKeyboardScreenNavigation(){document.addEventListener('keydown',function(e){if(e.defaultPrevented||e.repeat||e.altKey||e.ctrlKey||e.metaKey||pnIsTextEditingTarget(e.target))return;var control=null;/* V45.6.9.8: Enter on a focused link, button, or disclosure keeps its native action (keyboard-operable in-page navigation). */if(e.key==='Enter'&&e.target&&e.target.closest&&e.target.closest('a[href],button,summary,[role="button"],[role="link"]'))return;if(e.key==='Enter')control=pnVisibleAdvanceControl();else if(e.key==='Backspace'||e.key==='Delete')control=pnVisibleBackControl();if(!control)return;e.preventDefault();pnRunNavigation(function(){control.click();});});}

var actions={
  "arrival-begin":function(){arrivalBegin();_pnRenderIntent="navigation";_pnNavDir="forward";render();},
  "recognition-confirm":function(b){var i=parseInt(b.getAttribute("data-candidate-index"),10);if(confirmRecognitionCandidate(S,i)){scheduleDraftSave();stableRender(".recognition-review",null);}},
  "recognition-reject":function(b){var i=parseInt(b.getAttribute("data-candidate-index"),10);rejectRecognitionCandidate(S,i);stableRender(".recognition-review",null);},
  "recognition-dismiss":function(){S.recognitionReview.open=false;stableRender("#app",null);},
  "arrival-continue":function(){if(!arrivalContinue()){toast("Choose an entry point to continue.");return;} _pnRenderIntent="navigation";_pnNavDir="forward";render();},
  "arrival-start-navigator":function(){if(!arrivalEnterNavigator())return;_pnRenderIntent="navigation";_pnNavDir="forward";render();},
  "arrival-back-selector":function(){arrivalBackToSelector();_pnRenderIntent="navigation";_pnNavDir="back";render();setTimeout(function(){var x=document.getElementById(ArrivalScene.returnFocusId);if(x){try{x.focus();}catch(e){}}},0);},
  ptype:function(b){var id=b.getAttribute("data-id");if(id!=="unsure"&&typeof isDeepScenario==="function"&&!isDeepScenario(id)){toast(typeof ILLUSTRATIVE_NOTE!=="undefined"?ILLUSTRATIVE_NOTE:"Additional project types will be added over time.");return;}setProjectType(id);scheduleDraftSave();_pnRenderIntent="state";render();setTimeout(function(){var c=document.querySelector('[data-act="project-continue"]'),x=document.getElementById("discoverInput");if(c)c.focus();else if(x)x.focus();},0);},
  go:function(b){_pnRenderIntent="navigation";navigateToStep(parseInt(b.getAttribute("data-step"),10));},
  "project-continue":function(){if(S.projectType==="adu"||S.projectType==="panel"){S.questionIndex=0;S.fastFactsPhase="question";_pnRenderIntent="navigation";navigateToStep(1);}},
  "understanding-next":function(){continueFromUnderstanding();},
  /* "Try a simulated document check" (components/simulated-document-check.js) — the component owns
     its own session-only state and calls stableRender() itself (including from its own setTimeout
     callbacks for the timed add/processing phases), so these handlers just forward the click;
     calling stableRender() again here would double-render. */
  "simdoc-select":function(b){if(typeof SimulatedDocumentCheck!=="undefined")SimulatedDocumentCheck.select(b.getAttribute("data-fixture"));},
  "simdoc-check":function(){if(typeof SimulatedDocumentCheck!=="undefined")SimulatedDocumentCheck.check();},
  "simdoc-remove":function(){if(typeof SimulatedDocumentCheck!=="undefined")SimulatedDocumentCheck.remove();},
  jump:function(b){_pnRenderIntent="navigation";navigateToStep(parseInt(b.getAttribute("data-step"),10));},
  /* V45.8.0 two-level navigation (components/project-navigation.js). Routed through this existing
     delegated actions table rather than a second click listener, per the build spec. */
  "project-nav-step":function(b){if(typeof ProjectNavigation!=="undefined")ProjectNavigation.navigateStep(parseInt(b.getAttribute("data-project-nav-step"),10));},
  "project-nav-anchor":function(b){if(typeof ProjectNavigation!=="undefined")ProjectNavigation.navigateAnchor(b.getAttribute("data-project-nav-target"));},
  "project-nav-drawer-toggle":function(b){if(typeof ProjectNavigation!=="undefined")ProjectNavigation.toggleDrawer(b);},
  back:function(){_pnRenderIntent="navigation";if(S.step===1&&S.questionIndex===1){S.questionIndex=0;S.fastFactsPhase=fastFactsEligible(S.answers.property)?"results":"question";render();}else if(S.step===1&&S.questionIndex===0&&S.fastFactsPhase==="results"){S.fastFactsPhase="question";render();}else if(S.step===1&&S.questionIndex>0)navigateToQuestion(S.questionIndex-1);else if(S.step>0)navigateToStep(S.step-1);},
  "jump-question":function(b){var i=parseInt(b.getAttribute("data-question-index"),10),max=Math.max(S.highestReachedQuestion||0,S.questionIndex);if(!isNaN(i)&&i<=max){if(i===0)S.fastFactsPhase=fastFactsEligible(S.answers.property)?"results":"question";navigateToQuestion(i);setTimeout(function(){var h=document.getElementById("question-heading");if(h){try{h.focus();}catch(e){}}},0);scheduleDraftSave();}},
  "deck-previous":function(){_pnRenderIntent="navigation";commitQuestionCardMove("previous");},
  "deck-next":function(){_pnRenderIntent="navigation";commitQuestionCardMove("next");},
  "fast-facts-edit":function(){_pnFastFactsLoading=null;S.questionIndex=0;S.fastFactsPhase="question";_pnRenderIntent="navigation";render();scheduleDraftSave();},
  "fast-facts-project":function(){_pnFastFactsLoading=null;S.fastFactsPhase="question";_pnRenderIntent="navigation";navigateToStep(0);scheduleDraftSave();},
  "fast-facts-continue":function(){if(S.step!==1||S.questionIndex!==0||S.fastFactsPhase!=="results"||!fastFactsEligible(S.answers.property))return;_pnRenderIntent="navigation";navigateToQuestion(1);scheduleDraftSave();},
  /* 2026-10-05: used to force open a details.progressive-guidance ancestor before scrolling — that
     wrapper no longer exists (core/v45.8.7-summary-accordions.js's transformUnderstanding() now
     accordions every section here the same way the summary page already does), and jumping to a
     collapsed row without opening it is exactly that page's own existing anchor behavior, not a
     regression — matched here instead of re-adding a force-open step. */
  "jump-understanding-section":function(b){var id=b.getAttribute("data-section-id"),x=document.getElementById(id);if(!x)return;setActiveUnderstandingSection(id);comfortableScrollToElement(x,820,function(){try{x.focus({preventScroll:true});}catch(e){try{x.focus();}catch(err){}}});},
  "summary-nav-scroll":function(b){var track=document.querySelector(".summary-section-nav--inbox .summary-section-nav__track"),dir=parseInt(b.getAttribute("data-direction"),10)||1;if(track)track.scrollBy({left:dir*Math.max(180,track.clientWidth*.72),behavior:(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)?"auto":"smooth"});},
  "summary-section-jump":function(b){var id=b.getAttribute("data-section-id"),x=document.getElementById(id);if(!x)return;setActiveSummarySection(id);var target=x.closest("section")||x,nav=document.querySelector(".summary-section-nav"),offset=(nav?nav.getBoundingClientRect().height:0)+14,top=Math.max(0,target.getBoundingClientRect().top+(window.pageYOffset||0)-offset);window.scrollTo({top:top,behavior:(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)?"auto":"smooth"});setTimeout(function(){try{x.focus({preventScroll:true});}catch(e){}},420);},
  "review-insight-answer":function(b){var qid=b.getAttribute("data-question-id"),field=b.getAttribute("data-field-id"),qs=activeQuestions(),i=-1;for(var n=0;n<qs.length;n++)if(qs[n].id===qid){i=n;break;}if(i<0)return;if(typeof InsightInstrumentation!=="undefined")InsightInstrumentation.reviewed(b.getAttribute("data-insight-id"),field||qid);S.step=1;S.fastFactsPhase="question";navigateToQuestion(i);setTimeout(function(){var h=field?document.querySelector("[data-answer-key=\""+CSS.escape(field)+"\"]"):document.getElementById("question-heading");if(h){h.tabIndex=-1;h.focus();}},0);scheduleDraftSave();},
  "insight-feedback":function(b){if(typeof InsightInstrumentation!=="undefined")InsightInstrumentation.action("insight-feedback-submitted",b.getAttribute("data-insight-id"),{value:b.getAttribute("data-value")});toast("Thanks for the feedback.");},
  "insight-feedback-reason":function(b){if(typeof InsightInstrumentation!=="undefined")InsightInstrumentation.action("insight-feedback-reason-selected",b.getAttribute("data-insight-id"),{reason:b.getAttribute("data-value"),riskSignal:b.getAttribute("data-value")==="It sounded like a requirement"});toast("Thanks. Your reason was recorded.");},
  next:function(){var qs=activeQuestions();if(S.questionIndex<qs.length-1)navigateToQuestion(S.questionIndex+1);else navigateToStep(2);scheduleDraftSave();},
  choice:function(b){var q=activeQuestions()[S.questionIndex];setAnswer(q.id,b.getAttribute("data-val"));render();scheduleDraftSave();},
  /* 2026-10-05: was a bare render() — the only answer-setting action in this table not routed through
     stableRender(), unlike the native-radio choice/example and multi-choice/compare-choice handlers
     below, which all anchor on the question card so picking an answer never shifts scroll position. */
  example:function(b){var q=activeQuestions()[S.questionIndex];var ex=b.getAttribute("data-ex");setAnswer(q.id,ex);stableRender("[data-question-card]",'[data-act="example"][data-ex="'+CSS.escape(ex)+'"]');scheduleDraftSave();},
  skip:function(){var qs=activeQuestions();var q=qs[S.questionIndex];if(S.skipped.indexOf(q.id)<0)S.skipped.push(q.id);if(q.fields&&q.fields.length){q.fields.forEach(function(f){S.answers[f.id]="";});}else{S.answers[q.id]=(q.type==="multichoice")?[]:"";}if(S.questionIndex<qs.length-1)navigateToQuestion(S.questionIndex+1);else navigateToStep(2);scheduleDraftSave();},
  togglewhy:function(){S.whyOpen=!S.whyOpen;stableRender("[data-question-card]",'[data-act="togglewhy"]');},
  reject:function(b){var a=b.getAttribute("data-a");if(S.rejected.indexOf(a)<0)S.rejected.push(a);S.rejectedOpen=true;persistDraft(false);render();},
  restore:function(b){var a=b.getAttribute("data-a");var i=S.rejected.indexOf(a);if(i>=0)S.rejected.splice(i,1);S.rejectedOpen=(S.rejected.length>0);persistDraft(false);render();},
  /* 2026-10-06: scoped swap of just the previously-open and newly-toggled topic cards (same pattern as
     SimulatedDocumentCheck.rerender) instead of a full render(), so the page, sibling cards and every
     other <details> are never rebuilt; the clicked card's viewport position is pinned so closing a
     card above it can't shift the reader's place. Falls back to stableRender() if a card can't be found. */
  acc:function(b){var id=b.getAttribute("data-id"),prev=S.openDecision;S.openDecision=(prev===id)?"":id;
    var ids=[id];if(prev&&prev!==id)ids.push(prev),ids.reverse();
    var cards=ids.map(function(i){return document.querySelector('[data-decision-id="'+CSS.escape(i)+'"]');}),defs=ids.map(function(i){return DECISIONS.filter(function(d){return d.id===i;})[0];});
    if(typeof decisionWorkspaceCard!=="function"||cards.some(function(c){return!c;})||defs.some(function(d){return!d;})){stableRender('[data-decision-id="'+id+'"]','[data-decision-id="'+id+'"] .readiness-card__head');return;}
    var anchor=document.querySelector('[data-decision-id="'+CSS.escape(id)+'"]'),top=anchor.getBoundingClientRect().top;
    cards.forEach(function(c,i){c.outerHTML=decisionWorkspaceCard(defs[i]);});
    var after=document.querySelector('[data-decision-id="'+CSS.escape(id)+'"]'),delta=after.getBoundingClientRect().top-top;
    if(Math.abs(delta)>1)window.scrollTo(window.pageXOffset||0,(window.pageYOffset||0)+delta);
    var head=after.querySelector(".readiness-card__head");if(head){try{head.focus({preventScroll:true});}catch(err){head.focus();}}},
  "decision-status":function(b){var id=b.getAttribute("data-id"),disposition=b.getAttribute("data-disposition")||normalizePlanningDisposition(b.getAttribute("data-status"));setPlanningRecord("decision",id,{disposition:disposition});stableRender('[data-decision-id="'+id+'"]','[data-decision-id="'+id+'"] [data-disposition="'+disposition+'"]');scheduleDraftSave();},
  "planning-disposition":function(b){var kind=b.getAttribute("data-kind"),id=b.getAttribute("data-record-id"),disposition=b.getAttribute("data-disposition");setPlanningRecord(kind,id,{disposition:disposition});if(kind!=="confirm"||!updateConfirmationDispositionDom(kind,id,disposition))stableRender("#app",null);scheduleDraftSave();},
  "decision-focus":function(b){var id=b.getAttribute("data-id");S.openDecision=id;render();setTimeout(function(){var x=document.querySelector('[data-decision-id="'+id+'"]');if(x)comfortableScrollToElement(x,700,function(){var h=x.querySelector(".readiness-card__head");if(h)h.focus();});},0);},
  "toggle-other":function(){S.otherOpen=!S.otherOpen;render();},
  "open-glossary":function(){if(typeof openGlossary==="function")openGlossary();},
  definition:function(b){var def=document.getElementById(b.getAttribute("data-def"));if(def){var open=def.hasAttribute("hidden");if(open)def.removeAttribute("hidden");else def.setAttribute("hidden","");b.setAttribute("aria-expanded",open?"true":"false");}},
  "discover-guess":handleDiscoverGuess,
  "pick-candidate":function(b){var id=b.getAttribute("data-id");if(id!=="unsure"&&typeof isDeepScenario==="function"&&!isDeepScenario(id)){toast(typeof ILLUSTRATIVE_NOTE!=="undefined"?ILLUSTRATIVE_NOTE:"This journey is illustrative only in this research build.");return;}setProjectType(id);S.discoverCandidates=[id];S.discoverClarify=false;stableRender(".discovery",'[data-act="ptype"][data-id="'+id+'"]');scheduleDraftSave();toast("Using this to tailor your next questions \u2014 you can change it anytime.");},
  pnav:function(b){advisorReturnFocus=b||document.activeElement;pnOpen(S.activeCustomerQuery||S.discoverText||"");},
  "pnav-seed":function(b){advisorReturnFocus=b||document.activeElement;pnOpen(b.getAttribute("data-question")||"");},
  "edit-question":function(b){var id=b.getAttribute("data-question-id"),qs=activeQuestions(),idx=-1;qs.forEach(function(q,i){if(q.id===id)idx=i;});if(idx>=0)navigateToQuestion(idx);},
  "show-photo-examples":function(){panelPhotoExamplesOpen=true;render();mountExamplesModal("panelPhotoExamples");},
  "close-photo-examples":function(){panelPhotoExamplesOpen=false;removeExamplesModal("panelPhotoExamples","panelPhotoExamplesTrigger");},
  "show-document-examples":function(b){aduDocumentExampleOpen=b.getAttribute("data-document")||"";render();mountExamplesModal("documentExamplesModal");},
  "close-document-examples":function(){var key=aduDocumentExampleOpen,rec=ADU_DOCUMENT_EXAMPLES[key];aduDocumentExampleOpen="";removeExamplesModal("documentExamplesModal",rec?("aduDocumentExampleTrigger-"+rec.id):"");},
  "open-export-review":function(){applicationExportReviewOpen=true;render();setTimeout(function(){var d=document.getElementById('applicationExportReview');if(d){try{d.focus();}catch(e){}}},0);},
  "close-export-review":function(){applicationExportReviewOpen=false;render();setTimeout(function(){var b=document.querySelector('[data-act="open-export-review"]');if(b){try{b.focus();}catch(e){}}},0);},
  "export-review-decision":function(b){var field=b.getAttribute('data-logical-field'),decision=b.getAttribute('data-decision'),m=createApplicationExportManifest(S),item=null;m.confirmBeforeAdding.forEach(function(x){if(x.logicalField===field)item=x;});if(!item)return;setExportReviewDecision(S.projectType,field,decision,item.value);updateExportReviewDecisionDom(field,decision);scheduleDraftSave();},
  "edit-export-question":function(b){var id=b.getAttribute('data-question-id'),qs=activeQuestions(),idx=-1;qs.forEach(function(q,i){if(q.id===id)idx=i;});applicationExportReviewOpen=false;if(idx>=0){navigateToQuestion(idx);setTimeout(function(){var h=document.getElementById('question-heading');if(h)h.focus();},0);}},
  "download-editable-form-draft":function(){
    var dialog=document.getElementById('applicationExportReview'),status=dialog&&dialog.querySelector('[data-export-review-status]');
    try{
      var reviewed=createReviewedApplicationExportPlan(S),gate=canOfferEditableForm791216Draft({route:S.projectType,projectType:S.projectType,reviewedPlan:reviewed});
      if(!gate.allowed)throw new Error(gate.reason||'draft-not-available');
      if(typeof createEditableForm791216Pdf!=='function')throw new Error('pdf-writer-unavailable');
      if(status)status.textContent='Preparing the editable draft on this device.';
      var draft=buildEditableForm791216Values(reviewed,FORM_79_1216_SCHEMA);
      Promise.resolve(createEditableForm791216Pdf(draft)).then(function(result){
        if(!result||!result.bytes)throw new Error('pdf-writer-returned-no-bytes');
        var blob=new Blob([result.bytes],{type:'application/pdf'}),url=URL.createObjectURL(blob),link=document.createElement('a');
        link.href=url;link.download=result.fileName||'Form-79-1216-editable-draft.pdf';document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);
        if(status)status.textContent='Editable draft downloaded. Review every field before using it. Nothing was submitted.';toast('Editable draft downloaded.');
      }).catch(function(){if(status)status.textContent='The editable draft could not be created on this device. Your Project Navigator answers are unchanged.';toast('Editable draft unavailable on this device.');});
    }catch(e){if(status)status.textContent='The editable draft is not available for the current review. Your Project Navigator answers are unchanged.';toast('Editable draft unavailable.');}
  },
  "open-workspace-reset":function(b){workspaceResetReturnFocus=b||document.activeElement;setWorkspaceResetOpen(true);},
  "cancel-workspace-reset":function(){closeWorkspaceReset();},
  "confirm-workspace-reset":function(){setWorkspaceResetOpen(false);if(typeof QuestionInlineResponse!=="undefined")QuestionInlineResponse.reset();workspaceResetReturnFocus=null;clearCustomerWorkspace();render();toast("Your answers and locally saved progress were cleared. Downloaded files were not changed.");},
  save:function(){save();},
  copy:function(){var t=summaryText();if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(function(){toast("Preparation guide copied.");},function(){toast("Copy unavailable \u2014 select the text manually.");});}else{toast("Copy unavailable.");}},
  download:function(){try{var blob=new Blob([summaryText()],{type:"text/plain"});var url=URL.createObjectURL(blob);var a=document.createElement("a");a.href=url;a.download="Project-Navigator-V44-preparation-guide.txt";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);toast("Preparation guide downloaded.");}catch(e){toast("Download unavailable on this device.");}}
};
function updateUnderstandingNavOffset(){
  var header=document.querySelector("header.app"),height=header?Math.ceil(header.getBoundingClientRect().height):64;
  document.documentElement.style.setProperty("--app-sticky-header-height",height+"px");
}
function setupUnderstandingNavOffset(){
  updateUnderstandingNavOffset();
  var header=document.querySelector("header.app");
  if(header&&typeof ResizeObserver!=="undefined"&&!header._pnStickyResizeObserver){header._pnStickyResizeObserver=new ResizeObserver(updateUnderstandingNavOffset);header._pnStickyResizeObserver.observe(header);}
}
function updateSummaryCarouselChromeOffset(){
  var header=document.querySelector('header.app'),topic=document.querySelector('.topicbar'),bottom=0;
  [header,topic].forEach(function(x){if(x){var r=x.getBoundingClientRect();bottom=Math.max(bottom,r.bottom);}});
  document.documentElement.style.setProperty('--summary-chrome-top',Math.ceil(Math.max(64,bottom)+8)+'px');
}
/* V45.8.0: GuidanceWorkspace (step 4's paginated single-section rail) and FastFactsWorkspace's own
   "On this page" rail are no longer mounted — components/project-navigation.js's mega menu is now
   the sole section nav for every step, including the Fast Facts results sub-phase and Your guidance
   (see core/navigation-model.js's discoverFastFactsDestinations() and the expanded "guidance" topic
   destinations). GuidanceWorkspace.mount() also attached its own app-level click/keydown listeners,
   which this removes along with it — components/project-navigation.js's own header comment is the
   guardrail this restores. Neither module's render()/content functions were touched, so their own
   tests (and FastFactsWorkspace.render()'s content, still used for the reading pane) are unaffected. */
function initializeCurrentScreenEnhancements(){var app=document.getElementById('app');if(typeof GlossaryController!=='undefined')GlossaryController.mount(app);setupProgressiveGuidance();setupResponsiveKnownSummary();pnEnhanceImages();}

function initEvents(){
  setupUnderstandingNavOffset();
  setupPredictableHistory();
  setupKeyboardScreenNavigation();
  if(typeof ProjectNavigation!=="undefined"&&ProjectNavigation&&typeof ProjectNavigation.initialize==="function")ProjectNavigation.initialize();
  /* V45.7.5.9.9: bridges the Scenario Guide's decoupled reset dispatch (window.dispatchEvent) into the
     same governed confirmation flow the data-act="open-workspace-reset" control uses. */
  window.addEventListener("open-workspace-reset",function(e){actions["open-workspace-reset"](e&&e.detail&&e.detail.returnFocus);});
  window.addEventListener("resize",function(){updateUnderstandingNavOffset();updateSummaryCarouselChromeOffset();if(typeof updateSummaryNavOverflow==='function')updateSummaryNavOverflow();setupResponsiveKnownSummary();});
  drawer=document.getElementById("pnDrawer");backdrop=document.getElementById("pnBackdrop");launch=document.getElementById("pnLaunch");
  pnLog=document.getElementById("pnLog");pnForm=document.getElementById("pnForm");pnInput=document.getElementById("pnInput");pnContext=document.getElementById("pnContext");
  if(pnLog){pnLog.setAttribute("aria-live","polite");pnLog.setAttribute("aria-relevant","additions text");pnLog.setAttribute("aria-atomic","false");}
  document.addEventListener("click", function(e) {
  var b = e.target.closest
    ? e.target.closest("[data-act]")
    : null;

  if (!b) {
    return;
  }

  /*
    Native radio inputs are handled by the change listener below.
    Do not route them through the legacy button action, which expects data-val.
  */
    if (b.matches && b.matches('input[type="radio"],input[type="checkbox"]')) {
    return;
  }

  var h = actions[b.getAttribute("data-act")];

  if (h) {
    var act=b.getAttribute("data-act"),isNav=/^(go|project-continue|understanding-next|jump|back|next|deck-next|deck-previous|jump-question|fast-facts-edit|fast-facts-project|fast-facts-continue|project-nav-step)$/.test(act);
    if(isNav){var before=pnNavigationSnapshot();h(b);setTimeout(function(){pnRecordBrowserNavigation(before);},0);}
    else h(b);
  }
});
  document.addEventListener("input",function(e){var b=e.target.closest?e.target.closest('[data-act="answer"]'):null;
    if(b){var q=activeQuestions()[S.questionIndex];setAnswer(q.id,e.target.value);var has=!!e.target.value.trim();document.querySelectorAll('[data-act="next"]').forEach(function(x){x.disabled=!has;});updateQuestionNextButton();scheduleDraftSave();return;}
    var d=e.target.closest?e.target.closest('[data-act="discover-input"]'):null;if(d){S.discoverText=e.target.value;scheduleDraftSave();return;}
    var loc=e.target.closest?e.target.closest('[data-act="location-input"]'):null;if(loc){S.answers.projectLocation=e.target.value;scheduleDraftSave();}});
  /* V44.11: native radio choices preserve the existing choice/example state contract. */
  document.addEventListener("change",function(e){
    var r=e.target;
    if(!r)return;
    if(r.type==="checkbox"&&r.getAttribute("data-act")==="multi-choice"){
      var mq=activeQuestions()[S.questionIndex];if(!mq||mq.type!=="multichoice")return;
      var values=Array.isArray(S.answers[mq.id])?S.answers[mq.id].slice():[];
      var exclusive=mq.exclusiveOptions||[];var value=r.value;
      if(r.checked){
        if(exclusive.indexOf(value)>=0)values=[value];
        else{values=values.filter(function(x){return exclusive.indexOf(x)<0;});if(values.indexOf(value)<0)values.push(value);}
      }else values=values.filter(function(x){return x!==value;});
      setAnswer(mq.id,normalizePanelLoads(values));
      var mi=S.skipped.indexOf(mq.id);if(mi>=0)S.skipped.splice(mi,1);
      updateQuestionNextButton();
      stableRender("[data-question-card]",'[data-act="multi-choice"][value="'+CSS.escape(value)+'"]');scheduleDraftSave();pnAnnounceInlineResponse();return;
    }
    if(r.type!=="radio")return;
    var act=r.getAttribute("data-act");
    if(act==="arrival-channel"){
      if(!arrivalSelectChannel(r.value))return;
      var continueButton=document.querySelector('[data-act="arrival-continue"]');if(continueButton){continueButton.disabled=false;continueButton.removeAttribute("aria-describedby");}
      var help=document.getElementById("arrival-choice-help");if(help)help.hidden=true;
      return;
    }
    if(act==="compare-choice"){
      var ckey=r.getAttribute("data-answer-key");if(!ckey)return;
      setCanonicalAnswer(ckey,r.value);
      var cq=activeQuestions()[S.questionIndex];if(cq){var csi=S.skipped.indexOf(cq.id);if(csi>=0)S.skipped.splice(csi,1);}
      updateQuestionNextButton();
      stableRender("[data-question-card]",'[data-answer-key="'+CSS.escape(ckey)+'"][value="'+CSS.escape(r.value)+'"]');scheduleDraftSave();pnAnnounceInlineResponse();return;
    }
    if(act!=="choice"&&act!=="example")return;
    if(S.step===1&&S.questionIndex===0&&S.fastFactsPhase==="question"&&(!r.closest(".fast-facts")||!fastFactsEligible(r.value)))return;
    var q=activeQuestions()[S.questionIndex];if(!q)return;
    setCanonicalAnswer(q.id,(act==="example")?(r.getAttribute("data-ex")||r.value):r.value);
    if(q.id==="panelIntent"&&r.value!=="Increase the panel capacity")S.answers.panelProposedCapacity="";
    var i=S.skipped.indexOf(q.id);if(i>=0)S.skipped.splice(i,1);
    updateQuestionNextButton();
    stableRender(S.step===1&&S.questionIndex===0?".fast-facts":"[data-question-card]",'[data-act="'+act+'"][value="'+CSS.escape(r.value)+'"]');scheduleDraftSave();pnAnnounceInlineResponse();
  });
  function closeAdvisorAndRestoreFocus(){
    pnClose();
    var target=advisorReturnFocus||launch;
    advisorReturnFocus=null;
    setTimeout(function(){if(target&&document.contains(target)){try{target.focus();}catch(e){}}else if(launch){try{launch.focus();}catch(e){}}},0);
  }
  launch.addEventListener("click",function(){if(drawer.classList.contains("open")){closeAdvisorAndRestoreFocus();return;}advisorReturnFocus=launch;pnOpen();});
  document.getElementById("pnClose").addEventListener("click",closeAdvisorAndRestoreFocus);backdrop.addEventListener("click",closeAdvisorAndRestoreFocus);
  var resetBackdrop=document.getElementById("resetWorkspaceBackdrop");if(resetBackdrop)resetBackdrop.addEventListener("click",closeWorkspaceReset);
  document.addEventListener("keydown",function(e){
    if(typeof ProjectNavigation!=="undefined"&&ProjectNavigation.isDrawerOpen()&&ProjectNavigation.handleDrawerKeydown(e))return;
    var resetDialog=document.getElementById("resetWorkspaceDialog");
    if(resetDialog&&!resetDialog.hidden){
      if(e.key==="Escape"){closeWorkspaceReset();return;}
      if(e.key==="Tab"){
        var resetFocus=resetDialog.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
        if(!resetFocus.length){e.preventDefault();resetDialog.focus();return;}
        var resetFirst=resetFocus[0],resetLast=resetFocus[resetFocus.length-1];
        if(e.shiftKey&&document.activeElement===resetFirst){e.preventDefault();resetLast.focus();}
        else if(!e.shiftKey&&document.activeElement===resetLast){e.preventDefault();resetFirst.focus();}
      }
      return;
    }
    if((typeof panelPhotoExamplesOpen!=="undefined"&&panelPhotoExamplesOpen)||(typeof aduDocumentExampleOpen!=="undefined"&&aduDocumentExampleOpen)){
      if(e.key==="Escape"){if(aduDocumentExampleOpen)actions["close-document-examples"]();else actions["close-photo-examples"]();return;}
      if(e.key==="Tab"){
        var d=document.getElementById("panelPhotoExamples")||document.getElementById("documentExamplesModal");if(!d)return;
        var a=d.querySelectorAll('button,[href],input,select,textarea,details>summary,[tabindex]:not([tabindex="-1"])');
        if(!a.length){e.preventDefault();d.focus();return;}
        var first=a[0],last=a[a.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
      }
      return;
    }
    if(applicationExportReviewOpen){
      var exportDialog=document.getElementById('applicationExportReview');
      if(e.key==="Escape"){actions["close-export-review"]();return;}
      if(e.key==="Tab"&&exportDialog){
        var exportFocus=exportDialog.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
        if(!exportFocus.length){e.preventDefault();exportDialog.focus();return;}
        var exportFirst=exportFocus[0],exportLast=exportFocus[exportFocus.length-1];
        if(e.shiftKey&&document.activeElement===exportFirst){e.preventDefault();exportLast.focus();}
        else if(!e.shiftKey&&document.activeElement===exportLast){e.preventDefault();exportFirst.focus();}
      }
    }
    if(drawer.classList.contains("open")){
      if(e.key==="Escape"){closeAdvisorAndRestoreFocus();return;}
      if(e.key==="Tab"){
        var advisorFocus=drawer.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
        if(!advisorFocus.length){e.preventDefault();drawer.focus();return;}
        var advisorFirst=advisorFocus[0],advisorLast=advisorFocus[advisorFocus.length-1];
        if(e.shiftKey&&document.activeElement===advisorFirst){e.preventDefault();advisorLast.focus();}
        else if(!e.shiftKey&&document.activeElement===advisorLast){e.preventDefault();advisorFirst.focus();}
      }
    }
  });
  document.addEventListener("input",function(e){if(!e.target||!e.target.getAttribute)return;var decisionId=e.target.getAttribute("data-decision-note"),kind=e.target.getAttribute("data-planning-note"),recordId=e.target.getAttribute("data-record-id");if(decisionId){setPlanningRecord("decision",decisionId,{note:e.target.value});scheduleDraftSave();return;}if(kind&&recordId){setPlanningRecord(kind,recordId,{note:e.target.value});scheduleDraftSave();}});
  if(typeof MutationObserver!=="undefined"){
    var appRoot=document.getElementById("app");if(appRoot){var sectionNavMutationTimer=0;new MutationObserver(function(records){var external=records.some(function(r){return !(r.target.closest&&r.target.closest(".summary-section-nav"));});if(!external)return;clearTimeout(sectionNavMutationTimer);sectionNavMutationTimer=setTimeout(function(){setupProgressiveGuidance();setupResponsiveKnownSummary();pnEnhanceImages();},0);}).observe(appRoot,{childList:true,subtree:true});setTimeout(function(){setupProgressiveGuidance();setupResponsiveKnownSummary();},0);}
  }
  if(pnInput){pnInput.addEventListener("input",function(){pnAutoSizeInput();});}
  pnForm.addEventListener("submit",function(e){e.preventDefault();var q=pnInput.value.trim();if(!q||pnPending)return;pnInput.value="";pnAutoSizeInput();pnSubmit(q);});
  pnLog.addEventListener("click",function(e){var a=e.target.closest?e.target.closest("[data-pn-ask],[data-pn-apply],[data-pn-close]"):null;if(!a)return;
    if(a.hasAttribute("data-pn-close")){closeAdvisorAndRestoreFocus();return;}
    if(a.hasAttribute("data-pn-apply")){var id=a.getAttribute("data-pn-apply");var t=(PROJECT_TYPES.filter(function(p){return p.id===id;})[0]||{});pnAdd("user","Use "+(t.title||id)+" as my starting point");pnClose();applyProjectType(id);return;}
    var q=a.getAttribute("data-pn-ask");if(pnPending)return;pnSubmit(q);});
  var help=document.getElementById("helpBtn");if(help)help.addEventListener("click",function(){pnOpen();});
  var saveBtn=document.getElementById("resumeBtn");if(saveBtn)saveBtn.addEventListener("click",save);
}
var projectNavigatorInitialized=false;
function showInitializationError(error){
  try{
    var app=document.getElementById("app");
    if(app){
      app.innerHTML='<section class="cardbox" role="alert" aria-labelledby="initialization-error-heading">'+
        '<div class="eyebrow">Project Navigator could not start</div>'+
        '<h1 id="initialization-error-heading">Project Navigator did not finish loading</h1>'+
        '<p>Reload the page. If the issue continues, open the browser console and share the first error shown.</p>'+
        '</section>';
    }
  }catch(ignore){}
  if(typeof console!=="undefined"&&console.error)console.error("Project Navigator initialization failed",error);
}
function init(){
  if(projectNavigatorInitialized)return;
  projectNavigatorInitialized=true;
  try{
    if(typeof loadDraft!=="function")throw new Error("loadDraft is unavailable");
    if(typeof initEvents!=="function")throw new Error("initEvents is unavailable");
    if(typeof render!=="function")throw new Error("render is unavailable");
    if(typeof updateSaveStatus!=="function")throw new Error("updateSaveStatus is unavailable");
    loadDraft();
    initEvents();
    render();
    updateSaveStatus();
  }catch(error){
    projectNavigatorInitialized=false;
    showInitializationError(error);
  }
}
if(typeof document!=="undefined"){
  if(document.readyState!=="loading")init();
  else document.addEventListener("DOMContentLoaded",init,{once:true});
}

function stabilizeQuestionWorkspace(){var p=document.querySelector('.question-reading-pane');if(p)p.scrollTop=0;}
