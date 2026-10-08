/* V45.8.7: collapse screens/screen-summary.js's "Your Project Summary" page (step 4) into a stack
   of single-line, collapsed-by-default accordions below the persistent Recommended Next Action
   card (and its own header — the "Your project preparation guide" masthead stays untouched, as does
   the recommendation card itself; everything else becomes an accordion). Grouped exactly the way
   core/navigation-model.js's "guidance" topic already groups these same sections for the mega-menu
   drawer (the one authoritative list — read here by id, not duplicated as a second hand-maintained
   copy), so the page's structure matches what the drawer already promises instead of inventing a
   second grouping that could drift from it. The dynamic insight cards (components/explainable-
   insight-card.js, data/progressive-insights.js — a variable count/content depending on project
   type and answers, not a fixed list) are discovered the same way core/navigation-model.js's
   discoverFastFactsDestinations() already discovers the Fast Facts step's sections, and that same
   file's discoverGuidanceInsightDestinations() reads these same live elements, so the mega-menu
   destination list always matches what this transform actually built.

   Every remaining accordion/group then moves into one shared container (.summary-accordion-stack)
   so the whole report reads as one connected block instead of a run of separately-bordered cards,
   and footnote-style disclaimers (the two "boundary" notes, the "nothing has been submitted"
   closing line) relocate to a single .summary-footnotes block at the very end of that container,
   instead of being scattered inline between unrelated sections.

   This transforms the already-rendered DOM rather than rewriting step4()'s own HTML generation —
   every existing test pinned to that function's output string (including the one asserting every
   id in this list is literally present in screens/screen-summary.js's source) stays exactly as
   valid as before, and every section heading's own id moves onto its new <details> element rather
   than being discarded, so a mega-menu drawer destination still scrolls to the right place.

   Only one accordion is ever open at once — opening one closes whichever was open, both animated —
   which is why exclusivity is managed here in JS instead of via native <details name="…">
   grouping: a browser's native grouping snaps every other member shut instantly with no
   transition, which would look inconsistent next to the one accordion actually animating open. */
