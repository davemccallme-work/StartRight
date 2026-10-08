/* ============================ screen-cost-tiers.js — V44.40 ============================
   Renders governed Tier-1 / Tier-2 cost CONTEXT for panel projects (which have no SB 1210 facility
   record). Data comes exclusively from data.js: costContextFor(), COST_TIER2_BENCHMARKS,
   COST_ENGINEERING_ADVANCE, COST_DISTRIBUTION_CALNEXT, COST_DISCLAIMER, COST_BENCHMARK_DISCLAIMER,
   fmtUSD, fmtUSDRange. No numbers are authored here; nothing is summed.

   WIRE-IN: call panelCostTiersHtml(S.projectType) inside step4()'s cost section
   (e.g., immediately after costTimelineUncertaintyHtml()). Add this file to build.js JS[] before
   screens/screen-summary.js. Renders '' for any non-cost-contexted project type.
   ================================================================================ */
function costBenchmarkFigure(b){
  if(b.illustrative_pair_usd){
    return '<span class="cost-tier__figure">'+esc(fmtUSD(b.illustrative_pair_usd[0]))+' vs '+esc(fmtUSD(b.illustrative_pair_usd[1]))+'</span>';
  }
  if(b.rate_usd_per_hour){
    var r=b.rate_usd_per_hour;
    return '<span class="cost-tier__figure">'+esc(fmtUSD(r.base))+'/hr base \u00b7 '+esc(fmtUSD(r.straight_time_total))+'/hr straight-time</span>';
  }
  if(b.range_usd){
    return '<span class="cost-tier__figure">'+esc(fmtUSDRange(b.range_usd,b.range_open_ended))+'</span>';
  }
  return '<span class="cost-tier__figure cost-tier__figure--none">Set by local schedule \u2014 not a fixed fee</span>';
}
/* 2026-10-05: scope used to share a <dl> row with Where/when and Source+quality, and Source and
   quality were concatenated into one run-on dd ("SOURCE \u2014 QUALITY") whose own descriptive text
   (e.g. "Bay Area contractor listing") routinely repeated the SAME geography already stated one row
   up in Where/when \u2014 confirmed live across all six benchmark cards. Scope is promoted to its own
   leading line (it's the most load-bearing "what does/doesn't this cover" fact, not one of three
   equally-weighted rows), and Source/Quality are split into two separate rows instead of one
   stitched-together sentence \u2014 same underlying facts, no re-authoring of the governed benchmark
   data itself, just not forcing two different kinds of information through the same sentence. */
function costBenchmarkCard(b){
  return '<article class="cost-tier-card" aria-label="'+esc(b.label)+'">'
    +'<div class="cost-tier-card__head"><h4>'+esc(b.label)+'</h4>'+costBenchmarkFigure(b)+'</div>'
    +'<p class="cost-tier-card__scope">'+esc(b.scope)+'</p>'
    +'<dl class="cost-tier-card__meta">'
      +'<div><dt>Where / when</dt><dd>'+esc(b.geography)+' \u00b7 '+esc(b.date)+'</dd></div>'
      +'<div><dt>Source</dt><dd>'+esc(b.source)+'</dd></div>'
      +'<div><dt>Quality</dt><dd>'+esc(b.quality)+'</dd></div>'
    +'</dl></article>';
}
function panelCostTiersHtml(projectType){
  if(typeof costContextFor!=="function")return '';
  var c=costContextFor(projectType);
  if(!c)return '';
  var t1=c.tier1,t2=c.tier2;
  /* Tier 1 — PG&E-specific, shown first. */
  var advance=t1.engineering_advance;
  var dist=t1.distribution;
  var tier1='<section class="cost-tier cost-tier--one" aria-labelledby="cost-tier1-h">'
    +'<div class="eyebrow">PG&E-specific context</div>'
    +'<h3 id="cost-tier1-h">What PG&E-regulated evidence shows</h3>'
    +'<div class="cost-tier__item"><h4>'+esc(advance.label)+'</h4>'
      +'<p><strong>May apply:</strong> around '+esc(fmtUSD(advance.may_apply_usd))+'. '+esc(advance.note)+'</p>'
      +'<p class="muted small">'+esc(advance.scope)+' \u00b7 '+esc(advance.source)+'.</p></div>'
    +'<div class="cost-tier__item"><h4>'+esc(dist.label)+'</h4>'
      +'<ul class="disc">'+dist.points.map(function(p){return '<li>'+esc(p)+'</li>';}).join('')+'</ul>'
      +'<p class="muted small">'+esc(dist.scope)+' \u00b7 '+esc(dist.source)+'.</p></div>'
    +'<div class="note"><span>'+esc(t1.disclaimer)+'</span></div>'
    +'</section>';
  /* Tier 2 — external benchmarks, clearly separated + labeled. */
  var tier2='<section class="cost-tier cost-tier--two" aria-labelledby="cost-tier2-h">'
    +'<div class="eyebrow">External benchmarks</div>'
    +'<h3 id="cost-tier2-h">For rough magnitude only</h3>'
    +'<div class="note cost-tier__benchmark-boundary"><span><strong>'+esc(t2.disclaimer)+'</strong></span></div>'
    +'<div class="cost-tier-list">'+t2.benchmarks.map(costBenchmarkCard).join('')+'</div>'
    +'<p class="muted small">These are layered, separate cost types \u2014 they are not added together into a project estimate. Confirm what actually applies with a licensed electrician, your city or county, and PG&E through formal review.</p>'
    +'</section>';
  return '<section class="cardbox cost-tiers" aria-labelledby="cost-tiers-h">'
    +'<div class="eyebrow">What a panel project can cost</div>'
    +'<h2 id="cost-tiers-h">Cost evidence, in two layers</h2>'
    +'<p class="muted">A panel upgrade has no single regulated price, so we separate <strong>PG&E-specific evidence</strong> from <strong>external benchmarks</strong>.</p>'
    +tier1+tier2
    +'</section>';
}

;
