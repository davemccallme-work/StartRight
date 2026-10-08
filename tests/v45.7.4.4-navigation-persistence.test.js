"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const R=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(R,f),"utf8");
// Retired 2026-10-03: the RELEASE_VERSION='V45.7.4.4' pin is superseded now the build is on V45.7.5.9.9.
test("Final Guidance navigation is explicitly preserved",()=>{const s=read("core/v45.7-navigation-scenario-guide.js");assert.match(s,/mainNav\.hidden=false/);assert.match(s,/mainNav\.removeAttribute\('aria-hidden'\)/);assert.match(s,/classList\.remove\('guidance-workspace-frame--primary-only'\)/);assert.doesNotMatch(s,/mainNav\.hidden=true/);});
test("CSS overrides earlier hidden rail rule",()=>{const c=read("components.v45.7.3.css");assert.match(c,/V45\.7\.4\.4 preserve Final Guidance navigation rail/);assert.match(c,/guidance-workspace-frame--primary-only>\.summary-section-nav\{display:block!important/);});
test("rail has stable desktop width and full-region scrolling",()=>{const c=read("components.v45.7.3.css");assert.match(c,/grid-template-columns:minmax\(260px,300px\) minmax\(0,1fr\)/);assert.match(c,/overflow-y:auto!important/);assert.match(c,/scrollbar-gutter:stable!important/);});
test("rail labels wrap only at word boundaries",()=>{const c=read("components.v45.7.3.css");assert.match(c,/word-break:normal!important/);assert.match(c,/overflow-wrap:normal!important/);assert.match(c,/hyphens:none!important/);});
test("Scenario Guide modal remains available",()=>{const s=read("core/v45.7-navigation-scenario-guide.js");assert.match(s,/showModal/);assert.match(s,/View scenario guide/);assert.match(s,/scenario-guide-shell--final/);});
test("question focus fix remains active",()=>{const s=read("core/v45.7-navigation-scenario-guide.js");assert.match(s,/720/);assert.match(s,/question-card-slot h1/);});
