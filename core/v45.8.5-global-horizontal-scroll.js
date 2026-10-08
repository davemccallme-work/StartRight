/* V45.8.5: mouse-wheel-hover -> horizontal-scroll, enforced globally (not component by component).
   A plain mouse (unlike a trackpad) only ever reports vertical wheel delta, so hovering any
   horizontally-scrollable element and scrolling does nothing by default. One delegated document-
   level listener remaps that vertical delta onto scrollLeft for whichever horizontally-scrollable
   element the pointer is actually over, the same way core/events.js uses one delegated click
   listener and one delegated keydown listener instead of binding per-component — this replaces the
   need for every new horizontal strip in the app (the question-nav chip stepper, the scenario
   guide's photo-comparison and document-gallery carousels, and any future one) to carry its own
   bespoke wheel handler.

   A genuine horizontal gesture (trackpad two-finger pan, where deltaX is already the dominant axis)
   is left completely alone here — the early return below means this file never calls
   preventDefault() for one — so the browser's native handling of any overflow-x:auto/scroll element
   keeps working exactly as it always has. Equally, normal vertical page/window scrolling is
   untouched: this only ever acts when the pointer is over an element that scrolls horizontally but
   NOT vertically, so it never competes with a vertically-scrollable container (or the page itself)
   for a vertical gesture.

   components/project-navigation.js's advisor-style rail and core/v45.7-navigation-scenario-guide.js's
   bindRailWheel()/bindMobileNav() already bind their own capture-phase wheel handlers for a couple of
   specific elements and call preventDefault() when they act — checking e.defaultPrevented here means
   this listener defers to them automatically rather than double-handling the same gesture; checking
   that the target is horizontal-only (not also vertically scrollable) is a second, independent guard
   for the same reason. */
(function(root){'use strict';
  function normalizeDelta(e,el){
    var d=e.deltaY;
    if(e.deltaMode===1)d*=16;
    else if(e.deltaMode===2)d*=el.clientWidth;
    return d;
  }
  function scrollableX(el){
    var cs=getComputedStyle(el);
    return (cs.overflowX==='auto'||cs.overflowX==='scroll')&&el.scrollWidth>el.clientWidth+1;
  }
  function scrollableY(el){
    var cs=getComputedStyle(el);
    return (cs.overflowY==='auto'||cs.overflowY==='scroll')&&el.scrollHeight>el.clientHeight+1;
  }
  function findHorizontalOnlyScroller(node){
    var el=node;
    while(el&&el!==document.body&&el!==document.documentElement){
      if(scrollableX(el)&&!scrollableY(el))return el;
      el=el.parentElement;
    }
    return null;
  }
  function onWheel(e){
    if(e.ctrlKey||e.defaultPrevented)return;
    if(Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
    var el=findHorizontalOnlyScroller(e.target);
    if(!el)return;
    var max=el.scrollWidth-el.clientWidth;
    if(max<=1)return;
    var next=Math.max(0,Math.min(max,el.scrollLeft+normalizeDelta(e,el)));
    if(Math.abs(next-el.scrollLeft)>0.5){e.preventDefault();el.scrollLeft=next;}
  }
  function install(){
    if(typeof document==='undefined'||install.done)return;
    install.done=true;
    document.addEventListener('wheel',onWheel,{passive:false});
  }
  if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();}
})(typeof window!=='undefined'?window:this);
