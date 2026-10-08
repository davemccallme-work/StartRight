"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const R=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(R,f),"utf8");
// 2026-10-05: settle() (core/v45.8.7-summary-accordions.js) was the ONLY code path that ever cleared
// the inline height:0px/overflow:hidden left on an accordion panel mid-animation, and it ran ONLY
// from animation.onfinish. Confirmed live: a backgrounded automation tab starved requestAnimationFrame
// entirely, so the WAAPI animation reached playState "finished" without ever dispatching onfinish,
// leaving the panel permanently clipped at 0 height — "cut off at the bottom when expanded" for
// both "Your living preparation plan" and "Other conditional documents" (both wrapped by this same
// shared accordion mechanism, used by both screen-summary.js and screen-understanding.js). A
// fallback timer guarantees settle() always eventually runs even if onfinish never dispatches.
test("accordion open/close have a fallback timer so settle() always runs even if animation.onfinish never dispatches",()=>{
  const s=read("core/v45.8.7-summary-accordions.js");
  assert.match(s,/function clearFallback\(\)\{if\(fallbackTimer\)\{clearTimeout\(fallbackTimer\);fallbackTimer=null;\}\}/);
  assert.match(s,/animation\.onfinish=function\(\)\{settle\(true\);\};\s*\n\s*fallbackTimer=setTimeout\(function\(\)\{settle\(true\);\},400\);/);
  assert.match(s,/animation\.onfinish=function\(\)\{settle\(false\);\};\s*\n\s*fallbackTimer=setTimeout\(function\(\)\{settle\(false\);\},360\);/);
});
// 2026-10-05 (follow-up): the fallback timer alone wasn't enough — confirmed live that when it
// fires because onfinish never dispatched, the WAAPI Animation object is often still playState
// "running" (the same rAF starvation that broke onfinish also stalls the animation's own effective
// playback), and a still-running animation's current interpolated value keeps winning the cascade
// (the "animations" origin outranks inline/author styles) regardless of clearing panel.style.height.
// settle() must cancel() the animation, not just null out the JS reference, or the panel stays
// visibly pinned near whatever height the animation was stuck at.
test("settle() cancels the underlying animation, not just clears the inline style — a still-running animation's effect otherwise keeps overriding the panel's height",()=>{
  const s=read("core/v45.8.7-summary-accordions.js");
  assert.match(s,/function settle\(openState\)\{clearFallback\(\);if\(animation\)\{animation\.cancel\(\);\}details\.open=openState;/);
});
test("a new open/close clears any pending fallback timer so a stale one can't fire after a newer animation takes over",()=>{
  const s=read("core/v45.8.7-summary-accordions.js");
  const openIdx=s.indexOf("ctrl.open=function()");
  const openBody=s.slice(openIdx,s.indexOf("ctrl.close=function()"));
  assert.match(openBody,/if\(animation\)animation\.cancel\(\);\s*\n\s*clearFallback\(\);/);
});
// 2026-10-05: .pn-label hardcoded color:var(--muted) instead of inheriting the bubble's own
// color:#fff — --muted got redefined by the later PG&E-brand :root block (components.css) to
// #666666 while --pg (the user bubble's background) resolves to a medium blue, so "You" rendered as
// low-contrast dark grey on blue. .pn-label is used only inside .pn-msg.user .pn-bubble
// (core/advisor.js), so a bubble-scoped light tint replaces the unrelated --muted token.
test("advisor chat 'You' label no longer uses the unrelated --muted token and gets a readable light tint scoped to the user bubble",()=>{
  const c=read("components.css");
  assert.match(c,/\.pn-label\{font-size:12px;font-weight:800;margin-bottom:4px\}/);
  assert.doesNotMatch(c,/\.pn-label\{[^}]*color:var\(--muted\)/);
  assert.match(c,/\.pn-msg\.user \.pn-label\{color:rgba\(255,255,255,\.85\)\}/);
});
// 2026-10-05: three divergent definitions of the (i) info-badge cue existed — components.css had its
// own 20px circle (dead weight, always overridden by the later-loaded components.v4439-overrides.css
// per build.js's load order, but left in the source to silently diverge), the live 16px circle in
// components.v4439-overrides.css, and a .context-definitions__terms override that changed only
// flex-basis to 20px while width/height stayed 16px — rendering a squashed 20x16 ellipse there
// instead of a circle. Standardized to one 18px circle everywhere.
test("term-button__cue is standardized to one 18px circle, not divergent per-context sizes",()=>{
  const c=read("components.css"),o=read("components.v4439-overrides.css");
  assert.doesNotMatch(c,/\.term-button__cue\{display:inline-grid;place-items:center;width:20px/);
  assert.match(o,/\.term-button__cue\{\s*\n\s*display:inline-grid;\s*\n\s*place-items:center;\s*\n\s*flex:0 0 18px;\s*\n\s*width:18px;\s*\n\s*height:18px;/);
  assert.match(o,/\.context-definitions__terms \.term-button__cue\{flex:0 0 18px!important;width:18px!important;height:18px!important;align-self:center!important;\}/);
  assert.doesNotMatch(o,/\.context-definitions__terms \.term-button__cue\{flex:0 0 20px/);
});
// 2026-10-05 (follow-up): confirmed live the highlight never appeared inside
// .context-definitions__terms — a same-specificity, later-in-file resting background:var(--surface)
// rule won that property fight. background needs !important to reliably win in every context;
// border-radius deliberately does NOT, so that context's own more-rounded 999px/10px pill shape
// keeps winning on hover instead of being forced down to this rule's plainer 6px.
test("term-button hover/focus adds a rounded highlight box instead of just a solid underline, and the background wins in every context including the pill-shaped one",()=>{
  const o=read("components.v4439-overrides.css");
  assert.match(o,/\.term-button:hover,\.term-button:focus-visible,\.term-button\.definition-is-open\{\s*\n\s*border-bottom-style:solid;\s*\n\s*background:var\(--tint\)!important;\s*\n\s*border-radius:6px;/);
});
