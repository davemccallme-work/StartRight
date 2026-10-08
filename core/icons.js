/* ============================ LUCIDE ICONS (inlined, MIT, offline) ============================
   V44.11 MERGED registry. Base = the original V42 Lucide set (unchanged, 27 glyphs). Added =
   the visual-grammar keys (state-*, doc-*, glyph-*) plus the P1/P2 builders.

   icon() is now PREFIX-AWARE so nothing regresses:
     - Legacy Lucide keys (arrow-*, download, check, circle-help, message-circle, …) keep the
       ORIGINAL behavior: fixed width/height from the size arg, class="lucide". This preserves
       every existing call site, e.g. icon("arrow-right",16).
     - Visual-grammar keys (state-*, doc-*, glyph-*) render FLEXIBLE: viewBox only, NO fixed
       width/height, class="pn-icon", sized by CSS. Required by the review (§12 reflow) so the
       state-header/document icons scale at 200%/400% zoom and inherit currentColor.
   Loaded after config.js so later modules can call icon(). Global ICONS + icon() as before.
   =================================================================================== */
var ICONS={
  compass:'<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  home:'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  gauge:'<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  zap:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  wrench:'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  'circle-help':'<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  'map-pin':'<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  'triangle-alert':'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  'circle-check':'<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  'shield-question':'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',
  copy:'<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  download:'<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>',
  'chevron-right':'<path d="m9 18 6-6-6-6"/>',
  'chevron-down':'<path d="m6 9 6 6 6-6"/>',
  'chevron-up':'<path d="m18 15-6-6-6 6"/>',
  'arrow-right':'<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  'arrow-left':'<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  sparkles:'<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
  'message-circle':'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  'hard-hat':'<path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M14 6a6 6 0 0 1 6 6v3"/><path d="M4 15v-3a6 6 0 0 1 6-6"/><rect x="2" y="15" width="20" height="4" rx="1"/>',
  building:'<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/>',
  'file-text':'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  'book-open':'<path d="M2.5 5.5A2.5 2.5 0 0 1 5 3h5a2 2 0 0 1 2 2v15a2.5 2.5 0 0 0-2.5-2.5H2.5z"/><path d="M21.5 5.5A2.5 2.5 0 0 0 19 3h-5a2 2 0 0 0-2 2v15a2.5 2.5 0 0 1 2.5-2.5h7z"/>'
};

/* ---- V44.11 VISUAL-GRAMMAR ADDITIONS (additive; base glyphs above are untouched) ---- */
/* Seven P0 state icons. Keys match screen-shared.js GUIDANCE_STATES[*].icon exactly.
   PG&E marker (state-utility) is a location pin — NO checkmark (involvement, not approval). */
Object.assign(ICONS, {
  'state-known':'<path d="M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 3v-3H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/><path d="M8 9.5h8M8 12.5h5"/>',
  'state-interpretation':'<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/><path d="M8 10.5h5M10.5 8v5"/>',
  'state-confirmation':'<circle cx="12" cy="12" r="9"/><path d="M9.4 9.2a2.6 2.6 0 1 1 3.7 2.5c-.9.5-1.6 1-1.6 2.1"/><path d="M11.5 16.6h.01"/>',
  'state-possible':'<path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v4h4"/><path d="M9.7 12.1a1.8 1.8 0 1 1 2.6 1.7c-.6.35-1.1.7-1.1 1.5"/><path d="M11.2 17.4h.01"/>',
  'state-delay':'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/><path d="M12 4.2h.01"/>',
  'state-next-action':'<path d="M4 12h14"/><path d="M12.5 6.5 18 12l-5.5 5.5"/>',
  'state-utility':'<path d="M12 21s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10Z"/><circle cx="12" cy="11" r="2.4"/>'
});
/* P3 document-family icons — each renders next to a visible document name + conditional heading. */
Object.assign(ICONS, {
  'doc-load-sheet':'<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><path d="M3.5 9h17M9 4.5v15"/><path d="M14.5 11.5l-2 3h2l-2 3"/>',
  'doc-site-plan':'<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 14h6v6M14 4v6h6"/><path d="M7 7.5h3v3H7z"/>',
  'doc-floor-plan':'<rect x="3.5" y="4.5" width="17" height="15" rx="1"/><path d="M11 4.5v7M11 11.5H3.5M11 11.5h4M15 11.5v8"/><path d="M11 8.2v0M17.5 11.5v3"/>',
  'doc-exterior':'<path d="M5 20V9l7-4 7 4v11"/><path d="M5 20h14"/><rect x="9" y="13" width="2.4" height="2.4"/><rect x="12.6" y="13" width="2.4" height="2.4"/>',
  'doc-address':'<path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v4h4"/><path d="M12 11.2c1.7 0 3 1.3 3 3 0 2-3 4.3-3 4.3s-3-2.3-3-4.3c0-1.7 1.3-3 3-3Z"/><circle cx="12" cy="14.2" r=".9"/>',
  'doc-service-photos':'<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="3.2"/>',
  'doc-panel-cut-sheet':'<rect x="4" y="3.5" width="9" height="17" rx="1"/><path d="M6.2 6.5h4.6M6.2 9h4.6M6.2 11.5h4.6"/><path d="M14.5 8h5.5v12h-7v-2"/><path d="M16 11.5h3M16 14h3"/>',
  'doc-single-line':'<circle cx="6" cy="6" r="2"/><circle cx="18" cy="12" r="2"/><circle cx="7" cy="18" r="2"/><path d="M7.6 7.4 16.4 11M16.6 13.4 8.6 16.7M6 8v8"/>',
  'doc-civil-plans':'<path d="M6 5.5h11a2.5 2.5 0 0 1 0 5H8"/><path d="M6 5.5a2.5 2.5 0 0 0 0 5"/><path d="M8 10.5v6.5a2.5 2.5 0 0 0 2.5 2.5H18a2.5 2.5 0 0 1-2.5-2.5V10.5"/><path d="M10.5 14h4"/>',
  'doc-easement':'<rect x="4" y="4.5" width="16" height="15" rx="1" stroke-dasharray="2.6 2.2"/><path d="M4 12h6l2-3 2 6 2-3h4" stroke-dasharray="0"/>'
});
/* P1/P2 relationship glyphs (used by the builders below). */
Object.assign(ICONS, {
  'glyph-home':'<path d="M4 11 12 5l8 6"/><path d="M6 10v9h12v-9"/><rect x="10" y="13" width="4" height="6"/>',
  'glyph-adu':'<path d="M6 13 12 9l6 4"/><path d="M8 12.5V19h8v-6.5"/><rect x="11" y="15" width="2.6" height="4"/>',
  'glyph-meter':'<rect x="6.5" y="4.5" width="11" height="13" rx="1.5"/><circle cx="12" cy="10" r="3.2"/><path d="M12 10l1.8-1.4"/><path d="M9 20h6"/>',
  'glyph-service':'<path d="M3 6h4l3 12"/><path d="M14 6h7"/><path d="M17.5 6v12"/><path d="M10 12h7"/>',
  'glyph-grid':'<path d="M12 3v18"/><path d="M7 8h10M6.5 12h11"/><path d="M8 21 12 6l4 15"/>',
  'glyph-arrow-right':'<path d="M4 12h15"/><path d="M13 6l6 6-6 6"/>',
  'glyph-question':'<circle cx="12" cy="12" r="9"/><path d="M9.4 9.2a2.6 2.6 0 1 1 3.7 2.5c-.9.5-1.6 1-1.6 2.1"/><path d="M11.5 16.6h.01"/>'
});

