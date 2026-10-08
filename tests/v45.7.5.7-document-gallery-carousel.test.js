"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const R=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(R,f),"utf8");
// Retired 2026-10-03: the RELEASE_VERSION='V45.7.5.7' pin is superseded now the build is on V45.7.5.9.9.
test("document gallery uses the locked carousel controls",()=>{const s=read("components/fast-facts-document-gallery.js");assert.match(s,/visual-guidance-carousel-controls fast-facts-doc-gallery__controls/);assert.match(s,/data-document-gallery-step=\"previous\"/);assert.match(s,/data-document-gallery-step=\"next\"/);});
test("each governed document example is a discrete carousel item",()=>{const s=read("components/fast-facts-document-gallery.js");assert.match(s,/data-document-gallery-item=\"true\"/);assert.match(s,/DOC-002/);assert.match(s,/DOC-003-ELEVATION/);assert.match(s,/DGM-EQ-008-SERVICE-SPAN/);});
test("gallery reveals one full card per step",()=>{const s=read("components/fast-facts-document-gallery.js");assert.match(s,/function reveal\(i,behavior\)/);assert.match(s,/viewport\.scrollLeft=target/);assert.match(s,/active\(\)\+delta/);});
test("gallery identifies active document and position",()=>{const s=read("components/fast-facts-document-gallery.js");assert.match(s,/figcaption strong/);assert.match(s,/\(i\+1\)\+' of '\+items\.length/);});
test("gallery supports arrow home and end keys",()=>{const s=read("components/fast-facts-document-gallery.js");for(const k of ['ArrowLeft','ArrowRight','Home','End'])assert.match(s,new RegExp(k));});
test("gallery binds through dynamic enhancement",()=>assert.match(read("core/v45.7-navigation-scenario-guide.js"),/FastFactsDocumentGallery\.bind\(document\)/));
test("desktop cards snap and preserve readable width",()=>{const c=read("components.v45.7.3.css");assert.match(c,/fast-facts-doc-gallery__viewport\{[^}]*scroll-snap-type:x mandatory/);assert.match(c,/flex:0 0 clamp\(300px/);assert.match(c,/scroll-snap-stop:always/);});
// Retired 2026-10-05: this gallery used to hide its own Previous/Next row entirely below 760px
// (display:none!important) in favor of an undiscoverable native swipe, with no visible way to page
// through documents on a phone. core/v45.7.5.9.4-scenario-guide-runtime.js now styles this carousel's
// controls (shared .visual-guidance-carousel-controls/-button classes) the same hover-reveal way
// everywhere it renders, forced permanently visible on touch (no hover to reveal with) rather than
// hidden — see tests/v45.7.5.9.4-* / the scenario-guide-runtime.js comments for the current contract.
test("document gallery controls are never hidden by width — hover-reveal everywhere, forced visible on touch",()=>{const s=read("core/v45.7.5.9.4-scenario-guide-runtime.js");assert.doesNotMatch(s,/fast-facts-doc-gallery__controls\{display:none/);assert.match(s,/hover:none.*pointer:coarse.*visual-guidance-carousel-button\{opacity:1/);});
test("approved photo table style remains locked",()=>{const c=read("components.v45.7.3.css"),s=read("components/visual-guidance-card.js");assert.match(c,/selected-column reveal correction/);assert.match(s,/function reveal\(i,behavior\)/);});
