/* V45.6.9.8 Fast Facts reference workspace.
   Presentation layer only. Renders a normalized Fast Facts model into:
     - a full-width page header (hero)
     - a two-column workspace: persistent section navigation + reading pane
     - a narrow-viewport "On this page" control built from the SAME nav markup
   Section labels, anchors, and order come only from FastFactsSections.
   Navigation state (current section, open/closed "On this page") is transient
   module state. It is never written to S, drafts, answers, or analytics.

   Model contract (produced by FastInsights):
     {
       projectType: string,                       // informational only; never used for branching
       hero: '<header …>',                        // required, pre-escaped HTML
       recommended: '<…>' | '',                   // Recommended Next Action body, pre-escaped HTML
       blocks: [{slot, html, scenario?}]          // content blocks; slot must match a configured section
     }
   Blocks whose slot is not configured are ignored (fail closed, no broken layout).
   When blocks in one section carry more than one distinct `scenario` label,
   they are grouped and labeled so customers can tell what applies to what. */
var FastFactsWorkspace=(function(root){
  'use strict';
  function safe(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function config(){return (root.FastFactsSections&&root.FastFactsSections.list)?root.FastFactsSections.list():[];}

  /* V45.6.11: pure extraction of a section's own sub-sections for L2 "on this page" child
     navigation. Content blocks already wrap each distinct topic in `<section class="insight-section"
     id="…">…<h3 class="insight-section__title" …>Label</h3>…</section>` (see
     components/fast-insights.js's `section()` helper and the document gallery). No new markup
     contract is introduced here; this only reads the one that already exists. String-based (not
     DOM-based) so this stays usable in the same VM-only test context as the rest of this file's
     pure functions. */
  function childSectionsFor(html){
    var out=[],re=/<section\s+class="insight-section[^"]*"\s+id="([^"]+)"[^>]*>[\s\S]*?<h3 class="insight-section__title"[^>]*>([^<]*)<\/h3>/g,m;
    while((m=re.exec(html)))out.push({id:m[1],label:m[2]});
    return out;
  }
  /* Pure: which sections are available for this model, in configured order. */
  function sectionsFor(model){
    var blocks=(model&&model.blocks)||[];
    return config().map(function(s){
      var own=blocks.filter(function(b){return b&&b.slot===s.slot&&String(b.html||'').trim();});
      var empty=!own.length,body=empty?'':groupBody(own);
      return {config:s,blocks:own,empty:empty,body:body,childSections:empty?[]:childSectionsFor(body)};
    }).filter(function(x){return !x.empty||!!x.config.emptyState;});
  }
  function groupBody(blocks){
    var labels=[];blocks.forEach(function(b){var l=b.scenario||'';if(labels.indexOf(l)<0)labels.push(l);});
    if(labels.length<2)return blocks.map(function(b){return b.html;}).join('');
    return labels.map(function(l){
      var own=blocks.filter(function(b){return (b.scenario||'')===l;});
      return '<div class="ff-scenario-group" data-ff-scenario="'+safe(l||'general')+'"><p class="ff-scenario-group__label"><span>Applies to:</span> '+safe(l||'Your project in general')+'</p>'+own.map(function(b){return b.html;}).join('')+'</div>';
    }).join('');
  }
  function sectionHtml(x){
    var s=x.config,h=s.anchorId+'-h';
    return '<section class="ff-section" id="'+safe(s.anchorId)+'" data-hierarchy="supporting" data-ff-slot="'+safe(s.slot)+'" aria-labelledby="'+safe(h)+'">'
      +'<header class="ff-section__head"><h2 class="ff-section__title" id="'+safe(h)+'" tabindex="-1">'+safe(s.title)+'</h2>'+(s.intro?'<p class="ff-section__intro">'+safe(s.intro)+'</p>':'')+'</header>'
      +'<div class="ff-section__body">'+(x.empty?'<p class="ff-section__empty">'+safe(s.emptyState)+'</p>':x.body)+'</div></section>';
  }
  /* V45.6.11: a rail destination whose own content contains more than one of its own sub-sections
     (e.g. Prepare: "Worth having handy" / "Photos that may help" / "Documents you may encounter" /
     document examples) gets a collapsed L2 child list naming each one, exactly mirroring the
     Guidance workspace rail (components/guidance-workspace.js). A destination with 0 or 1
     sub-sections is unchanged: a single link, no expand control, no empty disclosure arrow. The
     `<a class="ff-nav__link" …>` markup itself is untouched so the existing nav-link contract
     (and its regex-based tests) keep matching exactly as before. Desktop-rail only in this
     release; the mobile "On this page" tray does not show children, matching the Guidance L2
     scope decision. */
  function navItemHtml(x,i){
    var s=x.config,link='<a class="ff-nav__link" href="#'+safe(s.anchorId)+'" data-ff-target="'+safe(s.anchorId)+'">'+safe(s.navLabel)+'</a>';
    var kids=x.childSections||[];
    if(kids.length<2)return '<li>'+link+'</li>';
    var listId='ff-nav-children-'+i;
    var expand='<button type="button" class="ff-nav__expand" data-ff-expand="'+i+'" aria-expanded="false" aria-controls="'+listId+'" aria-label="Show sections within '+safe(s.navLabel)+'"><span class="ff-nav__expand-icon" aria-hidden="true"></span></button>';
    /* k.label is extracted verbatim from already-escaped rendered HTML (the h3 text each content
       block already produced via esc()); re-escaping it here would double-encode entities like
       "PG&amp;E" into "PG&amp;amp;E", so it is used as-is. k.id is a plain DOM id (no HTML-sensitive
       characters by construction) and safe() on it is a harmless no-op kept for defense in depth. */
    var children='<ul class="ff-nav__children" id="'+listId+'" hidden>'+kids.map(function(k){return '<li><button type="button" class="ff-nav__child-link" data-ff-child="'+safe(s.anchorId)+':'+safe(k.id)+'">'+k.label+'</button></li>';}).join('')+'</ul>';
    return '<li class="ff-nav__item"><div class="ff-nav__row">'+link+expand+'</div>'+children+'</li>';
  }
  /* One nav renderer serves desktop rail and narrow "On this page". */
  function navHtml(sections){
    if(!sections.length)return '';
    return '<nav class="ff-nav" aria-labelledby="ff-nav-heading" data-ff-nav>'
      +'<h2 class="ff-nav__heading" id="ff-nav-heading">On this page</h2>'
      +'<button type="button" class="ff-nav__toggle" aria-expanded="false" aria-controls="ff-nav-list" data-ff-nav-toggle><span>On this page</span><span class="ff-nav__toggle-hint">Jump to a section</span></button>'
      +'<ul class="ff-nav__list" id="ff-nav-list">'+sections.map(navItemHtml).join('')+'</ul>'
      +'</nav>';
  }
  function render(model){
    if(!model||!model.hero)return '';
    var sections=sectionsFor(model);
    var recommended=model.recommended?'<section class="ff-recommended insight-section" id="insight-next" data-priority="primary" aria-labelledby="ff-recommended-heading">'+model.recommended+'</section>':'';
    return '<section class="fast-facts fast-facts--results fast-facts--workspace" aria-labelledby="fast-facts-results-heading" data-fast-facts-results="true" data-ff-project="'+safe(model.projectType||'')+'">'
      +model.hero
      +'<div class="ff-workspace'+(sections.length?'':' ff-workspace--single')+'" data-ff-workspace>'
      +navHtml(sections)
      +'<div class="ff-reading-pane">'+recommended+sections.map(sectionHtml).join('')+'</div>'
      +'</div></section>';
  }

  /* ---------- transient controller (browser only) ---------- */
  var st={el:null,nav:null,current:null,currentChild:null,lockUntil:0,observer:null,mq:null,onMq:null,onClick:null,onKey:null,onUser:null};
  function now(){return (root.performance&&root.performance.now)?root.performance.now():Date.now();}
  function reduced(){return !!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches);}
  function narrow(){return !!(root.matchMedia&&root.matchMedia('(max-width: 900px)').matches);}
  function setCurrent(id,childId){st.current=id;st.currentChild=childId||null;if(!st.nav)return;Array.prototype.forEach.call(st.nav.querySelectorAll('[aria-current]'),function(a){a.removeAttribute('aria-current');});Array.prototype.forEach.call(st.nav.querySelectorAll('[data-ff-target]'),function(a){a.classList.toggle('is-current',a.getAttribute('data-ff-target')===id);});Array.prototype.forEach.call(st.nav.querySelectorAll('[data-ff-child]'),function(a){var k=parseChildAttr(a.getAttribute('data-ff-child')),on=!!(k&&k.sectionId===id&&k.childId===childId);a.classList.toggle('is-current',on);if(on)a.setAttribute('aria-current','location');});var parent=st.nav.querySelector('[data-ff-target="'+id+'"]');if(parent&&!childId)parent.setAttribute('aria-current','location');}
  function setOpen(open){
    if(!st.nav)return;var t=st.nav.querySelector('[data-ff-nav-toggle]');
    st.nav.classList.toggle('is-open',!!open);
    if(t)t.setAttribute('aria-expanded',open?'true':'false');
  }
  function syncLayout(){if(!st.nav)return;var n=narrow();st.nav.classList.toggle('is-collapsible',n);if(!n)setOpen(false);}
  function headerOffset(){
    var h=document.querySelector('header.app'),r=h?h.getBoundingClientRect():null;
    return (r&&r.bottom>0?r.bottom:0)+16;
  }
  /* Lazy images above the target can load mid-scroll and push it down; re-align a few times. */
  var settleTimer=0;
  function settle(target,n){
    clearTimeout(settleTimer);if(n>6)return;
    settleTimer=setTimeout(function(){
      if(!st.el||!document.body.contains(target))return;
      var off=target.getBoundingClientRect().top-headerOffset();
      if(Math.abs(off)>6){st.lockUntil=now()+400;root.scrollTo(0,Math.max(0,(root.pageYOffset||0)+off));}
      settle(target,n+1);
    },n===0?(reduced()?60:520):260);
  }
  /* V45.6.11: `focusTarget` lets a child-nav click scroll/focus one specific sub-section's own
     heading while `id`'s enclosing .ff-section still drives the "current" rail state — so jumping
     to "Documents you may encounter" inside Prepare still shows Prepare as the active destination.
     Existing top-level calls (go(id)) are unchanged: focusTarget defaults to the section itself. */
  function go(id,focusTarget){
    var target=document.getElementById(id);if(!target)return;
    if(st.nav&&st.nav.classList.contains('is-collapsible'))setOpen(false); /* collapse first so layout is final before measuring */
    var scrollTo=focusTarget||target;
    var heading=scrollTo.querySelector('h2,h3')||scrollTo;
    var top=Math.max(0,scrollTo.getBoundingClientRect().top+(root.pageYOffset||0)-headerOffset());
    st.lockUntil=now()+(reduced()?150:900);
    setCurrent(target.classList.contains('ff-section')?id:null);
    try{root.scrollTo({top:top,behavior:reduced()?'auto':'smooth'});}catch(e){root.scrollTo(0,top);}
    settle(scrollTo,0);
    if(!heading.hasAttribute('tabindex'))heading.setAttribute('tabindex','-1');
    try{heading.focus({preventScroll:true});}catch(e){try{heading.focus();}catch(err){}}
  }
  /* V45.6.11: navigate to one L2 child. Falls back to the plain section jump if the child id is
     missing or malformed, so a stray/legacy attribute value can never throw or silently no-op. */
  function goChild(sectionId,childId){var child=childId?document.getElementById(childId):null;if(!child){go(sectionId);return;}setCurrent(sectionId,childId);go(sectionId,child);var item=st.nav&&st.nav.querySelector('[data-ff-child="'+sectionId+':'+childId+'"]'),list=item&&item.closest('.ff-nav__children');if(list&&st.nav.classList.contains('is-collapsible')){list.hidden=true;var b=st.nav.querySelector('[aria-controls="'+list.id+'"]');if(b)b.setAttribute('aria-expanded','false');}}
  function parseChildAttr(v){
    var i=String(v||'').indexOf(':');
    if(i<0)return null;
    var sectionId=v.slice(0,i),childId=v.slice(i+1);
    if(!sectionId||!childId)return null;
    return {sectionId:sectionId,childId:childId};
  }
  function observe(){
    if(!st.el||typeof root.IntersectionObserver!=='function')return;
    var sections=st.el.querySelectorAll('.ff-section');if(!sections.length)return;
    var visible={};
    st.observer=new root.IntersectionObserver(function(entries){
      entries.forEach(function(e){visible[e.target.id]=e.isIntersecting;});
      if(now()<st.lockUntil)return;
      var first=null;Array.prototype.some.call(sections,function(s){if(visible[s.id]){first=s.id;return true;}return false;});
      if(first){var parent=document.getElementById(first),children=parent?parent.querySelectorAll('.insight-section[id]'):[],active=null;Array.prototype.some.call(children,function(c){var r=c.getBoundingClientRect();if(r.top<=headerOffset()+80&&r.bottom>headerOffset()+40){active=c.id;return true;}return false;});setCurrent(first,active);}
    },{rootMargin:'-20% 0px -60% 0px',threshold:0});
    Array.prototype.forEach.call(sections,function(s){st.observer.observe(s);});
  }
  function unmount(){
    if(st.observer)try{st.observer.disconnect();}catch(e){}
    if(st.el&&st.onClick)st.el.removeEventListener('click',st.onClick);
    if(st.el&&st.onKey)st.el.removeEventListener('keydown',st.onKey);
    if(st.mq&&st.onMq){if(st.mq.removeEventListener)st.mq.removeEventListener('change',st.onMq);else if(st.mq.removeListener)st.mq.removeListener(st.onMq);}
    if(st.onUser)['wheel','touchstart','keydown'].forEach(function(t){root.removeEventListener(t,st.onUser,true);});
    clearTimeout(settleTimer);
    st={el:null,nav:null,current:null,currentChild:null,lockUntil:0,observer:null,mq:null,onMq:null,onClick:null,onKey:null,onUser:null};
  }
  function mount(app){
    var el=app&&app.querySelector?app.querySelector('[data-ff-workspace]'):null;
    if(!el){unmount();return;}
    if(st.el===el)return;
    unmount();
    st.el=el;st.nav=el.querySelector('[data-ff-nav]');
    st.onClick=function(e){
      var t=e.target&&e.target.closest?e.target.closest('[data-ff-target],[data-ff-nav-toggle],[data-ff-expand],[data-ff-child]'):null;
      if(!t||!st.el.contains(t))return;
      e.preventDefault();
      if(t.hasAttribute('data-ff-nav-toggle')){setOpen(!st.nav.classList.contains('is-open'));return;}
      if(t.hasAttribute('data-ff-expand')){
        var willOpen=t.getAttribute('aria-expanded')!=='true';
        t.setAttribute('aria-expanded',willOpen?'true':'false');
        var list=document.getElementById(t.getAttribute('aria-controls'));
        if(list)list.hidden=!willOpen;
        return;
      }
      if(t.hasAttribute('data-ff-child')){
        var key=parseChildAttr(t.getAttribute('data-ff-child'));
        if(key)goChild(key.sectionId,key.childId);
        return;
      }
      go(t.getAttribute('data-ff-target'));
    };
    st.onKey=function(e){if(e.key==='Escape'&&st.nav&&st.nav.classList.contains('is-open')){setOpen(false);var t=st.nav.querySelector('[data-ff-nav-toggle]');if(t)t.focus();}};
    el.addEventListener('click',st.onClick);el.addEventListener('keydown',st.onKey);
    st.onUser=function(){clearTimeout(settleTimer);}; /* user takes over scrolling: stop re-alignment */
    ['wheel','touchstart','keydown'].forEach(function(t){root.addEventListener(t,st.onUser,{capture:true,passive:true});});
    if(root.matchMedia){st.mq=root.matchMedia('(max-width: 900px)');st.onMq=syncLayout;if(st.mq.addEventListener)st.mq.addEventListener('change',st.onMq);else if(st.mq.addListener)st.mq.addListener(st.onMq);}
    syncLayout();observe();
  }
  function getState(){return {mounted:!!st.el,current:st.current,currentChild:st.currentChild,open:!!(st.nav&&st.nav.classList.contains('is-open'))};}
  return {render:render,sectionsFor:sectionsFor,mount:mount,unmount:unmount,getState:getState,_setCurrent:setCurrent,_childSectionsFor:childSectionsFor,_navItemHtml:navItemHtml,_parseChildAttr:parseChildAttr};
})(typeof window!=='undefined'?window:this);
if(typeof module!=='undefined'&&module.exports)module.exports=FastFactsWorkspace;
