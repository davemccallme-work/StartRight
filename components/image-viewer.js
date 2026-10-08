/* V45.6.10 IMAGE VIEWER + ILLUSTRATION CAROUSEL (presentation only)
   ImageViewer
     - Any illustration image inside the app becomes a keyboard-operable control
       (role="button", tabindex="0", aria-label "Open larger image: …").
     - Click / Enter / Space opens a modal dialog with the full-size image, title, caption, and the
       illustrative-use boundary. Close with ×, Escape, or a click outside the image panel.
     - Focus moves into the dialog and returns to the image on close. Focus is trapped while open.
   IllustrationCarousel
     - A progressive-examples grid with 3 or more cards becomes a horizontal, scroll-snap track with
       Previous / Next controls and a polite "Showing x of n" status. Swipe works natively on touch.
     - Fewer than 3 cards: unchanged grid.
   Neither module writes to S, drafts, storage, history, or analytics. Both are idempotent and are
   re-applied after every render via enhance(root). */
var ImageViewer=(function(root){'use strict';
  var SELECTOR='#app .progressive-card img,#app .visual-example img,#app .insight-tile img,#app .inline-response__figure img,#app .document-guidance-card__visual img,#app .insight-visual img,#app .ff-section img,#app .visual-guidance-card img';
  var BOUNDARY='Illustrative example only. It is not a reviewed design, eligibility decision, or document requirement.';
  var state={open:false,returnTo:null,el:null};
  function safe(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function meta(img){var fig=img.closest&&img.closest('figure,article');var title=img.getAttribute('data-lightbox-title')||(fig&&fig.querySelector('strong,h3,h4')?fig.querySelector('strong,h3,h4').textContent:'')||img.getAttribute('alt')||'Illustration';var cap=img.getAttribute('data-lightbox-caption')||(fig&&fig.querySelector('figcaption p:not(.visual-example__boundary),p')?fig.querySelector('figcaption p:not(.visual-example__boundary),p').textContent:'');return {title:title.trim(),caption:cap.trim(),src:img.getAttribute('src'),alt:img.getAttribute('alt')||title};}
  function enhance(scope){if(typeof document==='undefined')return;var list=(scope&&scope.querySelectorAll?scope:document).querySelectorAll(SELECTOR.split(',').map(function(s){return s.replace('#app ','');}).join(','));Array.prototype.forEach.call(list,function(img){if(img.hasAttribute('data-image-viewer'))return;if(!img.closest('#app'))return;img.setAttribute('data-image-viewer','1');img.setAttribute('role','button');img.setAttribute('tabindex','0');img.setAttribute('aria-haspopup','dialog');img.setAttribute('aria-label','Open larger image: '+meta(img).title);});}
  /* 2026-10-05: a plain, non-top-layer div, however high its z-index, cannot render above a native
     <dialog> shown via showModal() — once showModal() is called (the scenario guide's own dialog,
     core/v45.7-navigation-scenario-guide.js, does exactly this), that dialog is promoted to the
     browser's top layer, which always paints above ordinary stacking-context content regardless of
     z-index. Opening an image from inside the scenario guide therefore rendered this viewer
     completely invisible behind it. Making the image viewer itself a native <dialog> opened the same
     way promotes IT to the top layer too, and top-layer elements stack in the order they were
     opened — so a viewer opened after (nested inside, from the user's perspective) the scenario
     guide correctly paints above it, exactly mirroring how the scenario guide's own dialog already
     behaves correctly above the rest of the page. */
  function build(m){var d=document.createElement('dialog');d.className='image-viewer';d.setAttribute('aria-modal','true');d.setAttribute('aria-labelledby','image-viewer-title');d.innerHTML='<div class="image-viewer__panel" tabindex="-1"><div class="image-viewer__head"><h2 id="image-viewer-title">'+safe(m.title)+'</h2><button type="button" class="image-viewer__close" data-image-viewer-close aria-label="Close larger image">&times;</button></div><div class="image-viewer__frame"><img src="'+m.src+'" alt="'+safe(m.alt)+'"></div>'+(m.caption?'<p class="image-viewer__caption">'+safe(m.caption)+'</p>':'')+'<p class="image-viewer__boundary">'+BOUNDARY+'</p></div>';d.addEventListener('cancel',function(e){e.preventDefault();close();});return d;}
  function open(img){if(state.open)close();var m=meta(img);state.returnTo=img;state.el=build(m);document.body.appendChild(state.el);document.body.classList.add('image-viewer-open');state.open=true;if(state.el.showModal)state.el.showModal();else state.el.setAttribute('open','');var b=state.el.querySelector('.image-viewer__close');try{b.focus();}catch(e){}}
  function close(){if(!state.open)return;if(state.el){if(state.el.open&&state.el.close)state.el.close();else state.el.removeAttribute('open');if(state.el.parentNode)state.el.parentNode.removeChild(state.el);}document.body.classList.remove('image-viewer-open');state.open=false;var t=state.returnTo;state.el=null;state.returnTo=null;if(t&&document.contains(t)){try{t.focus({preventScroll:true});}catch(e){}}}
  function trap(e){var f=state.el.querySelectorAll('button,[href],[tabindex]:not([tabindex="-1"])');if(!f.length)return;var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}
  function install(){if(typeof document==='undefined'||install.done)return;install.done=true;
    document.addEventListener('click',function(e){if(state.open){if(e.target===state.el||(e.target.closest&&e.target.closest('[data-image-viewer-close]'))){e.preventDefault();close();}return;}var img=e.target.closest&&e.target.closest('img[data-image-viewer]');if(!img)return;e.preventDefault();e.stopPropagation();open(img);},true);
    document.addEventListener('keydown',function(e){if(state.open){if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}else if(e.key==='Tab')trap(e);return;}var img=e.target&&e.target.matches&&e.target.matches('img[data-image-viewer]')?e.target:null;if(img&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.stopPropagation();open(img);}},true);}
  return {enhance:enhance,install:install,open:open,close:close,isOpen:function(){return state.open;},SELECTOR:SELECTOR};
})(typeof window!=='undefined'?window:this);

