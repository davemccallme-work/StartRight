"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const R=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(R,f),"utf8");
// Retired 2026-10-03: the RELEASE_VERSION='V45.7.5.5' pin is superseded now the build is on V45.7.5.9.9.
test("comparison renders previous next column controls",()=>{const s=read("components/visual-guidance-card.js");assert.match(s,/data-visual-column-step=\"previous\"/);assert.match(s,/data-visual-column-step=\"next\"/);assert.match(s,/visual-guidance-carousel-status/);});
test("carousel advances by governed photo column",()=>{const s=read("components/visual-guidance-card.js");assert.match(s,/function points\(\)/);assert.match(s,/activeIndex\(\)\+delta/);
  // The scroll invocation itself (wrap.scrollTo({...,behavior:'smooth'})) was superseded by the
  // reveal(i,behavior) function's direct wrap.scrollLeft=target assignment in V45.7.5.6; see
  // tests/v45.7.5.6-selected-column-reveal.test.js "carousel has a single exact reveal function".
});
test("carousel status identifies current column",()=>{const s=read("components/visual-guidance-card.js");assert.match(s,/title=heads\[i\]\?heads\[i\]\.textContent\.trim\(\)/);assert.match(s,/\(i\+1\)\+' of '\+heads\.length/);});
test("keyboard supports arrows home and end",()=>{const s=read("components/visual-guidance-card.js");assert.match(s,/ev\.key==='ArrowLeft'/);assert.match(s,/ev\.key==='ArrowRight'/);assert.match(s,/ev\.key==='Home'/);assert.match(s,/ev\.key==='End'/);});
test("controls are bound after dynamic render",()=>{const s=read("core/v45.7-navigation-scenario-guide.js");assert.match(s,/VisualGuidanceCard\.bindCarousel\(document\)/);});
// Retired 2026-10-05: scroll-snap assistance and the mobile display:none!important on the controls
// (leaving only an undiscoverable native swipe below 760px) both belonged to the pre-carousel-shell
// design — reveal(i)'s explicit wrap.scrollTo()/scrollLeft positioning doesn't need scroll-snap to
// land correctly, and the controls are now hover-reveal (forced visible on touch) everywhere this
// table renders instead of hidden on narrow viewports. See core/v45.7.5.9.4-scenario-guide-runtime.js.
test("controls are never hidden by width, and don't rely on scroll-snap for positioning",()=>{const c=read("components.v45.7.3.css");assert.doesNotMatch(c,/visual-guidance-carousel-controls\{display:none/);assert.doesNotMatch(c,/visual-guidance-set--comparison\{scroll-snap-type/);const s=read("core/v45.7.5.9.4-scenario-guide-runtime.js");assert.match(s,/'\.visual-guidance-carousel-shell:hover \.visual-guidance-carousel-button/);});
test("service adequacy refinements remain",()=>{const q=read("screens/screen-questions.js");assert.match(q,/inlineServiceAdequacyGuidance/);});
