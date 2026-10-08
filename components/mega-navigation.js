/* V45.8.0 mega menu: renders the Level 1 topic row (#stepper) and the Level 2 destination panel
   (#megaNavigationPanel) from getNavigationView() (core/navigation-model.js), and drives the mobile
   drawer via the existing #projectNavToggle button. One semantic model, two responsive presentations
   — no separate mobile markup or mobile-only logic.

   openTopicId is the only state this module owns, and it is intentionally never persisted, never
   read as progress/readiness meaning, and reset on every project-type change (see state() below) —
   matching the "No new product state" / "No new progress meaning" rules in the build spec. */
var MegaNavigation=(function(){'use strict';
  var openTopicId=null;

  function esc(v){return typeof window!=='undefined'&&typeof window.esc==='function'?window.esc(v):String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

  function destinationMarkup(topic,dest){
    return '<li><button type="button" class="mega-navigation-panel__link" data-act="mega-nav-jump" data-step="'+topic.step+'" data-section-id="'+esc(dest.id)+'">'+esc(dest.label)+'</button></li>';
  }

  function panelMarkup(topic){
    if(!topic)return '';
    return '<div class="mega-navigation-panel__inner">'
      +'<p class="mega-navigation-panel__purpose">'+esc(topic.purpose)+'</p>'
      +'<ul class="mega-navigation-panel__list">'+topic.destinations.map(function(d){return destinationMarkup(topic,d);}).join('')+'</ul>'
      +'<button type="button" class="btn secondary sm mega-navigation-panel__go" data-act="mega-nav-go" data-step="'+topic.step+'">Go to '+esc(topic.label)+'<span class="sr"> section</span></button>'
      +'</div>';
  }

  function topicMarkup(topic){
    var cueLabel=topic.status==='now'?'Now':topic.status==='review'?'Review':'Later',statusClass='topicnav '+topic.status;
    if(topic.status==='later')return '<li class="project-navigation__item"><span class="'+statusClass+'" aria-disabled="true"><span class="cue">'+cueLabel+'</span><span class="lbl">'+esc(topic.label)+'</span></span></li>';
    if(!topic.destinations.length)return '<li class="project-navigation__item"><button type="button" class="'+statusClass+'" data-act="mega-nav-go" data-step="'+topic.step+'"'+(topic.status==='now'?' aria-current="true"':'')+'><span class="cue">'+cueLabel+'</span><span class="lbl">'+esc(topic.label)+'</span></button></li>';
    var open=openTopicId===topic.id;
    return '<li class="project-navigation__item'+(open?' is-open':'')+'"><button type="button" class="'+statusClass+' has-destinations" data-act="mega-nav-toggle" data-topic-id="'+topic.id+'" data-step="'+topic.step+'" aria-haspopup="true" aria-expanded="'+(open?'true':'false')+'" aria-controls="megaNavigationPanel"'+(topic.status==='now'?' aria-current="true"':'')+'><span class="cue">'+cueLabel+'</span><span class="lbl">'+esc(topic.label)+'</span><span class="project-navigation__chevron" aria-hidden="true"></span></button></li>';
  }

  function render(){
    var stepperEl=document.getElementById('stepper'),panelEl=document.getElementById('megaNavigationPanel');
    if(!stepperEl)return;
    var view=typeof getNavigationView==='function'?getNavigationView(typeof S!=='undefined'?S:null):[];
    var openTopic=null;
    view.forEach(function(t){if(t.id===openTopicId)openTopic=t;});
    if(!openTopic)openTopicId=null;
    stepperEl.innerHTML='<ul class="project-navigation__list">'+view.map(topicMarkup).join('')+'</ul>';
    if(panelEl){
      if(openTopic){panelEl.hidden=false;panelEl.innerHTML=panelMarkup(openTopic);}
      else{panelEl.hidden=true;panelEl.innerHTML='';}
    }
  }

  function closeToReturnFocus(){
    var trigger=document.querySelector('[data-act="mega-nav-toggle"][aria-expanded="true"]');
    openTopicId=null;render();
    if(trigger){var again=document.querySelector('[data-act="mega-nav-toggle"][data-topic-id="'+trigger.getAttribute('data-topic-id')+'"]');if(again){try{again.focus();}catch(e){}}}
  }

  function toggle(topicId){openTopicId=(openTopicId===topicId)?null:topicId;render();}
  function close(){if(openTopicId===null)return;openTopicId=null;render();}
  function isOpen(){return openTopicId!==null;}

  function closeMobileDrawer(){
    var nav=document.getElementById('projectNavigation'),toggleBtn=document.getElementById('projectNavToggle');
    if(nav)nav.classList.remove('is-open');
    if(toggleBtn)toggleBtn.setAttribute('aria-expanded','false');
  }
  function toggleMobileDrawer(){
    var nav=document.getElementById('projectNavigation'),toggleBtn=document.getElementById('projectNavToggle');
    if(!nav||!toggleBtn)return;
    var open=!nav.classList.contains('is-open');
    nav.classList.toggle('is-open',open);
    toggleBtn.setAttribute('aria-expanded',open?'true':'false');
    if(!open){openTopicId=null;render();}
  }

  function handleOutsideClick(e){
    if(openTopicId===null)return;
    var root=document.getElementById('projectNavigation');
    if(root&&!root.contains(e.target))close();
  }

  function install(){
    document.addEventListener('click',handleOutsideClick);
    render();
  }
  if(typeof document!=='undefined'){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  }

  return {render:render,toggle:toggle,close:close,closeToReturnFocus:closeToReturnFocus,isOpen:isOpen,toggleMobileDrawer:toggleMobileDrawer,closeMobileDrawer:closeMobileDrawer};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=MegaNavigation;
