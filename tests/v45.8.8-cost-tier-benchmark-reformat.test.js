"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const R=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(R,f),"utf8");
// 2026-10-05: the external-benchmarks card concatenated Source and Quality into one run-on dd
// ("SOURCE — QUALITY"), whose own descriptive text (e.g. "Bay Area contractor listing") routinely
// repeated the same geography already shown one row up in Where/when — confirmed live across all six
// benchmark cards. Scope shared that same <dl> as a third, equally-weighted row despite being the
// most load-bearing fact. Scope is promoted to its own leading line; Source and Quality are split
// back into two separate, clearly labeled rows.
test("benchmark card promotes Scope to its own line and splits Source/Quality into separate dl rows instead of one concatenated sentence",()=>{
  const s=read("screens/screen-cost-tiers.js");
  assert.match(s,/<p class="cost-tier-card__scope">'\+esc\(b\.scope\)\+'<\/p>/);
  assert.match(s,/<div><dt>Source<\/dt><dd>'\+esc\(b\.source\)\+'<\/dd><\/div>/);
  assert.match(s,/<div><dt>Quality<\/dt><dd>'\+esc\(b\.quality\)\+'<\/dd><\/div>/);
  assert.doesNotMatch(s,/esc\(b\.source\)\+' \\u2014 '\+esc\(b\.quality\)/);
  assert.doesNotMatch(s,/<dt>Source &amp;/);
});
// 2026-10-05: the fallback figure text ("Calculated from current inputs — no single fee") nearly
// duplicated the Permit-fees benchmark's own Scope text ("Calculated from the current municipal
// schedule — no single universal electrical-upgrade fee") — a code-owned UI label, not governed
// benchmark data, so safe to tighten without touching data.js's authored content.
test("the no-figure fallback label no longer echoes the permit-fee benchmark's own scope wording",()=>{
  const s=read("screens/screen-cost-tiers.js");
  assert.doesNotMatch(s,/Calculated from current inputs/);
  assert.match(s,/Set by local schedule/);
});
// 2026-10-05: three separate patch layers had accumulated on the same .cost-tier-card__head/
// .cost-tier-card__meta selectors over time (box-sizing/overflow fixes bolted on after the original
// block instead of folded into it) — consolidated into one definition near .cost-tier-list, with the
// later patch blocks' selectors removed rather than left as a redundant fourth layer.
test("the three scattered cost-tier-card CSS patch layers are consolidated into one definition, not left as duplicate layers",()=>{
  const c=read("components.v4439-overrides.css");
  const headRuleCount=(c.match(/\.cost-tier-card__head\{ display:grid/g)||[]).length;
  assert.equal(headRuleCount,1,"expected exactly one .cost-tier-card__head{display:grid...} rule after consolidation");
  assert.doesNotMatch(c,/V44\.40\.6 VIEWPORT CARD BROWSER[\s\S]{0,40}Labor-rate figures must wrap/);
  assert.match(c,/\.cost-tier-card__scope\{ margin:6px 0 0; font-size:\.86rem/);
});
