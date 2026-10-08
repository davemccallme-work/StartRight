"use strict";
/* V45.8.0 two-level navigation (core/navigation-model.js + components/project-navigation.js).
   Covers what can be verified without a real browser DOM: the model, build registration, and the
   state/governance/routing-regression guardrails from the implementation block. Rendering/
   accessibility/interaction behavior (focus, scroll, keyboard, zoom reflow) was verified live in a
   real browser per the block's Iteration 7/Manual Acceptance Checklist — see the session record. */
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const R=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(R,f),"utf8");

function fakeDoc(presentIds){
  presentIds=presentIds||[];
  return {
    querySelector:function(sel){
      var m=/^#([A-Za-z0-9_-]+)$/.exec(sel);
      if(!m)return null;
      return presentIds.indexOf(m[1])>=0?{id:m[1]}:null;
    },
    getElementById:function(id){return presentIds.indexOf(id)>=0?{id:id}:null;}
  };
}

/* vm.createContext() is a separate realm: arrays/objects the model returns have that realm's Array/
   Object constructors, which assert.deepEqual's strict mode treats as non-equal to identically-shaped
   outer-realm values. Re-materializing through JSON (also run in the outer realm, since `native` is
   a function in THIS file) fixes it without weakening the comparison. */
function native(x){return JSON.parse(JSON.stringify(x));}

function loadModel(){
  var ctx=vm.createContext({window:undefined});
  vm.runInContext(read("core/navigation-model.js"),ctx,{filename:"core/navigation-model.js"});
  var m=ctx.ProjectNavigationModel;
  return {
    topics:function(){return native(m.topics());},
    topicForStep:function(step){return native(m.topicForStep(step));},
    topicById:function(id){return native(m.topicById(id));},
    view:function(context){return native(m.view(context));},
    discoverFastFactsDestinations:function(doc){return native(m.discoverFastFactsDestinations(doc));}
  };
}

/* Minimal stand-in for the real .ff-section/.insight-section markup components/fast-facts-workspace.js
   renders, just enough surface for discoverFastFactsDestinations() to read: getElementById (for the
   recommended-action anchor), querySelectorAll('.ff-section[id]'), and per-section
   querySelector('.ff-section__title') / querySelectorAll('.insight-section[id]'). */
function fakeFastFactsDoc(opts){
  opts=opts||{};
  var sections=(opts.sections||[]).map(function(s){
    var children=(s.children||[]).map(function(c){
      return {id:c.id,querySelector:function(sel){return sel===".insight-section__title"?{textContent:c.label}:null;}};
    });
    return {
      id:s.id,
      hidden:!!s.hidden,
      querySelector:function(sel){return sel===".ff-section__title"?{textContent:s.label}:null;},
      querySelectorAll:function(sel){return sel===".insight-section[id]"?children:[];}
    };
  });
  return {
    getElementById:function(id){return opts.hasRecommended&&id==="insight-next"?{id:"insight-next",hidden:!!opts.recommendedHidden}:null;},
    querySelectorAll:function(sel){return sel===".ff-section[id]"?sections:[];}
  };
}

test("MODEL: exactly five Level 1 topics, with the preserved five labels, in step order",()=>{
  const M=loadModel();
  const topics=M.topics();
  assert.equal(topics.length,5);
  assert.deepEqual(topics.map(t=>t.label),["Your project","Project details","Review & confirm","Prepare to begin","Your guidance"]);
  assert.deepEqual(topics.map(t=>t.step),[0,1,2,3,4]);
});

test("MODEL: the preserved five labels match the existing CUSTOMER_NAV_LABELS authority (core/render.js), not a duplicate copy",()=>{
  const r=read("core/render.js");
  const m=r.match(/CUSTOMER_NAV_LABELS=\[([^\]]+)\]/);
  assert.ok(m,"CUSTOMER_NAV_LABELS must still exist in core/render.js");
  const liveLabels=JSON.parse("["+m[1]+"]");
  const M=loadModel();
  assert.deepEqual(M.topics().map(t=>t.label),liveLabels);
});

