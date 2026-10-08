/* V45.8.3 mobile question-nav chip stepper: keep the current step's chip scrolled into view.
   components.v45.7.3.css turns #questionNavigator's list into a single-row, horizontally scrollable
   strip of chips at mobile widths — fixing a stale `flex-wrap:wrap` rule in
   components.v4439-overrides.css that was defeating it, wrapping the strip back into the tall
   vertical block of fully-labeled rows this was built to replace. scrollIntoView({inline:'center'})
   needs no manual scroll-offset math — every carousel bug fixed earlier in this project came from
   exactly that — and is a no-op on desktop, where the nav is a vertical grid, not a horizontal
   scroller, so this file is safe to run unconditionally rather than gating on viewport width.
   Mouse-wheel-hover horizontal scrolling for this strip is handled generically, along with every
   other horizontally-scrollable element in the app, by core/v45.8.5-global-horizontal-scroll.js —
   not bound here, to avoid double-handling the same wheel event. */
(function(root){'use strict';
  function reduced(){return !!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches);}
  function revealCurrentQuestionChip(){
    var current=document.querySelector('#questionNavigator .question-nav__button[aria-current="step"]');
    if(!current)return;
    /* 2026-10-06: was current.scrollIntoView({block:'nearest'}). That also scrolls the PAGE vertically to bring
       the chip strip (top of the screen) into view, so every answer selection re-rendered and then threw a
       reader who was down at the choices back up the page. Only the strip itself is scrolled now, sideways. */
    var list=current.parentElement;while(list&&list!==document.body&&list.scrollWidth<=list.clientWidth+1)list=list.parentElement;
    if(!list||list===document.body)return;
    var lr=list.getBoundingClientRect(),cr=current.getBoundingClientRect(),left=list.scrollLeft+(cr.left-lr.left)-(lr.width-cr.width)/2;
    try{list.scrollTo({left:Math.max(0,left),top:list.scrollTop,behavior:reduced()?'auto':'smooth'});}catch(e){list.scrollLeft=Math.max(0,left);}
  }
  function enhance(){revealCurrentQuestionChip();}
  function install(){
    var base=root.render;
    if(typeof base==='function'&&!base.__v4583){
      var wrapped=function(){var result=base.apply(this,arguments);setTimeout(enhance,0);return result;};
      wrapped.__v4583=true;
      root.render=wrapped;
    }
  }
  if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();}
})(typeof window!=='undefined'?window:this);