/* ---- MERGED icon(): prefix-aware, backward compatible ------------------------------- */
/* Legacy signature preserved: icon(name, size, extra). Visual-grammar keys ignore `size`
   and render flexible (CSS sizes them). esc() is provided by the build; a tiny fallback is
   defined only if it is somehow absent so shared modules that call esc() never break. */
if (typeof esc !== 'function') {
  var esc = function (s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); };
}
function icon(name, size, extra){
  var p = ICONS[name] || '';
  var isVG = /^(state|doc|glyph)-/.test(name);
  if (isVG) {
    /* Flexible: viewBox only, no width/height, class pn-icon (+ optional extra). */
    var vgcls = 'pn-icon' + (extra ? (' ' + extra) : '');
    return '<svg class="'+vgcls+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" '+
           'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" '+
           'aria-hidden="true" focusable="false">'+p+'</svg>';
  }
  /* Legacy Lucide: fixed pixel size, class lucide (unchanged from V42). */
  size = size || 18;
  var cls = 'lucide' + (extra ? (' ' + extra) : '');
  return '<svg class="'+cls+'" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" '+
         'stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" '+
         'aria-hidden="true">'+p+'</svg>';
}

/* ---- P1 builder — Meter vs. Service relationship strip (relationship only) ---------- */
function meterServiceVisual(){
  var node=function(glyph,label){
    return '<li class="msv__node"><span class="msv__icon" aria-hidden="true">'+icon(glyph)+'</span>'+
           '<span class="msv__label">'+esc(label)+'</span></li>';
  };
  var arrow='<li class="msv__arrow" aria-hidden="true">'+icon('glyph-arrow-right')+'</li>';
  return '<ol class="meter-service-visual" aria-label="How the property connects to the grid">'+
           node('glyph-home','Property')+arrow+node('glyph-meter','Meter')+arrow+
           node('glyph-service','Service connection')+arrow+node('glyph-grid','PG&E system')+
         '</ol>';
}
/* ---- P2 builder — ADU type illustration (same scale/viewpoint; relationship only) --- */
function aduTypeIllustration(kind){
  var svgOpen='<svg class="adu-illus" viewBox="0 0 64 40" fill="none" stroke="currentColor" '+
              'stroke-width="1.6" stroke-linejoin="round" aria-hidden="true" focusable="false">';
  var home='<path d="M8 24 20 15l12 9"/><path d="M11 22v11h18V22"/><rect x="17" y="27" width="6" height="6"/>';
  var parts={detached:'',attached:'',junior:'',unsure:''};
  parts.detached=home+'<path d="M40 27 48 21l8 6"/><path d="M42 26v8h12v-8"/><rect x="46.5" y="29" width="3" height="5"/>';
  parts.attached=home+'<path d="M29 24 40 24"/><path d="M29 24 36 19l6 5"/><path d="M31 23.5v10h10v-10"/><rect x="34.5" y="28" width="3" height="5.5"/>';
  parts.junior=home+'<rect x="21.5" y="24.5" width="6.5" height="8.5" stroke-dasharray="2 1.6"/>';
  parts.unsure=home+'<circle cx="46" cy="24" r="7" stroke-dasharray="2.4 2"/><path d="M43.9 22.1a2.1 2.1 0 1 1 3 2c-.7.4-1.3.8-1.3 1.7"/><path d="M45.5 28.2h.01"/>';
  return svgOpen+(parts[kind]||parts.unsure)+'</svg>';
}

/* ---- Export (no-op when inlined by build.js) --------------------------------------- */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ICONS: ICONS, icon: icon, esc: esc,
    meterServiceVisual: meterServiceVisual, aduTypeIllustration: aduTypeIllustration };
}

;