test("MODEL: every Level 2 destination belongs to exactly one Level 1 topic, and groups only nest one level",()=>{
  const M=loadModel();
  M.topics().forEach(function(topic){
    (topic.destinations||[]).forEach(function(dest){
      assert.ok(["anchor","screen","group"].indexOf(dest.type)>=0,dest.id+" has a recognized type");
      if(dest.type==="group"){
        (dest.children||[]).forEach(function(child){
          assert.notEqual(child.type,"group","groups do not nest a second level: "+child.id);
        });
      }
    });
  });
});

test("MODEL: 'You told us' and 'Our interpretation' remain separate destinations, not merged",()=>{
  const M=loadModel();
  const guidance=M.topicById("guidance");
  const group=guidance.destinations.filter(d=>d.id==="project-and-answers")[0];
  assert.ok(group);
  const ids=group.children.map(c=>c.id);
  assert.ok(ids.indexOf("guidance-you-told-us")>=0);
  assert.ok(ids.indexOf("our-interpretation")>=0);
  assert.notEqual(group.children.filter(c=>c.id==="guidance-you-told-us")[0].selectors[0],group.children.filter(c=>c.id==="our-interpretation")[0].selectors[0]);
});

test("MODEL: an anchor destination whose target id is absent from the current render is unavailable",()=>{
  const M=loadModel();
  const doc=fakeDoc(["s-next-h","s-known-h"]); // s-interp-h (conditional) and s-confirm-h absent this render
  const view=M.view({currentStep:4,documentRoot:doc,isStepReachable:function(){return true;}});
  const guidance=view.filter(t=>t.id==="guidance")[0];
  const ids=guidance.destinations.map(d=>d.id);
  assert.ok(ids.indexOf("guidance-next-action")>=0,"present target stays available");
  const group=guidance.destinations.filter(d=>d.id==="project-and-answers")[0];
  assert.ok(group,"the group itself stays available because at least one child (you-told-us) is present");
  const childIds=group.children.map(c=>c.id);
  assert.ok(childIds.indexOf("guidance-you-told-us")>=0);
  assert.equal(childIds.indexOf("our-interpretation"),-1,"absent s-interp-h must not render as a destination");
  assert.equal(ids.indexOf("guidance-needs-confirmation"),-1,"absent s-confirm-h must not render as a destination");
});

test("MODEL: an empty-group topic disappears entirely (not rendered as an empty group) when none of its children are present",()=>{
  const M=loadModel();
  const doc=fakeDoc([]); // nothing rendered this frame
  const view=M.view({currentStep:4,documentRoot:doc,isStepReachable:function(){return true;}});
  const guidance=view.filter(t=>t.id==="guidance")[0];
  assert.deepEqual(guidance.destinations,[]);
});

test("MODEL: route/topic availability derives from current state (isStepReachable), not a fixed list",()=>{
  const M=loadModel();
  const reachableOnlyStep0=function(step){return step===0;};
  const view=M.view({currentStep:0,documentRoot:fakeDoc([]),isStepReachable:reachableOnlyStep0});
  assert.deepEqual(view.map(t=>({step:t.step,reachable:t.reachable})),[
    {step:0,reachable:true},{step:1,reachable:false},{step:2,reachable:false},{step:3,reachable:false},{step:4,reachable:false}
  ]);
});

test("MODEL: an unreachable topic always resolves to zero destinations, even if it has real anchors defined",()=>{
  const M=loadModel();
  const view=M.view({currentStep:0,documentRoot:fakeDoc(["u-known-h","u-confirm-h"]),isStepReachable:function(step){return step<=2;}});
  const review=view.filter(t=>t.id==="review")[0];
  assert.equal(review.reachable,true);
  assert.equal(review.current,false);
  assert.deepEqual(review.destinations,[],"destinations are only resolved for the CURRENT topic, never a merely-reachable one");
});

test("MODEL: step 0 (no in-page sections to point to) intentionally has zero Level 2 destinations",()=>{
  const M=loadModel();
  assert.deepEqual(M.topicForStep(0).destinations,[]);
});

test("MODEL: step 1's static destinations are empty — its Level 2 destinations are discovered dynamically instead (see below), since they vary by project type",()=>{
  const M=loadModel();
  assert.deepEqual(M.topics()[1].destinations,[]);
});