var IllustrationCarousel=(function(root){'use strict';
  var MIN=3;
  /* V45.6.11: the carousel is a shared presentation behavior, not an answer-engine-only feature.
     Any already-governed grid of image cards becomes a carousel at 3+ items, wherever it renders:
     answer-derived illustrations, document guidance lists ("May be needed"), the Fast Facts
     document gallery, reference-example figures under a selected answer, and the photo/document
     example modals. No image is added, removed, or reordered by this list; it only decides which
     existing grids receive the carousel treatment. */
  var GROUP_SELECTOR='.progressive-examples__grid,.document-guidance-list,.fast-facts-doc-gallery__grid,.inline-response__references,.photo-example-list,.visual-guidance-set__grid';
  function reduced(){return !!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches);}
  function update(wrap){var track=wrap.querySelector('.illustration-carousel__track'),cards=track.children,n=cards.length,w=cards[0]?cards[0].getBoundingClientRect().width:1,gap=16,idx=Math.round(track.scrollLeft/(w+gap));var visible=Math.max(1,Math.round(track.clientWidth/(w+gap)));var s=wrap.querySelector('.illustration-carousel__status');if(s)s.textContent='Showing '+Math.min(n,idx+1)+(visible>1?'–'+Math.min(n,idx+visible):'')+' of '+n;var p=wrap.querySelector('[data-carousel-dir="-1"]'),x=wrap.querySelector('[data-carousel-dir="1"]');if(p)p.disabled=track.scrollLeft<=2;if(x)x.disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-2;}
  /* V45.6.11: only items that actually contain an image count toward the 3-item threshold, so a text note or empty slot never turns a 2-image group into a carousel. */
  function imageCount(g){return Array.prototype.filter.call(g.children,function(c){return c.tagName==='IMG'||!!(c.querySelector&&c.querySelector('img'));}).length;}
  function enhance(scope){if(typeof document==='undefined')return;var grids=(scope||document).querySelectorAll(GROUP_SELECTOR);Array.prototype.forEach.call(grids,function(g){if(g.hasAttribute('data-carousel-ready')||imageCount(g)<MIN)return;if(g.closest('[data-carousel-ready]'))return;g.setAttribute('data-carousel-ready','1');var wrap=document.createElement('div');wrap.className='illustration-carousel';wrap.setAttribute('role','region');wrap.setAttribute('aria-roledescription','carousel');wrap.setAttribute('aria-label','Illustrations ('+g.children.length+')');g.parentNode.insertBefore(wrap,g);g.classList.add('illustration-carousel__track');wrap.appendChild(g);var c=document.createElement('div');c.className='illustration-carousel__controls';c.innerHTML='<button type="button" class="illustration-carousel__btn" data-carousel-dir="-1" aria-label="Previous illustration">&larr;</button><span class="illustration-carousel__status" aria-live="polite"></span><button type="button" class="illustration-carousel__btn" data-carousel-dir="1" aria-label="Next illustration">&rarr;</button>';wrap.appendChild(c);c.addEventListener('click',function(e){var b=e.target.closest('[data-carousel-dir]');if(!b)return;var card=g.children[0],w=card?card.getBoundingClientRect().width+16:g.clientWidth;g.scrollBy({left:(+b.getAttribute('data-carousel-dir'))*w,behavior:reduced()?'auto':'smooth'});});g.addEventListener('scroll',function(){update(wrap);},{passive:true});setTimeout(function(){update(wrap);},0);});}
  return {enhance:enhance,MIN:MIN,GROUP_SELECTOR:GROUP_SELECTOR};
})(typeof window!=='undefined'?window:this);
if(typeof module!=='undefined'&&module.exports)module.exports={ImageViewer:ImageViewer,IllustrationCarousel:IllustrationCarousel};
