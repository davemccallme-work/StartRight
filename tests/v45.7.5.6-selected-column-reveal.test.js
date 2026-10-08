"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const R=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(R,f),"utf8");
// Retired 2026-10-03: the RELEASE_VERSION='V45.7.5.6' pin is superseded now the build is on V45.7.5.9.9.
test("carousel has a single exact reveal function",()=>{const s=read("components/visual-guidance-card.js");assert.match(s,/function reveal\(i,behavior\)/);assert.match(s,/target=p\[i\]\|\|0/);assert.match(s,/wrap\.scrollLeft=target/);});
// 2026-10-05: requestAnimationFrame's callback also calls sizeColumns() (the wrap now fills its
// section's real width instead of a fixed px, so the data column is sized from a fresh measurement
// right before the initial reveal) ahead of reveal(0,'auto') — the column-0 reveal itself is unchanged.
test("initial binding explicitly reveals the first governed column",()=>{const s=read("components/visual-guidance-card.js");assert.match(s,/requestAnimationFrame\(function\(\)\{sizeColumns\(\);reveal\(0,'auto'\);\}\)/);});
test("previous next home and end share exact reveal behavior",()=>{const s=read("components/visual-guidance-card.js");assert.match(s,/reveal\(i,'smooth'\)/);assert.match(s,/reveal\(0,'smooth'\)/);assert.match(s,/reveal\(heads\.length-1,'smooth'\)/);});
// 2026-10-04: offsetLeft is relative to the nearest POSITIONED ancestor, which inside the scenario
// guide dialog (position:fixed) is the dialog itself, not the wrap that actually scrolls — so the
// old offsetLeft-based geometry shifted by the wrap's own scrollLeft and was self-referentially
// wrong there. Replaced with a getBoundingClientRect()-based offset relative to the wrap's own
// rect (scroll-position- and ancestor-position-independent); still deducts the sticky topic width.
test("scroll geometry deducts the sticky topic width using scroll-container-relative offsets, not offsetLeft",()=>{const s=read("components/visual-guidance-card.js");assert.match(s,/left=topicWidth\(\)/);assert.match(s,/h\.getBoundingClientRect\(\)\.left-wrapLeft\+scrollLeft/);assert.doesNotMatch(s,/h\.offsetLeft-left/);});
// Retired 2026-10-05: scroll-padding/margin-inline-start:220px assumed the OLD fixed 385px label
// column (220 was never even that value's own width — a separate, already-stale guess); reveal()'s
// getBoundingClientRect()-based points() doesn't lean on scroll-snap reservation at all, so there's
// nothing left for this to reserve space for. See core/v45.7.5.9.4-scenario-guide-runtime.js's own
// comment on why scroll-snap was dropped entirely in favor of exact JS-computed scroll targets.
test("no stale scroll-snap reservation for a label-column width that no longer applies",()=>{const c=read("components.v45.7.3.css");assert.doesNotMatch(c,/scroll-padding-inline-start/);assert.doesNotMatch(c,/scroll-margin-inline-start/);});
test("carousel controls exist and the table/gallery carousel styling is global, not dialog-only",()=>{const s=read("components/visual-guidance-card.js"),rt=read("core/v45.7.5.9.4-scenario-guide-runtime.js");assert.match(s,/data-visual-column-step=\"next\"/);assert.doesNotMatch(rt,/#scenario-guide-dialog \.visual-guidance-carousel-shell\{/);assert.match(rt,/'\.visual-guidance-carousel-shell\{position:relative!important\}'/);});
test("service adequacy placement remains intact",()=>assert.match(read("screens/screen-questions.js"),/inlineServiceAdequacyGuidance/));