test("MODEL: discoverFastFactsDestinations reads the real rendered Fast Facts outline, not a maintained copy",()=>{
  const M=loadModel();
  const doc=fakeFastFactsDoc({
    hasRecommended:true,
    sections:[
      {id:"ff-section-prepare",label:"Prepare",children:[
        {id:"ff-prepare-photos",label:"Photos that may help"},
        {id:"ff-prepare-docs",label:"Documents you may encounter"}
      ]},
      {id:"ff-section-site-access",label:"Site access",children:[]}
    ]
  });
  const out=M.discoverFastFactsDestinations(doc);
  assert.deepEqual(out.map(x=>x.id),["ff-recommended","ff-section-prepare","ff-section-site-access"]);
  assert.equal(out[0].targetId,"insight-next");
  const prepare=out[1];
  assert.equal(prepare.type,"group","2+ children render as a group");
  assert.deepEqual(prepare.children.map(c=>c.targetId),["ff-prepare-photos","ff-prepare-docs"]);
  const siteAccess=out[2];
  assert.equal(siteAccess.type,"anchor","0 children renders as a plain anchor to the section itself");
  assert.equal(siteAccess.targetId,"ff-section-site-access");
});

test("MODEL: discoverFastFactsDestinations skips a section marked hidden (core/v45.7.5.9.4-scenario-guide-runtime.js's suppressInlineGuide() hides the inline Scenario guide section once its content is shown by the separate launcher/drawer instead) — a hidden section is treated the same as one absent from the DOM",()=>{
  const M=loadModel();
  const doc=fakeFastFactsDoc({
    hasRecommended:true,
    sections:[
      {id:"ff-section-scenario-guide",label:"Scenario guide",hidden:true,children:[{id:"panel-matters",label:"What we need to understand"}]},
      {id:"ff-section-what-may-change",label:"What may change",children:[]}
    ]
  });
  const out=M.discoverFastFactsDestinations(doc);
  assert.deepEqual(out.map(x=>x.id),["ff-recommended","ff-section-what-may-change"],"the hidden section and its children never appear as a destination");
});

test("MODEL: discoverFastFactsDestinations fails closed to [] when the results sub-phase hasn't rendered (no recommended action, no sections, or a documentRoot stub without querySelectorAll)",()=>{
  const M=loadModel();
  assert.deepEqual(M.discoverFastFactsDestinations(fakeFastFactsDoc({})),[]);
  assert.deepEqual(M.discoverFastFactsDestinations(fakeDoc([])),[],"a documentRoot without querySelectorAll never throws");
});

test("MODEL: the 'details' topic's view() destinations come from the live Fast Facts outline when current, matching discoverFastFactsDestinations directly",()=>{
  const M=loadModel();
  const doc=fakeFastFactsDoc({hasRecommended:false,sections:[{id:"ff-section-prepare",label:"Prepare",children:[]}]});
  const view=M.view({currentStep:1,documentRoot:doc,isStepReachable:()=>true});
  const details=view.filter(t=>t.id==="details")[0];
  assert.deepEqual(details.destinations,M.discoverFastFactsDestinations(doc));
});

test("MODEL: the 'guidance' topic's expanded destination list uses only ids verified to exist in screens/screen-summary.js or screens/screen-cost-tiers.js (no repeat of the guessed/stale ids found in components/guidance-workspace.js — #prototype-end-h, #guide-end-h, #s-timing-h — none of which were ever real)",()=>{
  const M=loadModel();
  const rendered=read("screens/screen-summary.js")+read("screens/screen-cost-tiers.js");
  function flatten(list){return (list||[]).reduce((acc,d)=>{acc.push(d);if(d.children)acc.push(...flatten(d.children));return acc;},[]);}
  const guidance=M.topicById("guidance");
  const ids=["s-next-h","s-project-h","s-known-h","s-interp-h","s-confirm-h","s-may-h","s-utility-h","s-whatnext-h","cost-timeline-answer-h","cost-uncertainty-h","cost-tier1-h","timing-owner-heading","living-guide-heading","decision-impact-h","where-fits-h","s-beforeyouapply-h","preparation-end-h"];
  const selectors=flatten(guidance.destinations).map(d=>(d.selectors||[])[0]).filter(Boolean);
  assert.deepEqual(selectors.sort(),ids.map(id=>"#"+id).sort());
  for(const id of ids){
    assert.ok(rendered.includes('"'+id+'"')||rendered.includes("'"+id+"'"),"the guidance screen must actually render id="+id);
  }
});