(function(root){'use strict';
  var SECTIONS=[
    {id:'s-project-h',group:'project-and-answers'},
    {id:'s-known-h',group:'project-and-answers'},
    {id:'s-interp-h',group:'project-and-answers'},
    {id:'s-confirm-h'},
    {id:'s-may-h'},
    {id:'s-utility-h'},
    {id:'s-whatnext-h'},
    {id:'cost-timeline-answer-h',group:'cost-and-timeline'},
    {id:'cost-uncertainty-h',group:'cost-and-timeline'},
    {id:'cost-tier1-h',group:'cost-and-timeline'},
    {id:'timing-owner-heading'},
    {id:'living-guide-heading'},
    {id:'decision-impact-h'},
    {id:'where-fits-h'},
    {id:'s-beforeyouapply-h'},
    {id:'preparation-end-h'}
  ];
  var GROUP_LABELS={
    'project-and-answers':'Your project and answers',
    'cost-and-timeline':'Cost and timeline'
  };
  var CHEVRON_SVG='<svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
  function reduced(){return !!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches);}
  /* Section headers come in three shapes: an icon + <h2> wrapped together in
     .guidance-card__state-header (screens/screen-shared.js's guidanceStateHeader()); a bare
     .eyebrow label followed somewhere later by the heading (costTimelineAnswerHtml() separates
     them with a <details> in between); or .insight-region__heading (components/explainable-
     insight-card.js's dynamic cards). Whichever it is, the heading's own text becomes the
     accordion's title, so the icon/eyebrow/wrapper and the heading itself are all removed from the
     body — keeping them would just repeat the title a second time, right below itself. */
  function stripHeader(section,heading){
    var wrap=heading.closest('.guidance-card__state-header, .insight-region__heading');
    if(wrap&&wrap.parentElement===section){wrap.remove();return;}
    var eyebrow=section.querySelector(':scope > .eyebrow');
    if(eyebrow)eyebrow.remove();
    heading.remove();
  }
  function buildAccordion(section,heading){
    var title=heading.textContent.trim();
    var headingId=heading.id;
    stripHeader(section,heading);
    var details=document.createElement('details');
    details.className='summary-accordion';
    if(headingId)details.id=headingId;
    var summary=document.createElement('summary');
    summary.className='summary-accordion__header';
    var titleSpan=document.createElement('span');
    titleSpan.className='summary-accordion__title';
    titleSpan.textContent=title;
    var chevron=document.createElement('span');
    chevron.className='summary-accordion__chevron';
    chevron.setAttribute('aria-hidden','true');
    chevron.innerHTML=CHEVRON_SVG;
    summary.appendChild(titleSpan);
    summary.appendChild(chevron);
    var panel=document.createElement('div');
    panel.className='summary-accordion__panel';
    var inner=document.createElement('div');
    inner.className='summary-accordion__panel-inner';
    while(section.firstChild)inner.appendChild(section.firstChild);
    panel.appendChild(inner);
    details.appendChild(summary);
    details.appendChild(panel);
    section.replaceWith(details);
    return details;
  }
  function makeController(details){
    var summary=details.querySelector(':scope > summary'),panel=details.querySelector(':scope > .summary-accordion__panel');
    var animation=null,fallbackTimer=null;
    function clearFallback(){if(fallbackTimer){clearTimeout(fallbackTimer);fallbackTimer=null;}}
    /* 2026-10-05 (follow-up): confirmed live the fallback timer alone isn't enough — when it fires
       because onfinish never dispatched, the WAAPI Animation object is often still playState
       "running" (just stuck/barely-progressed, the same rAF starvation that broke onfinish also
       stalls the animation's own effective playback), and a still-running animation's current
       interpolated value keeps winning the cascade (the "animations" origin outranks inline/author
       styles) regardless of clearing panel.style.height here. Without cancelling it first, settle()
       clears the inline style but the panel stays visibly pinned near its start-of-animation height.
       animation.cancel() removes the animation's effect entirely, letting the (now-cleared) inline
       style's auto/content-based height actually take over. */
    function settle(openState){clearFallback();if(animation){animation.cancel();}details.open=openState;panel.style.height='';panel.style.overflow='';animation=null;}
    var ctrl={};
    /* 2026-10-05: settle() — the only code path that ever clears the inline height:0px/overflow:
       hidden left on the panel mid-animation — used to run ONLY from animation.onfinish. If that
       event never dispatches (confirmed live: a backgrounded tab can starve requestAnimationFrame
       entirely, and WAAPI's finish event is tied to the same rendering pipeline, so the animation
       reaches playState "finished" on the clock but the callback never fires), the panel stays
       permanently clipped at 0 height — exactly "cut off at the bottom when expanded", including any
       nested disclosure a user opens inside it afterward. A fallback timer slightly longer than the
       animation's own duration guarantees settle() always runs even if the browser never dispatches
       onfinish; clearFallback() on every new open/close/settle prevents a stale timer from an
       interrupted animation firing after a newer one has already taken over. */
    ctrl.open=function(){
      if(animation)animation.cancel();
      clearFallback();
      if(reduced()){details.open=true;settle(true);return;}
      details.open=true;
      var endHeight=panel.scrollHeight;
      panel.style.overflow='hidden';
      panel.style.height='0px';
      panel.getBoundingClientRect();
      animation=panel.animate([{height:'0px'},{height:endHeight+'px'}],{duration:260,easing:'cubic-bezier(.3,0,.2,1)',fill:'forwards'});
      animation.onfinish=function(){settle(true);};
      fallbackTimer=setTimeout(function(){settle(true);},400);
    };
    ctrl.close=function(){
      if(!details.open)return;
      if(animation)animation.cancel();
      clearFallback();
      if(reduced()){settle(false);return;}
      var startHeight=panel.getBoundingClientRect().height||panel.scrollHeight;
      panel.style.overflow='hidden';
      animation=panel.animate([{height:startHeight+'px'},{height:'0px'}],{duration:220,easing:'cubic-bezier(.3,0,.2,1)',fill:'forwards'});
      animation.onfinish=function(){settle(false);};
      fallbackTimer=setTimeout(function(){settle(false);},360);
    };
    summary.addEventListener('click',function(e){
      e.preventDefault();
      if(details.open)ctrl.onCloseRequest();else ctrl.onOpenRequest();
    });
    return ctrl;
  }
  function bindExclusive(container){
    var items=Array.prototype.slice.call(container.querySelectorAll('.summary-accordion'));
    var controllers=items.map(makeController);
    /* An item already marked open when binding starts (screens/screen-understanding.js's transform
       opens "Needs confirmation" by default, unlike the summary page's all-closed start) is adopted
       as the exclusive group's initial `current` rather than animated open a second time — it only
       needs to be tracked so opening a DIFFERENT row still closes it correctly. */
    var current=null;
    controllers.forEach(function(ctrl,i){if(items[i].open)current=ctrl;});
    controllers.forEach(function(ctrl){
      ctrl.onOpenRequest=function(){if(current&&current!==ctrl)current.close();current=ctrl;ctrl.open();};
      ctrl.onCloseRequest=function(){if(current===ctrl)current=null;ctrl.close();};
    });
  }
  function ensureGroups(built){
    var seen={};
    built.forEach(function(b){
      if(!b.group||seen[b.group])return;
      seen[b.group]=true;
      var members=built.filter(function(x){return x.group===b.group;});
      var wrap=document.createElement('div');
      wrap.className='summary-accordion-group';
      var label=document.createElement('div');
      label.className='summary-accordion-group__label';
      label.textContent=GROUP_LABELS[b.group]||b.group;
      wrap.appendChild(label);
      members[0].details.insertAdjacentElement('beforebegin',wrap);
      members.forEach(function(m){wrap.appendChild(m.details);});
    });
  }
  /* The dynamic insight cards (region ids vary by project type/answers) aren't in the fixed
     SECTIONS list above for the same reason discoverFastFactsDestinations() reads live DOM instead
     of a hand-maintained copy — they can't be enumerated in advance. */
  function discoverDynamicSections(app){
    var out=[];
    /* 2026-10-05: components/explainable-insight-card.js's region() never puts an id on the
       .insight-region <section> itself — only on the nested <h2> it points at via aria-labelledby.
       Requiring [id] on the outer element here meant this querySelectorAll always matched zero
       elements, so none of these regions ("What your answers may mean", "Needs confirmation", "How
       to prepare" — whichever ones a given project type/answer set actually populate) ever became an
       accordion or a nav destination, even though the comment above describes exactly that intent. */
    Array.prototype.forEach.call(app.querySelectorAll('.insight-region'),function(region){
      var heading=region.querySelector(':scope > .insight-region__heading > h2[id]');
      if(heading)out.push({heading:heading,section:region});
    });
    var illustrations=document.getElementById('s-illustrations-h');
    if(illustrations){
      var section=illustrations.closest('section, article');
      if(section)out.push({heading:illustrations,section:section});
    }
    return out;
  }
  /* Moves the recommendation's own siblings (everything the fixed+dynamic passes just turned into
     accordions/groups, both the ones inside .preparation-guide__story and the ones that were
     separate top-level cards after .preparation-guide) into one shared container placed right after
     the recommendation card, so the whole report reads as one connected block rather than a run of
     separately-bordered cards. Stops at the first .summary-document-footer (the Back button /
     exploration-footer utility controls stay outside and keep their own existing position). */
  function unifyIntoStack(app,guide){
    var story=guide.querySelector(':scope > .preparation-guide__story');
    var recommendation=story&&story.querySelector(':scope > .pinned-recommendation');
    if(!story||!recommendation)return null;
    var stack=document.createElement('div');
    stack.className='summary-accordion-stack';
    /* Capture the first node to move BEFORE inserting stack — inserting it first would make stack
       itself recommendation's new nextElementSibling, so the loop below would see node===stack on
       its very first check and silently move nothing. */
    var node=recommendation.nextElementSibling;
    recommendation.insertAdjacentElement('afterend',stack);
    while(node){
      var next=node.nextElementSibling;
      stack.appendChild(node);
      node=next;
    }
    var sibling=guide.nextElementSibling;
    while(sibling&&!sibling.classList.contains('summary-document-footer')){
      var nextSibling=sibling.nextElementSibling;
      stack.appendChild(sibling);
      sibling=nextSibling;
    }
    return stack;
  }
  /* Footnote-style disclaimers — the two boundary notes and the Finish accordion's closing
     "nothing has been submitted" line — move into one labeled block at the very end of the shared
     stack, instead of being scattered inline between unrelated sections. */
  function relocateFootnotes(app,guide,stack){
    if(!stack)return;
    var boundaryNotes=app.querySelectorAll('.summary-boundary-note');
    var finishDetails=document.getElementById('preparation-end-h');
    var closingNote=finishDetails?finishDetails.querySelector('.summary-accordion__panel-inner > p.muted.small'):null;
    if(!boundaryNotes.length&&!closingNote)return;
    var footnotes=document.createElement('div');
    footnotes.className='summary-footnotes';
    var label=document.createElement('div');
    label.className='summary-footnotes__label';
    label.textContent='Footnotes';
    footnotes.appendChild(label);
    Array.prototype.forEach.call(boundaryNotes,function(n){footnotes.appendChild(n);});
    if(closingNote)footnotes.appendChild(closingNote);
    stack.appendChild(footnotes);
  }
  function transform(){
    var app=document.getElementById('app');
    if(!app)return;
    var guide=app.querySelector('.preparation-guide');
    if(!guide||app.querySelector('.summary-accordion'))return;
    var built=[];
    SECTIONS.forEach(function(spec){
      var heading=document.getElementById(spec.id);
      if(!heading)return;
      var section=heading.closest('section, article');
      if(!section)return;
      built.push({details:buildAccordion(section,heading),group:spec.group});
    });
    discoverDynamicSections(app).forEach(function(d){
      built.push({details:buildAccordion(d.section,d.heading)});
    });
    if(!built.length)return;
    ensureGroups(built);
    var stack=unifyIntoStack(app,guide);
    relocateFootnotes(app,guide,stack);
    bindExclusive(app);
  }
  /* 2026-10-05: screens/screen-understanding.js's step2() ("What we understand so far") has the same
     shape below its own pinned card (the Recommended Next Action section) that screen-summary.js had
     before this file existed — a run of separately-bordered sections under one "For your reference"
     label, some already wrapped in their own ad hoc <details> (the always-open "You told us" row,
     and the "May be needed"/"Could affect timing"/"Questions to ask" progressive-guidance disclosures
     with their own preview-text summary style), the rest plain, unconditionally-expanded sections.
     Per the request this was built for ("do not invent new ways, use existing animation elements to
     keep the look and feel consistent with the rest of the app"), this reuses buildAccordion()/
     bindExclusive() exactly as-is rather than giving the Understanding screen a second accordion
     implementation — every section here already matches one of stripHeader()'s two recognized shapes
     (screens/screen-shared.js's guidanceCard()/guidanceStateHeader() for every prepCard() section,
     the bare-eyebrow shape for the ADU-only meter/service explainer), so no new header-handling logic
     was needed either. The two pre-existing ad hoc <details> wrappers are unwrapped first so their
     inner section becomes a normal buildAccordion() candidate like every other one, instead of having
     their own bespoke collapse behavior living alongside the new shared one. */
  function unwrapAdHocDetails(node,detailsClass,contentClass){
    if(node.tagName!=='DETAILS'||!node.classList.contains(detailsClass))return node;
    var content=node.querySelector(':scope > .'+contentClass);
    var inner=content&&content.querySelector(':scope > section, :scope > article');
    if(!inner)return node;
    node.replaceWith(inner);
    return inner;
  }
  function transformUnderstanding(){
    var app=document.getElementById('app');
    if(!app)return;
    var rstack=app.querySelector('.secondary-guidance .rstack');
    if(!rstack||rstack.querySelector(':scope > .summary-accordion'))return;
    var kids=Array.prototype.slice.call(rstack.children);
    var built=[];
    kids.forEach(function(node){
      var section=unwrapAdHocDetails(node,'responsive-known','responsive-known__content');
      section=unwrapAdHocDetails(section,'progressive-guidance','progressive-guidance__content');
      if(section.tagName!=='SECTION'&&section.tagName!=='ARTICLE')return;
      var heading=section.querySelector(':scope > .guidance-card__state-header > h2[id], :scope > h2[id]');
      if(!heading)return;
      built.push({details:buildAccordion(section,heading),id:heading.id});
    });
    if(!built.length)return;
    /* "The most attention is needed for the 'Needs confirmation' items" — it starts open (every
       other section starts closed, same as the summary page) so it reads as the one thing actually
       highlighted in an otherwise quiet, lowlit checklist, instead of competing equally with six
       other equally-expanded sections. */
    var confirmEntry=built.filter(function(b){return b.id==='u-confirm-h';})[0];
    if(confirmEntry)confirmEntry.details.open=true;
    bindExclusive(rstack);
  }
  /* 2026-10-05: hooks core/render.js's pnAfterRender() rather than wrapping render() itself.
     render() delegates a "navigation" intent transition to pnAnimateSwap()/pnAnimateQuestionPane(),
     which don't write the real final HTML into #app until their own ~560ms setTimeout fires — so a
     setTimeout(transform,0) scheduled right after render() returns always ran too early (while #app
     still held the animation's temporary out/in wrapper panels), found no .preparation-guide, and
     silently did nothing; nothing ever retried it once the real content landed. pnAfterRender() is
     the one function all three render paths (the synchronous branch, pnAnimateSwap's callback, and
     pnAnimateQuestionPane's callback) already call exactly once the real final content is in place,
     so hooking it instead of render() fires transform() at the right time regardless of which path
     a given navigation took. */
  function install(){
    var base=root.pnAfterRender;
    if(typeof base==='function'&&!base.__v4587){
      var wrapped=function(){var result=base.apply(this,arguments);transform();transformUnderstanding();return result;};
      wrapped.__v4587=true;
      root.pnAfterRender=wrapped;
    }
  }
  if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();}
})(typeof window!=='undefined'?window:this);
