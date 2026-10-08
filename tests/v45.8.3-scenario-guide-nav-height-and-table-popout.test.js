"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const R=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(R,f),"utf8");
// 2026-10-05: the Scenario Guide dialog's mobile nav row originally reserved up to 28vh (120px
// floor). A first pass cut that to 18vh/80px; a follow-up then needed the row to also hold the
// header's own clearance padding (the header is always the topmost element — see its rule's
// comment — so nav, not the header, is what donates space now), landing at 24vh/150px: still well
// under the original, but larger than the very first cut-down since it has more to accommodate.
test("mobile scenario guide nav row holds both the header's clearance and real nav content, smaller than the original but larger than the first cut-down pass",()=>{
  const s=read("core/v45.7.5.9.4-scenario-guide-runtime.js");
  assert.match(s,/grid-template-rows:minmax\(150px,24vh\) minmax\(0,1fr\)/);
  assert.doesNotMatch(s,/grid-template-rows:minmax\(120px,28vh\)/);
  assert.doesNotMatch(s,/grid-template-rows:minmax\(80px,18vh\)/);
  assert.match(s,/scenario-guide-shell__nav\{margin-bottom:0!important;padding:10px 14px!important;border-right:0/);
});
// 2026-10-05: the photo-comparison table (components/visual-guidance-card.js's comparison()) is
// dense enough that it still reads as cramped on a phone even with the one-column-at-a-time
// carousel. A mobile-only expand button promotes the same live table (not a rebuilt copy) into a
// fixed, full-viewport card with its own tightened vertical rhythm, so most or all of its rows fit
// without much scrolling.
test("comparison table has a mobile-only full screen popout toggle",()=>{
  const s=read("components/visual-guidance-card.js");
  assert.match(s,/data-visual-expand/);
  assert.match(s,/function setFullscreen\(on\)/);
  assert.match(s,/visual-guidance-set--fullscreen/);
  assert.match(s,/vg-fullscreen-open/);
  assert.match(s,/ev\.key==='Escape'/);
});
test("expand button is hidden by default and only shown at the mobile breakpoint",()=>{
  const s=read("core/v45.7.5.9.4-scenario-guide-runtime.js");
  assert.match(s,/'\.visual-guidance-carousel-expand\{display:none\}'/);
  assert.match(s,/@media\(max-width:760px\)\{\.visual-guidance-carousel-expand\{display:flex!important/);
});
test("fullscreen popout tightens padding, font size and image height instead of just scaling the normal card",()=>{
  const s=read("core/v45.7.5.9.4-scenario-guide-runtime.js");
  assert.match(s,/\.visual-guidance-set--fullscreen \.visual-guidance-comparison th,\.visual-guidance-set--fullscreen \.visual-guidance-comparison td\{padding:4px 6px!important;font-size:\.76rem!important/);
  assert.match(s,/\.visual-guidance-set--fullscreen \.visual-guidance-comparison img\{height:46px!important\}/);
  assert.match(s,/body\.vg-fullscreen-open\{overflow:hidden!important\}/);
});
test("fullscreen data column widens to fill the viewport instead of staying pinned to the normal mobile carousel width",()=>{
  const s=read("core/v45.7.5.9.4-scenario-guide-runtime.js");
  assert.match(s,/\.visual-guidance-set--fullscreen \.visual-guidance-comparison th\[scope="col"\]:not\(:first-child\),\.visual-guidance-set--fullscreen \.visual-guidance-comparison td\{width:calc\(100vw - 70px - 20px\)!important/);
});
// 2026-10-05: a flat tinted fill (no matter the alpha) over the panel's own static white backdrop
// still reads as flatly opaque, because nothing behind it ever varies for the blur to act on —
// confirmed still "opaque" after that fix. Real translucency needs the reading pane's own content to
// actually scroll behind the bar. Promoting header/footer to position:absolute (anchored to the now
// position:relative panel) takes them out of the column flex flow, so the reading pane naturally
// expands to the panel's full height and its content runs — and scrolls — behind both bars.
test("header and footer are overlays the reading pane's own content scrolls behind, not flex siblings that merely sit beside it",()=>{
  const s=read("core/v45.7.5.9.4-scenario-guide-runtime.js");
  assert.match(s,/scenario-guide-dialog__panel\{position:relative!important/);
  assert.match(s,/scenario-guide-dialog__header\{position:absolute!important;top:0!important;left:0!important;right:0!important;z-index:6!important/);
  assert.match(s,/scenario-guide-dialog__footer\{position:absolute!important;bottom:0!important;left:0!important;right:0!important;z-index:6!important/);
});
// 2026-10-05 (follow-up): .6 alpha still read as only faintly translucent, so it dropped to .28; the
// FOOTER specifically still read too faint even at .28, so it was halved again to .14 (2x more
// translucent than .28, 4x more than the original .6) — header stays at .28, since only the bottom
// bar was flagged as still too faint this round.
test("footer is twice as translucent as the header now (.14 vs .28) — the bottom bar was still too faint at .28",()=>{
  const s=read("core/v45.7.5.9.4-scenario-guide-runtime.js");
  assert.match(s,/scenario-guide-dialog__footer\{[^}]*background:rgba\(199,214,224,\.14\)!important;backdrop-filter:blur\(14px\)!important/);
  assert.match(s,/scenario-guide-dialog__header\{[^}]*background:rgba\(199,214,224,\.28\)!important;backdrop-filter:blur\(14px\)!important/);
  assert.doesNotMatch(s,/scenario-guide-dialog__footer\{[^}]*background:rgba\(199,214,224,\.28\)/);
});
// 2026-10-05 (follow-up): nav's z-index-lift — paint over the header instead of clearing it — put the
// nav row ABOVE the dialog's own title bar on mobile. A dialog's header must always be the topmost
// element, full stop — nav and the intro banner get real clearance instead, on every breakpoint.
// 2026-10-05 (follow-up 2): that clearance was PADDING on nav, which still let nav's own scrollable
// box — and the native scrollbar along its edge — start at the very top, behind the header in
// z-order, so a tall enough nav list (or its scrollbar) could still disappear behind the header.
// MARGIN shrinks nav's box itself down below the header instead of padding content inside a box that
// still reaches up that far — nothing of nav's, scrollbar included, ever renders in the header's
// territory now. Every vertical clearance value also dropped by about a third in the same pass.
test("nav uses margin (not padding) for its header/footer clearance, so its own scrollbar can never render behind either bar",()=>{
  const s=read("core/v45.7.5.9.4-scenario-guide-runtime.js");
  assert.match(s,/scenario-guide-shell__nav\{min-width:0!important;margin:0 0 79px!important;padding:20px!important/);
  assert.match(s,/scenario-guide-dialog__intro\{margin-top:64px!important/);
  assert.doesNotMatch(s,/scenario-guide-shell__nav\{position:relative!important;z-index:7/);
  assert.doesNotMatch(s,/scenario-guide-dialog__header\{top:max\(80px,18vh\)/);
  assert.doesNotMatch(s,/scenario-guide-shell__nav\{min-width:0!important;padding:96px/);
});
// 2026-10-05 (follow-up 3): giving nav its top clearance UNCONDITIONALLY double-counted it whenever
// the intro banner was also showing — intro's own margin-top already pushes the nav row down past
// the header, so nav piling its own margin-top on top of that left a blank "white bar" above a
// visibly squished nav row (the fixed-height row's space was being eaten by the redundant gap
// instead of actual nav content). The clearance now only applies via the intro[hidden]~body sibling
// rule — exactly the case where nothing else has already cleared the header (dismissed or never
// shown) — on both breakpoints.
test("nav's top clearance is conditional on the intro banner being hidden — never double-counted while the banner is still showing",()=>{
  const s=read("core/v45.7.5.9.4-scenario-guide-runtime.js");
  assert.match(s,/scenario-guide-dialog__intro\[hidden\]~\[data-scenario-guide-body\] \.scenario-guide-shell__nav\{margin-top:64px!important\}/);
  assert.match(s,/@media\(max-width:900px\)\{#scenario-guide-dialog \.scenario-guide-dialog__intro\[hidden\]~\[data-scenario-guide-body\] \.scenario-guide-shell__nav\{margin-top:60px!important\}\}/);
  assert.doesNotMatch(s,/scenario-guide-shell__nav\{margin-top:52px!important;padding:10px 14px/);
  assert.doesNotMatch(s,/scenario-guide-shell__nav\{padding:76px 14px 10px/);
});
// 2026-10-05 (follow-up 4): both the mobile nav clearance and the mobile intro margin-top were
// confirmed LIVE to still overlap the header by a few pixels (52px/50px against the trimmed header's
// real 56px height) — bumped both to 60px, a real margin instead of a near-exact match that a future
// pixel of header growth could re-break.
test("on mobile, nav's own internal padding (list breathing room, not header clearance) is still trimmed by about a third, and both mobile clearances clear the header with real margin, not an exact match",()=>{
  const s=read("core/v45.7.5.9.4-scenario-guide-runtime.js");
  assert.match(s,/scenario-guide-shell__nav\{margin-bottom:0!important;padding:10px 14px!important;border-right:0/);
  assert.match(s,/scenario-guide-dialog__intro\{margin-top:60px!important/);
});
// 2026-10-05 (follow-up 5): "the problem persists in mobile, desktop works now" — the base nav rule's
// 79px bottom margin (sized for desktop's full-height sidebar clearing the footer) was never reset
// for mobile, where nav is a short row that never reaches anywhere near the footer. It was silently
// eating more than half of the already-compact 150px row as invisible margin — the actual cause of
// the persisting "white bar"/squished row report, not a leftover margin-top issue.
test("mobile nav resets the desktop-only 79px bottom margin to 0 — it never reaches the footer on mobile",()=>{
  const s=read("core/v45.7.5.9.4-scenario-guide-runtime.js");
  assert.match(s,/#scenario-guide-dialog \.scenario-guide-shell__nav\{margin-bottom:0!important;padding:10px 14px!important/);
});
test("reading pane clearance is trimmed by about a third on both breakpoints, still enough that its own text never starts hidden under a bar",()=>{
  const s=read("core/v45.7.5.9.4-scenario-guide-runtime.js");
  assert.match(s,/scenario-guide-shell__reading\{min-width:0!important;padding:64px 32px 79px!important/);
  assert.match(s,/scenario-guide-shell__reading\{padding:50px 20px 70px!important\}\}/);
});
// 2026-10-05 (follow-up): the original rgba(244,246,247,.92) was barely different from white — didn't
// read as translucent at all. Matches the header's exact rgba/blur now for one consistent
// frosted-chrome look (nav keeps the header's .28, not the footer's further-boosted .14, since only
// the bottom bar was flagged as still too faint).
test("nav uses the same boosted, clearly-visible translucent fill as the header, not the old near-white tint",()=>{
  const s=read("core/v45.7.5.9.4-scenario-guide-runtime.js");
  assert.match(s,/scenario-guide-shell__nav\{[^}]*background:rgba\(199,214,224,\.28\)!important;backdrop-filter:blur\(14px\)!important/);
  assert.doesNotMatch(s,/scenario-guide-shell__nav\{[^}]*background:rgba\(244,246,247/);
});
test("header, footer and nav all trimmed their own internal vertical padding by about a third",()=>{
  const s=read("core/v45.7.5.9.4-scenario-guide-runtime.js");
  assert.match(s,/scenario-guide-dialog__header\{position:absolute![^}]*padding:11px 20px 8px!important/);
  assert.match(s,/scenario-guide-dialog__footer\{position:absolute![^}]*min-height:64px!important;padding:12px 24px!important/);
  assert.match(s,/scenario-guide-shell__nav-button\{width:100%!important;padding:8px 12px!important/);
  assert.match(s,/scenario-guide-shell__nav-subbutton\{width:100%!important;padding:5px 12px!important/);
});