test("STATE/GOVERNANCE: neither module writes to storage, mutates answers, or introduces score/readiness vocabulary",()=>{
  const files=["core/navigation-model.js","components/project-navigation.js"];
  for(const f of files){
    const s=read(f);
    assert.doesNotMatch(s,/localStorage|sessionStorage|persistDraft|scheduleDraftSave/,f);
    assert.doesNotMatch(s,/S\.answers/,f);
    assert.doesNotMatch(s,/readiness|completedTopics|navigationProgress|\bscore\b|percent complete/i,f);
  }
});

test("STATE/GOVERNANCE: drawer-open/focus-return state lives only in module-local variables, never assigned onto S or persisted",()=>{
  const s=read("components/project-navigation.js");
  assert.match(s,/var drawerOpen = false/);
  assert.match(s,/var drawerReturnFocusElement = null/);
  assert.doesNotMatch(s,/S\.openTopic|S\.currentTopic|S\.navigationOpen|S\.pinned|S\.navigationPinned|S\.drawerOpen/);
  assert.doesNotMatch(s,/localStorage|sessionStorage|persistDraft|scheduleDraftSave/);
});

test("V45.8.2: the desktop-only dropdown panel + 'Keep this list open' pin are retired entirely, not just hidden — the drawer is the one nav surface at every screen size now",()=>{
  const s=read("components/project-navigation.js");
  assert.doesNotMatch(s,/function renderTopicTrigger|function renderPanel|function renderPinToggle|function toggleTopic|function togglePin|function isPinned|function isOpen\(|function close\(/,"these desktop-panel-only functions must be fully removed");
  assert.doesNotMatch(s,/\bpinned\b|\bopenTopicId\b|\breturnFocusElement\b/);
  const css=read("components.project-navigation.css");
  assert.doesNotMatch(css,/\.project-nav__panel\b|\.project-nav__pin\b|\.project-nav__topic\b|\.project-nav__chevron\b|\.project-nav__eyebrow\b/);
  const ev=read("core/events.js");
  assert.doesNotMatch(ev,/\"project-nav-toggle\":function|\"project-nav-pin-toggle\":function/);
});

test("ROUTING REGRESSION: the component defers to the canonical navigateToStep rather than mutating S.step directly",()=>{
  const s=read("components/project-navigation.js");
  assert.doesNotMatch(s,/S\.step\s*=[^=]/,"no plain assignment to S.step (comparisons like === are fine)");
  assert.match(s,/root\.navigateToStep\(step\)/);
  assert.match(s,/typeof root\.isStepReachable === 'function'/);
});

test("ROUTING REGRESSION: anchor activation reuses the real rendered element's id (getElementById), never a guessed selector at click time",()=>{
  const s=read("components/project-navigation.js");
  assert.match(s,/root\.document\.getElementById\(targetId\)/);
});

test("BUILD: the new modules and stylesheet are registered in build.js, in the required order",()=>{
  const b=read("build.js");
  assert.match(b,/'core\/navigation-model\.js'/);
  assert.match(b,/'components\/project-navigation\.js'/);
  assert.match(b,/components\.project-navigation\.css/);
  const modelPos=b.indexOf("'core/navigation-model.js'");
  const componentPos=b.indexOf("'components/project-navigation.js'");
  const renderPos=b.indexOf("'core/render.js'");
  assert.ok(modelPos>0&&componentPos>modelPos&&renderPos>componentPos,"required order: navigation-model.js -> project-navigation.js -> render.js");
});

test("BUILD: core/render.js's chrome update and post-render hooks call ProjectNavigation.render(), not a reimplementation",()=>{
  const s=read("core/render.js");
  assert.match(s,/typeof ProjectNavigation!==\"undefined\"&&typeof ProjectNavigation\.render===\"function\"\)ProjectNavigation\.render\(\)/);
  const afterRender=s.slice(s.indexOf("function pnAfterRender"));
  assert.match(afterRender,/requestAnimationFrame\(function\(\)\{ProjectNavigation\.render\(\);\}\)/);
});

test("BUILD: index.html keeps nav.topicbar and #stepper untouched — the component renders itself into the existing mount point",()=>{
  const h=read("index.html");
  assert.match(h,/<nav class="topicbar" aria-label="Project Navigator planning topics">/);
  assert.match(h,/<div class="stepper" id="stepper"><\/div>/);
  assert.match(h,/<p id="topic" class="sr" aria-live="polite">/);
});

test("BUILD: project-nav actions route through the existing delegated actions table, not a second document click listener",()=>{
  const s=read("components/project-navigation.js");
  assert.doesNotMatch(s,/document\.addEventListener\(.click./);
  assert.doesNotMatch(s,/document\.addEventListener\(.keydown./);
  const ev=read("core/events.js");
  assert.match(ev,/"project-nav-step":function/);
  assert.match(ev,/"project-nav-anchor":function/);
  assert.match(ev,/"project-nav-drawer-toggle":function/);
});

test("MOBILE V45.8.1: hamburger drawer + bottom tab bar + sticky Level 2 bar replace the old inline toggle/tree — a reader can jump to any topic or destination in one or two taps instead of opening an inline block first",()=>{
  const s=read("components/project-navigation.js");
  assert.doesNotMatch(s,/renderMobileToggle|renderMobileTopic|toggleMobileTree|projectNavMobileToggle|projectNavMobileTree/,"the superseded inline mobile toggle/tree code is fully removed, not just hidden");
  assert.match(s,/function renderBottomBar/);
  assert.match(s,/function renderStickyDestinations/);
  assert.match(s,/function renderDrawerContent/);
  assert.match(s,/function flattenDestinations/);
  assert.match(s,/function openDrawer/);
  assert.match(s,/function closeDrawer/);
  assert.match(s,/function handleDrawerKeydown/);
  const css=read("components.project-navigation.css");
  assert.match(css,/\.project-nav-drawer\b/);
  assert.match(css,/\.project-nav-bottombar\b/);
  assert.match(css,/\.project-nav__sticky\b/);
});

test("MOBILE V45.8.1: the drawer's Tab focus-trap is exposed as handleDrawerKeydown() for core/events.js's one existing keydown listener to call — not a second listener (same guardrail as the rest of this feature)",()=>{
  const s=read("components/project-navigation.js");
  assert.doesNotMatch(s,/document\.addEventListener\(.click./);
  assert.doesNotMatch(s,/document\.addEventListener\(.keydown./);
  const ev=read("core/events.js");
  assert.match(ev,/ProjectNavigation\.isDrawerOpen\(\)\s*&&\s*ProjectNavigation\.handleDrawerKeydown\(e\)/);
});

test("MOBILE V45.8.1: index.html declares the hamburger trigger and the drawer/backdrop/bottom-bar containers, without touching the three preserved hooks",()=>{
  const h=read("index.html");
  assert.match(h,/id="projectNavDrawerToggle"/);
  assert.match(h,/id="projectNavDrawer"/);
  assert.match(h,/id="projectNavDrawerBackdrop"/);
  assert.match(h,/id="projectNavBottomBar"/);
  assert.match(h,/<nav class="topicbar" aria-label="Project Navigator planning topics">/);
  assert.match(h,/<div class="stepper" id="stepper"><\/div>/);
  assert.match(h,/<p id="topic" class="sr" aria-live="polite">/);
});

test("V45.8.2: the drawer always closes on navigation (conventional drawer behavior, no pin concept anymore) whether a topic or a destination inside it was clicked",()=>{
  const s=read("components/project-navigation.js");
  const navigateStepBody=s.slice(s.indexOf("function navigateStep("),s.indexOf("function targetForId("));
  assert.match(navigateStepBody,/closeDrawer\(\s*\{\s*restoreFocus:\s*false\s*\}\s*\)/);
  const navigateAnchorBody=s.slice(s.indexOf("function navigateAnchor("),s.indexOf("function setCurrentDestination("));
  assert.match(navigateAnchorBody,/closeDrawer\(\s*\{\s*restoreFocus:\s*false\s*\}\s*\)/);
});

test("BUILD: the three screen-level 'On this page' left nav panes are retired — their own interactive controllers are no longer mounted, now that the mega menu covers the same ground (step 2's scrollspy, step 4's paginated GuidanceWorkspace rail, and Fast Facts' own rail)",()=>{
  const ev=read("core/events.js");
  assert.doesNotMatch(ev,/GuidanceWorkspace\.mount\(app\)/);
  assert.doesNotMatch(ev,/FastFactsWorkspace\.mount\(app\)/);
  const observerMentions=(ev.match(/setupUnderstandingSectionObserver/g)||[]).length;
  assert.equal(observerMentions,1,"only the function definition should remain — no call sites");
});

test("BUILD: the retired panes' own render()/content functions are untouched (still covered by their own existing tests) — only their chrome is hidden, via components.project-navigation.css, which loads last",()=>{
  const css=read("components.project-navigation.css");
  assert.match(css,/\.understanding-nav,\s*\n\s*\.summary-section-nav,\s*\n\s*\.summary-section-nav-spacer,\s*\n\s*\.ff-nav\s*\{\s*\n\s*display:\s*none\s*!important;/);
  const b=read("build.js");
  assert.ok(b.indexOf("components.project-navigation.css")>b.indexOf("components.v45.7.3.css"),"loads after the other screen stylesheets so its overrides win");
});

test("BUILD: the mega menu is sticky under the measured header height, never a guessed offset",()=>{
  const css=read("components.project-navigation.css");
  assert.match(css,/nav\.topicbar\s*\{[^}]*position:\s*sticky;[^}]*top:\s*var\(--project-nav-header-offset\)/s);
  const js=read("components/project-navigation.js");
  assert.match(js,/function measureHeaderOffset\(\)/);
  assert.match(js,/--project-nav-header-offset/);
  assert.doesNotMatch(js,/--project-nav-header-offset['"]\s*,\s*['"]?\d/,"the offset is measured from header.app, never hardcoded as a literal px guess");
});

test("V45.8.2: one navigation pattern at every screen size — the hamburger drawer is universal, not scoped to a mobile breakpoint, while the bottom tab bar and sticky Level 2 bar stay mobile-only (a bottom tab bar and a docked chip row are not desktop conventions)",()=>{
  const css=read("components.project-navigation.css");
  const beforeMobileBlock=css.slice(0,css.indexOf("@media (max-width: 1023px)"));
  assert.match(beforeMobileBlock,/\.project-nav-drawer\s*\{/,"the drawer itself is styled outside the mobile-only media query");
  assert.match(beforeMobileBlock,/\.project-nav-drawer-backdrop\s*\{/,"the backdrop is styled outside the mobile-only media query");
  assert.doesNotMatch(beforeMobileBlock,/\.project-nav-drawer-toggle\s*\{\s*display:\s*none/,"the hamburger button must not be hidden by default — it relies on .iconbtn's own always-visible display, no override needed");
  const mobileBlock=css.slice(css.indexOf("@media (max-width: 1023px)"));
  assert.match(mobileBlock,/\.project-nav-bottombar\s*\{/);
  assert.match(mobileBlock,/\.project-nav__sticky\s*\{/);
});

test("V45.8.2: the old desktop-only horizontal topic row and dropdown mega-menu panel are gone — the drawer's own destination resolution still only ever reflects the CURRENT topic against the real rendered DOM, same guardrail as always",()=>{
  const s=read("core/navigation-model.js");
  assert.match(s,/topic\.current\s*\n?\s*\?/,"view() still gates destination resolution on topic.current");
  const nav=read("components/project-navigation.js");
  assert.doesNotMatch(nav,/project-nav__topics|project-nav__desktop/);
});

test("V45.8.2: index.html puts the hamburger as the first child of header.app's .hrow, with the Project Navigator brand icon beside it",()=>{
  const h=read("index.html");
  const hrow=h.slice(h.indexOf('class="wrap hrow"'),h.indexOf('class="wrap hrow"')+800);
  const hamburgerPos=hrow.indexOf("projectNavDrawerToggle");
  const brandPos=hrow.indexOf('class="brand"');
  assert.ok(hamburgerPos>=0&&brandPos>=0&&hamburgerPos<brandPos,"hamburger button must appear before the brand icon in source order");
});

test("BUILD: existing prohibited-language and inventory guardrails still pass with the new modules present",()=>{
  const {execSync}=require("node:child_process");
  const out=execSync("node build.js --check",{cwd:R}).toString();
  assert.match(out,/guardrail check PASS/);
});
