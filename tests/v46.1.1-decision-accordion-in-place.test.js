"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const s=fs.readFileSync(path.resolve(__dirname,"..","core/events.js"),"utf8");
const fn=s.slice(s.indexOf("  acc:function(b)"),s.indexOf('"decision-focus"'));
test("topic accordion toggles swap only the affected cards, pinning the clicked card's viewport position",()=>{
  assert.match(fn,/outerHTML=decisionWorkspaceCard/);
  assert.match(fn,/window\.scrollTo/);
  assert.doesNotMatch(fn.split("stableRender")[0],/[^e]render\(\)/,"no full render() on the happy path");
});
test("falls back to stableRender when a card is missing",()=>{assert.match(fn,/stableRender\(/);});
