/* ============================ render orchestrator + topic nav ============================ */
function generationScreen(){var understanding=_pnGenerationMode==="understanding",heading=understanding?"Building what we understand so far":"Building your preparation guide",intro=understanding?"We are organizing your answers into a clear review of what is known and what still needs confirmation.":"We are organizing your answers into a practical plan.",items=understanding?["Summarizing what you told us","Separating working interpretations from confirmed information","Preparing questions and items that need confirmation"]:["Separating what you told us from items that need confirmation","Identifying useful documents and questions","Preparing your recommended next action"];return '<section class="report-generation" role="status" aria-live="polite" aria-labelledby="report-generation-heading"><div class="report-generation__spinner" aria-hidden="true"></div><div class="eyebrow">Preparing your guidance</div><h1 id="report-generation-heading">'+heading+'</h1><p>'+intro+'</p><ul>'+items.map(function(item){return '<li>'+item+'</li>';}).join('')+'</ul><p class="report-generation__boundary">Preparation support only. This is not an application, approval, cost quote, schedule commitment, or final determination.</p></section>';}
function startPreparationGuideGeneration(){if(_pnGeneratingGuide)return false;_pnGenerationMode="guide";_pnGeneratingGuide=true;_pnRenderIntent="navigation";_pnNavDir="forward";if(typeof persistDraft==="function")persistDraft(false);render();var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;clearTimeout(_pnGenerationTimer);_pnGenerationTimer=setTimeout(function(){_pnGeneratingGuide=false;S.step=4;if(typeof markReached==="function")markReached(4);if(typeof persistDraft==="function")persistDraft(false);_pnRenderIntent="navigation";_pnNavDir="forward";render();},reduce?120:3000);return false;}
function startUnderstandingGeneration(){if(_pnGeneratingGuide)return false;_pnGenerationMode="understanding";_pnGeneratingGuide=true;_pnRenderIntent="navigation";_pnNavDir="forward";if(typeof persistDraft==="function")persistDraft(false);render();var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;clearTimeout(_pnGenerationTimer);_pnGenerationTimer=setTimeout(function(){_pnGeneratingGuide=false;S.step=2;if(typeof markReached==="function")markReached(2);if(typeof persistDraft==="function")persistDraft(false);_pnRenderIntent="navigation";_pnNavDir="forward";render();},reduce?120:3000);return false;}
function setupMobileRefreshSafety(){if(window.__pnRefreshSafety)return;window.__pnRefreshSafety=true;var flush=function(){if(typeof persistDraft==="function")persistDraft(false);};window.addEventListener("pagehide",flush,{capture:true});document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden")flush();});}
setupMobileRefreshSafety();
function view(){if(_pnGeneratingGuide)return generationScreen();if(typeof arrivalIsActive==="function"&&arrivalIsActive())return arrivalSelectorScreen();if(typeof arrivalWebsitePreviewActive==="function"&&arrivalWebsitePreviewActive())return arrivalWebsitePreviewScreen();if(typeof arrivalEmailPreviewActive==="function"&&arrivalEmailPreviewActive())return arrivalEmailPreviewScreen();if(typeof arrivalAssistantPreviewActive==="function"&&arrivalAssistantPreviewActive())return arrivalAssistantPreviewScreen();if(S.step===0)return step0();if(S.step===1)return step1();if(S.step===2)return step2();if(S.step===3)return step3();return step4();}
var _pnLastKey=null,_pnNavDir="forward",_pnRenderIntent="state",_pnSwapToken=0,_pnGeneratingGuide=false,_pnGenerationMode="guide",_pnGenerationTimer=0;
var CUSTOMER_NAV_LABELS=["Your project","Project details","Review & confirm","Prepare to begin","Your guidance"];
var CUSTOMER_NAV_PURPOSE=["Choose the project that best matches your plans","Add the property, service, panel, and load details that shape the guidance","Review interpretations and anything that remains uncertain","Organize questions and information before contacting the right people","Use your personalized preparation guide and recommended next action"];
/* 2026-10-05: didn't account for _pnGeneratingGuide — startPreparationGuideGeneration()/
   startUnderstandingGeneration() flip that flag and call render() while S.step/S.questionIndex are
   still whatever they were on the last question or the Understanding screen (S.step only actually
   changes once the generation timer fires, later). render()'s isChange check (_pnLastKey!==newKey)
   compares this key before/after, and with a key that ignores _pnGeneratingGuide, the transition
   INTO generationScreen() looked like "no change" — isChange stayed false, which also gates the
   scroll-to-top reset in render()'s own sync branch, and skips pnAnimateSwap() (whose animated swap
   does its own scroll-to-top) entirely in favor of a silent in-place swap. The loading screen
   rendered at whatever scroll position the last question had left the page at — confirmed to
   reproduce as landing on its bottom half after a tall question card — not because the reset logic
   was wrong, but because this key never told it a screen change had actually happened. */
function pnScreenKey(){if(typeof ArrivalScene!=="undefined"&&ArrivalScene.view!=="navigator")return "arrival:"+ArrivalScene.view+":"+(ArrivalScene.channel||"none");if(_pnGeneratingGuide)return "generating:"+_pnGenerationMode;if(typeof _pnFastFactsLoading!=="undefined"&&_pnFastFactsLoading)return "fastfacts-loading";return S.step+(S.step===1?(":"+S.questionIndex+(S.questionIndex===0?":"+S.fastFactsPhase:"")):"");}
function pnUpdateChrome(){var arrivalActive=(typeof ArrivalScene!=="undefined"&&ArrivalScene.view!=="navigator"),topicbar=document.querySelector("nav.topicbar"),advisorLaunch=document.getElementById("pnLaunch");if(topicbar)topicbar.hidden=arrivalActive;if(advisorLaunch)advisorLaunch.hidden=arrivalActive;if(arrivalActive){var at=document.getElementById("topic"),as=document.getElementById("stepper");if(at)at.textContent="Entry preview.";if(as)as.innerHTML="";return;}var labels=CUSTOMER_NAV_LABELS,purposes=CUSTOMER_NAV_PURPOSE,currentLabel=(S.step===1&&S.questionIndex===0?(S.fastFactsPhase==="results"?"Fast facts results":"Fast facts"):labels[S.step]||TOPICS[S.step]),currentPurpose=(S.step===1&&S.questionIndex===0?"One question about the property before project details":purposes[S.step]||TOPIC_PURPOSE[S.step]),topic=document.getElementById("topic");if(topic)topic.textContent="Current planning topic: "+currentLabel+". "+currentPurpose+".";
  /* V45.8.0 (two-level navigation agent block, Iteration 5): the Level 1/2 mega menu now renders
     itself into #stepper via ProjectNavigation.render() (components/project-navigation.js), built
     from core/navigation-model.js's ProjectNavigationModel.view(). */
  if(typeof ProjectNavigation!=="undefined"&&typeof ProjectNavigation.render==="function")ProjectNavigation.render();
  updateAdvisorContext();}
function pnFocusH1(){if(_pnRenderIntent!=="navigation")return;var h=document.querySelector("#app h1");if(h){h.setAttribute("tabindex","-1");try{h.focus({preventScroll:true});}catch(e){}}}
/* 2026-10-03 (P1.3, 10.1.26 feedback): question-to-question transitions (pnAnimateQuestionPane)
   cross-fade the card in place without ever correcting scroll position, so a customer scrolled down
   on question N lands at the same scroll offset on question N+1 — often mid-page or near the bottom.
   The only existing correction was the Scenario Guide's own 720ms-delayed settleFocus() scheduler,
   which fixed it eventually but not "immediately discoverable" as required. Call it immediately here
   instead of relying on that delayed fallback for this transition. */
function pnSettleNavigationViewport(){if(typeof V457NavigationScenarioGuide!=="undefined"&&typeof V457NavigationScenarioGuide.settleFocus==="function"){V457NavigationScenarioGuide.settleFocus();return;}pnFocusH1();}
function pnAfterRender(){if(typeof initializeCurrentScreenEnhancements==="function")requestAnimationFrame(function(){initializeCurrentScreenEnhancements();});if(typeof InsightInstrumentation!=="undefined"&&window.__pnPendingInsightPage){var page=window.__pnPendingInsightPage;window.__pnPendingInsightPage=null;requestAnimationFrame(function(){InsightInstrumentation.observe(page);});}
  /* V45.8.0 (Iteration 5): re-render after #app's new screen HTML is actually in the DOM, so Level 2
     destinations are filtered against the section ids the CURRENT screen really rendered, not the
     previous one. pnUpdateChrome() already called ProjectNavigation.render() once above, synchronously,
     for the common case (same screen, no destinations changed); this corrects it for screen changes. */
  if(typeof ProjectNavigation!=="undefined"&&typeof ProjectNavigation.render==="function")requestAnimationFrame(function(){ProjectNavigation.render();});}
/* 2026-10-05: on mobile, .question-nav sits ABOVE .question-reading-pane as one stacked column
   (desktop keeps them as permanent side-by-side grid columns, nav acting as a persistent sidebar
   that should never itself slide away) — so a mobile "typical swipe" transition needs the nav strip
   and the reading pane to move together as one screen, not the card alone with the nav snapping
   instantly underneath it. Reuses the exact same .question-pane-wipe-host/.question-pane-wipe
   classes and forward/backward keyframes already defined for the card-only desktop case below;
   only what gets wrapped changes. */
function pnAnimateQuestionPane(app,newHTML,dir){
  var token=++_pnSwapToken,temp=document.createElement("div");temp.innerHTML=newHTML;
  var mobile=typeof window!=="undefined"&&window.matchMedia&&window.matchMedia("(max-width:760px)").matches;
  if(mobile){
    var curNav=app.querySelector(".question-nav"),nxtNav=temp.querySelector(".question-nav"),curPane=app.querySelector(".question-reading-pane"),nxtPane=temp.querySelector(".question-reading-pane");
    if(curNav&&nxtNav&&curPane&&nxtPane){
      /* 2026-10-05: both nav copies carry id="questionNavigator" (questionNavigator() in
         screen-shared.js), and core/v45.8.3-question-nav-scroll.js's render() wrapper
         unconditionally queries #questionNavigator on a setTimeout(...,0) after every render to
         scroll the current step's chip into view. With both copies live in the DOM for the full
         560ms transition, that querySelector resolved to whichever copy came first in document
         order — curNav, the OUTGOING one about to be removed — and smooth-scrolled its chip mid
         slide-animation while clipped under this host's overflow:hidden, visibly glitching as a
         blank/white strip ("the white bar returned"). Only the surviving copy may keep the id. */
      curNav.removeAttribute("id");
      var host=curNav.parentElement,wrap=document.createElement("div");wrap.className="question-pane-wipe-host";
      host.insertBefore(wrap,curNav);
      var curGroup=document.createElement("div");curGroup.appendChild(curNav);curGroup.appendChild(curPane);
      var nxtGroup=document.createElement("div");nxtGroup.appendChild(nxtNav);nxtGroup.appendChild(nxtPane);
      wrap.appendChild(curGroup);wrap.appendChild(nxtGroup);
      curGroup.classList.add("question-pane-wipe","question-pane-wipe-out-"+dir);
      nxtGroup.classList.add("question-pane-wipe","question-pane-wipe-in-"+dir);
      wrap.style.height=Math.max(curGroup.offsetHeight,nxtGroup.offsetHeight)+"px";
      pnUpdateChrome();
      setTimeout(function(){
        if(token!==_pnSwapToken)return;
        nxtGroup.classList.remove("question-pane-wipe","question-pane-wipe-in-forward","question-pane-wipe-in-backward");
        host.insertBefore(nxtNav,wrap);host.insertBefore(nxtPane,wrap);wrap.remove();
        pnSettleNavigationViewport();pnAfterRender();
      },560);
      return;
    }
  }
  var currentNav=app.querySelector(".question-nav"),nextNav=temp.querySelector(".question-nav"),currentSummary=app.querySelector(".question-understanding-summary"),nextSummary=temp.querySelector(".question-understanding-summary"),currentSlot=app.querySelector(".question-card-slot"),nextSlot=temp.querySelector(".question-card-slot");
  if(currentNav&&nextNav)currentNav.replaceWith(nextNav);
  if(currentSummary&&nextSummary)currentSummary.innerHTML=nextSummary.innerHTML;
  if(!currentSlot||!nextSlot){app.innerHTML=newHTML;pnUpdateChrome();pnSettleNavigationViewport();pnAfterRender();return;}
  var slotHost=currentSlot.parentElement,slotWrap=document.createElement("div");slotWrap.className="question-pane-wipe-host";
  slotHost.insertBefore(slotWrap,currentSlot);
  slotWrap.appendChild(currentSlot);slotWrap.appendChild(nextSlot);
  currentSlot.classList.add("question-pane-wipe","question-pane-wipe-out-"+dir);
  nextSlot.classList.add("question-pane-wipe","question-pane-wipe-in-"+dir);
  slotWrap.style.height=Math.max(currentSlot.offsetHeight,nextSlot.offsetHeight)+"px";
  pnUpdateChrome();
  setTimeout(function(){
    if(token!==_pnSwapToken)return;
    nextSlot.classList.remove("question-pane-wipe","question-pane-wipe-in-forward","question-pane-wipe-in-backward");
    slotHost.insertBefore(nextSlot,slotWrap);slotWrap.remove();
    pnSettleNavigationViewport();pnAfterRender();
  },560);
}
function pnAnimateSwap(app,newHTML,dir){var token=++_pnSwapToken;try{window.scrollTo(0,0);}catch(e){}var out=document.createElement("div");out.className="intake-step-panel";out.innerHTML=app.innerHTML;var inn=document.createElement("div");inn.className="intake-step-panel";inn.innerHTML=newHTML;app.style.position="relative";app.style.overflow="hidden";app.innerHTML="";app.appendChild(out);app.appendChild(inn);var outH=out.offsetHeight,inH=inn.offsetHeight;app.style.height=outH+"px";out.className+=(dir==="back"?" animate-backward-exit":" animate-forward-exit");inn.className+=(dir==="back"?" animate-backward-enter":" animate-forward-enter");pnUpdateChrome();requestAnimationFrame(function(){app.style.transition="height 680ms cubic-bezier(.45,0,.55,1)";app.style.height=inH+"px";});setTimeout(function(){if(token!==_pnSwapToken)return;app.style.transition="";app.style.height="";app.style.overflow="";app.style.position="";app.innerHTML=newHTML;pnFocusH1();pnAfterRender();},560);}
/* 2026-10-06: in-place DOM update for answer selections (stableRender sets _pnMorph). Replacing #app's
   innerHTML rebuilt the tapped option and everything above it, which on phones let the browser shift or
   clamp the scroll position as the page grew. Morphing mutates only what changed, so untouched nodes
   (the choices, the heading, the focused input) are never recreated and the scroll position can't move. */
var _pnMorph=false;
function pnMorphSyncAttrs(a,b){var i,n;for(i=a.attributes.length-1;i>=0;i--){n=a.attributes[i].name;if(!b.hasAttribute(n))a.removeAttribute(n);}for(i=0;i<b.attributes.length;i++){n=b.attributes[i].name;if(a.getAttribute(n)!==b.attributes[i].value)a.setAttribute(n,b.attributes[i].value);}
  var t=a.tagName;if(t==="INPUT"){if(a.checked!==b.checked)a.checked=b.checked;if(a.type!=="file"&&a.value!==b.value&&a.type!=="radio"&&a.type!=="checkbox")a.value=b.value;}else if(t==="TEXTAREA"){if(a.value!==b.value)a.value=b.value;}else if(t==="DETAILS"){if(a.open!==b.hasAttribute("open"))a.open=b.hasAttribute("open");}}
function pnMorphKey(n){return n.nodeType!==1?"#"+n.nodeType:n.tagName+"|"+(n.id||"")+"|"+(n.name||"")+"|"+(n.tagName==="INPUT"?(n.getAttribute("value")||""):"")+"|"+(n.getAttribute("data-inline-response-key")||"")+(n.hasAttribute("data-question-card")?"|qc":"");}
/* Children are matched by tag + identity (id/name/value/key), consumed in order, so an element inserted or
   removed between siblings (a notice, a preview, a response accordion) doesn't make every later sibling
   look different and get recreated. */
function pnMorphChildren(a,b){var old={},k,list,i,o,n,ref,bc=Array.prototype.slice.call(b.childNodes);
  Array.prototype.forEach.call(a.childNodes,function(c){k=pnMorphKey(c);(old[k]||(old[k]=[])).push(c);});
  for(i=0;i<bc.length;i++){n=bc[i];list=old[pnMorphKey(n)];o=list&&list.length?list.shift():null;ref=a.childNodes[i]||null;
    if(!o){a.insertBefore(n.cloneNode(true),ref);continue;}
    if(o!==ref)a.insertBefore(o,ref);
    if(o.nodeType===3||o.nodeType===8){if(o.nodeValue!==n.nodeValue)o.nodeValue=n.nodeValue;continue;}
    if(o.nodeType===1){pnMorphSyncAttrs(o,n);if(/^(script|style|svg)$/i.test(o.tagName)){if(o.innerHTML!==n.innerHTML)o.innerHTML=n.innerHTML;}else pnMorphChildren(o,n);}}
  for(k in old)old[k].forEach(function(x){if(x.parentNode===a)a.removeChild(x);});}
function pnMorphApp(app,html){var t=document.createElement("div");t.innerHTML=html;pnMorphChildren(app,t);}
function render(){if(typeof arrivalApplyQueryParams==="function")arrivalApplyQueryParams();var app=document.getElementById("app"),newKey=pnScreenKey(),newHTML=view();if(typeof arrivalDebugPanel==="function"&&typeof ArrivalScene!=="undefined"&&ArrivalScene.view!=="navigator")newHTML+=arrivalDebugPanel();var reduce=(typeof window!=="undefined"&&window.matchMedia)?window.matchMedia("(prefers-reduced-motion: reduce)").matches:false,isChange=(_pnLastKey!==null&&_pnLastKey!==newKey),isQuestion=(_pnLastKey!==null&&/^1:/.test(_pnLastKey)&&/^1:/.test(newKey)),animate=_pnRenderIntent==="navigation"&&isChange&&!reduce&&app&&typeof requestAnimationFrame==="function"&&typeof app.offsetHeight==="number";if(isQuestion){var oldQuestion=parseInt(_pnLastKey.split(":")[1],10),newQuestion=parseInt(newKey.split(":")[1],10);_pnNavDir=newQuestion<oldQuestion||newQuestion===oldQuestion&&_pnLastKey.endsWith(":results")?"backward":"forward";}if(animate&&isQuestion)pnAnimateQuestionPane(app,newHTML,_pnNavDir);else if(animate)pnAnimateSwap(app,newHTML,_pnNavDir);else{_pnSwapToken++;if(_pnMorph&&!isChange&&app.firstChild)pnMorphApp(app,newHTML);else app.innerHTML=newHTML;pnUpdateChrome();pnFocusH1();pnAfterRender();if(isChange&&_pnRenderIntent==="navigation"){try{window.scrollTo(0,0);}catch(e){}}}_pnLastKey=newKey;_pnNavDir="forward";_pnRenderIntent="state";}

;
