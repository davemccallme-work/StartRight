/* V45.7.5.9.4 self-contained Scenario Guide cleanup.
   Load after the existing Scenario Guide runtime. */
(function(root){
  'use strict';
  var STYLE_ID='v45-7-5-9-4-scenario-guide-style';
  var CSS=[
    '#ff-section-scenario-guide,[data-quick-guidance-disclosure],.quick-guidance-disclosure{display:none!important}',
    /* 2026-10-04: components.visual-examples.css's .ff-section{display:grid} (an author rule) beats
       the browser's own [hidden]{display:none} UA-stylesheet rule regardless of specificity — UA
       styles are always the lowest-priority origin. suppressInlineGuide() setting the `hidden`
       attribute on every .ff-section (not just the scenario-guide one, see that function's own
       comment) needs this explicit override to actually take visual effect. */
    '.ff-section[hidden]{display:none!important}',
    'body.scenario-guide-open{overflow:hidden!important}',
    '#scenario-guide-dialog.scenario-guide-dialog--canonical,dialog[data-scenario-guide-dialog].scenario-guide-dialog--canonical{position:fixed!important;inset:3vh 2.5vw!important;width:95vw!important;max-width:none!important;height:94vh!important;max-height:94vh!important;margin:0!important;padding:0!important;border:0!important;border-radius:22px!important;background:#fff!important;color:#171717!important;box-shadow:0 24px 80px rgba(0,0,0,.34)!important;overflow:hidden!important}',
    '#scenario-guide-dialog::backdrop{background:rgba(18,34,43,.78)!important;backdrop-filter:blur(2px)}',
    /* 2026-10-04: the close button sits BELOW the eyebrow/title/intro text in normal block flow (no
       flex rule ever positioned it beside that text), so the header's real height depends on how
       many lines that intro paragraph wraps to — it is NOT a fixed 132px. [data-scenario-guide-body]
       used to be pinned to `calc(94vh - 218px)`, a guessed constant assuming header+footer==218px
       exactly; whenever the header actually rendered taller (confirmed live: 187px, not 132px), the
       footer got pushed below the dialog's own `overflow:hidden` bottom edge, clipping the "Close
       guide" button to an unreadable sliver. Making .scenario-guide-dialog__panel a column flex
       container and letting the body take `flex:1 1 auto` removes the guess entirely — body always
       fills exactly whatever space the header and footer's own real heights leave behind, so this
       can never clip again regardless of how tall either one renders. */
    '#scenario-guide-dialog .scenario-guide-dialog__panel{position:relative!important;display:flex!important;flex-direction:column!important;height:100%!important;min-height:0!important}',
    /* 2026-10-04: the header used to stack eyebrow+title+a persistent description paragraph in
       normal block flow above the close button (the layout bug fixed earlier this session, where
       that stacking made the header's real height unpredictable and clipped the footer). Making the
       header itself a flex ROW — heading block left, close button pinned top-right — is what keeps
       it compact at a SINGLE title line's height regardless of anything else. The long description
       ("Use the navigation to review...") moves out of the header entirely into its own banner-style
       strip (.scenario-guide-dialog__intro, a sibling flex child of the panel, between header and
       body) with its own small dismiss control — read once, dismiss it, and it stays dismissed for
       the rest of this page load (the DOM node persists across re-opens; nothing is reset). This is
       what "a banner, not a persistent sub-header" means structurally: hiding it just removes one
       flex child, and the column flex layout reclaims its height automatically, no recalculation
       needed anywhere else. */
    /* 2026-10-05: a partial-alpha fill still read as flatly opaque because nothing behind it ever
       varied — blending any tint over the panel's own static white backdrop just produces a
       different-but-still-flat color, not a glass effect. Genuine, perceptible translucency needs
       real content moving behind the bar for the blur to act on. Promoting header/footer to
       position:absolute (anchored to the now position:relative panel) takes them out of the column
       flex flow entirely, so [data-scenario-guide-body] (flex:1 1 auto, the only flex child left
       that reserves space) naturally expands to the panel's FULL height — the reading pane's own
       content now runs the complete height behind both bars instead of stopping short of them, and
       actually scrolls up/down underneath the blur as the user scrolls, which is what makes the
       frosted-glass look real instead of implied. Reading pane keeps generous top/bottom padding
       (below) purely so its OWN text starts fully clear of both bars on first open; nothing else
       about its layout changes.
       2026-10-05 (follow-up): the header is ALWAYS top:0, on every breakpoint — a prior pass tried
       starting it lower on mobile (so the nav row above it wouldn't need clearance), which put the
       nav row above the dialog's own title bar. That reads as broken regardless of how it was
       justified internally — a dialog's header is always the topmost element. Nav gets real
       clearance instead now (see its own rule) so there's no overlap to resolve with positioning
       tricks in the first place. Fill alpha also dropped (.6→.28) — still faint at .6 against the
       reading pane's own content, even though the mechanism itself was working correctly. */
    '#scenario-guide-dialog .scenario-guide-dialog__header{position:absolute!important;top:0!important;left:0!important;right:0!important;z-index:6!important;flex:0 0 auto!important;display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:12px!important;min-height:0!important;padding:11px 20px 8px!important;border-bottom:0!important;background:rgba(199,214,224,.28)!important;backdrop-filter:blur(14px)!important;-webkit-backdrop-filter:blur(14px)!important}',
    '#scenario-guide-dialog .scenario-guide-dialog__heading{min-width:0!important}',
    '#scenario-guide-dialog .scenario-guide-dialog__header .eyebrow{color:#006b94!important;letter-spacing:.1em!important;font-weight:800!important;text-transform:uppercase!important;font-size:.72rem!important}',
    '#scenario-guide-dialog .scenario-guide-dialog__header h2{margin:2px 0 0!important;font-size:1.5rem!important;line-height:1.2!important}',
    '#scenario-guide-dialog [data-scenario-guide-close]{flex:0 0 auto!important;min-width:40px!important;min-height:40px!important;border:1px solid #b8c8d1!important;border-radius:12px!important;background:#fff!important;color:#111!important;font-weight:800!important}',
    /* Now that the header is position:absolute (see above), this banner — still a normal in-flow
       flex child of the panel — would otherwise become the panel's first in-flow box and render
       starting at the very top, directly underneath the header. margin-top clearance (generous, not
       pixel-measured — comfortably clears the header's real rendered height with room to spare) pushes
       the banner down to start right where the header visually ends, so there's never any overlap to
       resolve with z-index or stacking order at all. */
    '#scenario-guide-dialog .scenario-guide-dialog__intro{margin-top:64px!important;flex:0 0 auto!important;display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:10px!important;padding:7px 20px!important;border-bottom:1px solid #d6dde2!important;background:#f4f9fb!important}',
    '#scenario-guide-dialog .scenario-guide-dialog__intro[hidden]{display:none!important}',
    '#scenario-guide-dialog .scenario-guide-dialog__intro p{margin:0!important;color:#4c5a60!important;font-size:.88rem!important;line-height:1.45!important}',
    '#scenario-guide-dialog .scenario-guide-dialog__intro-dismiss{flex:0 0 auto!important;width:26px!important;height:26px!important;min-width:0!important;min-height:0!important;padding:0!important;border:0!important;border-radius:999px!important;background:transparent!important;color:#4c5a60!important;font-size:1rem!important;line-height:1!important;cursor:pointer!important}',
    '#scenario-guide-dialog .scenario-guide-dialog__intro-dismiss:hover{background:rgba(0,0,0,.06)!important}',
    '#scenario-guide-dialog [data-scenario-guide-body]{flex:1 1 auto!important;height:auto!important;min-height:0!important;overflow:hidden!important}',
    '#scenario-guide-dialog .scenario-guide-shell--canonical{display:grid!important;grid-template-columns:minmax(260px,300px) minmax(0,1fr)!important;width:100%!important;height:100%!important;min-height:0!important;background:#fff!important}',
    /* 2026-10-05 (follow-up): the z-index-lift this rule used to use — paint over the header instead
       of clearing it — put the nav row ABOVE the dialog's own title bar on mobile (nav spans the
       header's full width there, not a column beside it like desktop), which reads as the layout
       being broken regardless of the internal justification. Real top/bottom clearance is the
       correct fix (same as the intro banner): the header is always on top, nav always starts right
       below where it ends, full stop, on every breakpoint. The fill itself also moved to the same
       clearly-visible tint as the header/footer (was barely different from white before, which is
       why it didn't read as translucent at all) — same rgba family and blur, so the whole dialog's
       chrome reads as one consistent frosted system.
       2026-10-05 (follow-up 2): that clearance was PADDING, which keeps nav's own box (and the
       native scrollbar that renders along its edge, full height) starting at the very top — still
       behind the header in z-order there, just with its first 64px of empty padding hiding the
       problem rather than solving it. The moment nav's list is tall enough to actually need that
       scrollbar, the scrollbar itself (and any content scrolled up into that padding zone) rendered
       behind the header instead of never reaching it. MARGIN, not padding, shrinks nav's own box
       inward from the header/footer instead of just padding its content — nav's scrollable area (and
       its scrollbar) now never extends into the header/footer's territory at all, nothing to
       hide "behind" them in the first place.
       2026-10-05 (follow-up 3): giving nav that top margin UNCONDITIONALLY double-counted the
       clearance whenever the intro banner is also showing — intro's own margin-top (below) already
       pushes [data-scenario-guide-body] (and nav, its first row/column) down past the header, so nav
       piling its own 64px on top of that left a tall blank gap above it ("a white bar where the nav
       should be"). Nav's top margin now only applies via the sibling rule further below, scoped to
       exactly the case that actually needs it: intro[hidden] — dismissed or never shown — meaning
       body starts at the panel's own top, directly behind the header, with nothing else already
       clearing it. The bottom margin stays unconditional here since nothing above footer ever
       provides equivalent clearance. */
    '#scenario-guide-dialog .scenario-guide-shell__nav{min-width:0!important;margin:0 0 79px!important;padding:20px!important;overflow:auto!important;border-right:1px solid #d6dde2!important;background:rgba(199,214,224,.28)!important;backdrop-filter:blur(14px)!important;-webkit-backdrop-filter:blur(14px)!important;scrollbar-gutter:stable!important}',
    '#scenario-guide-dialog .scenario-guide-dialog__intro[hidden]~[data-scenario-guide-body] .scenario-guide-shell__nav{margin-top:64px!important}',
    '#scenario-guide-dialog .scenario-guide-shell__nav-list{display:grid!important;gap:4px!important;margin:0!important;padding:0!important;list-style:none!important}',
    '#scenario-guide-dialog .scenario-guide-shell__nav-button{width:100%!important;padding:8px 12px!important;border:0!important;border-radius:10px!important;background:transparent!important;color:#171717!important;text-align:left!important;font:inherit!important;font-weight:700!important;line-height:1.25!important;overflow-wrap:normal!important;word-break:normal!important;hyphens:none!important}',
    '#scenario-guide-dialog .scenario-guide-shell__nav-button[aria-current="location"]{background:#dff2f8!important;color:#005b82!important;box-shadow:inset 4px 0 0 #008acb!important}',
    /* 2026-10-04: one level of sub-navigation — each group's own insight-section subtopics (e.g.
       Prepare's "Worth having handy" / "Photos that may help" / "Documents that may be useful
       later"), surfaced by core/v45.7-navigation-scenario-guide.js's collectSubsections(). Indented
       under the parent group button, smaller and lighter-weight so the top-level groups stay the
       primary scan line; reuses the same [data-sg-target]/aria-current contract as the top-level
       buttons, so clicking one needs no new click-handling and the scrollspy highlights whichever
       (group or subtopic) is actually in view. */
    '#scenario-guide-dialog .scenario-guide-shell__nav-sublist{display:grid!important;gap:2px!important;margin:2px 0 6px!important;padding:0 0 0 20px!important;list-style:none!important}',
    '#scenario-guide-dialog .scenario-guide-shell__nav-subbutton{width:100%!important;padding:5px 12px!important;border:0!important;border-radius:8px!important;background:transparent!important;color:#4b5563!important;text-align:left!important;font:inherit!important;font-size:.88rem!important;font-weight:600!important;line-height:1.3!important}',
    '#scenario-guide-dialog .scenario-guide-shell__nav-subbutton:hover{background:#eef1f3!important}',
    '#scenario-guide-dialog .scenario-guide-shell__nav-subbutton[aria-current="location"]{background:#dff2f8!important;color:#005b82!important;font-weight:700!important;box-shadow:inset 3px 0 0 #008acb!important}',
    /* This is the one region that DOES get the genuine scroll-behind-the-glass effect (see the
       header rule's comment) — top/bottom padding is bumped generously (not pixel-measured against
       the header/footer's real heights; both comfortably clear typical rendered sizes with room to
       spare, and reading has plenty of height to give up a bit of it) purely so the reading pane's
       own first/last lines of text are never themselves hidden under a bar — only already-scrolled-
       past content passes behind them, visible-but-blurred, which is the actual effect being asked
       for. */
    '#scenario-guide-dialog .scenario-guide-shell__reading{min-width:0!important;padding:64px 32px 79px!important;overflow:auto!important;background:#fff!important}',
    '#scenario-guide-dialog .scenario-guide-shell__section{max-width:none!important;margin:0 0 38px!important}',
    '#scenario-guide-dialog .scenario-guide-shell__section>h2{margin:0 0 18px!important;font-size:1.8rem!important}',
    /* 2026-10-05: same correction as the header above — background:transparent against an opaque
       white panel is indistinguishable from solid white, so it isn't a translucency effect at all.
       Matches the header's exact fill/blur now, so both ends of the dialog read as the same frosted
       chrome instead of one looking like paint and the other like glass.
       2026-10-05 (follow-up): .6 alpha still read as only faintly translucent against the reading
       pane's own scrolled content — dropped to .28 (more than 50% lower) so more of whatever's
       passing underneath actually shows through the blur instead of being mostly masked by the tint.
       2026-10-05 (follow-up 2): still too faint at .28 — halved again to .14 (2x more translucent).
       min-height/padding also trimmed by about a third now that there's less reason for the bar to
       be as tall as it was; 64px keeps the "Close guide" button's own ~40px plus trimmed padding from
       ever feeling cramped. */
    '#scenario-guide-dialog .scenario-guide-dialog__footer{position:absolute!important;bottom:0!important;left:0!important;right:0!important;z-index:6!important;flex:0 0 auto!important;min-height:64px!important;padding:12px 24px!important;border-top:0!important;background:rgba(199,214,224,.14)!important;backdrop-filter:blur(14px)!important;-webkit-backdrop-filter:blur(14px)!important;display:flex!important;justify-content:flex-end!important;align-items:center!important}',
    '#scenario-guide-dialog .scenario-guide-dialog__footer [data-scenario-guide-close]{background:#008acb!important;color:#fff!important;border-color:#008acb!important;padding:0 22px!important}',
    /* 2026-10-05: the mobile nav row originally reserved up to 28vh (120px floor) for the topic list
       before any reading content appeared below it. A first pass cut that back to 18vh/80px, then a
       later pass tried to dodge the newly-overlaid header by starting the header BELOW the nav row
       instead of giving nav its own clearance — which put the nav row above the dialog's own title
       bar, reading as broken. The header is always on top now (see its own rule), so the nav row
       needs enough height to hold BOTH the header's clearance and still show real nav content below
       it — 24vh/150px floor is larger than the very first cut-down pass, but still well under the
       original 28vh/120px, and the row remains scrollable for anything that doesn't fit above the
       fold.
       2026-10-05 (follow-up): clearance moved from padding to margin, same fix and same reasoning as
       the desktop nav rule above — padding kept nav's own scrollable box (and its scrollbar) starting
       at the very top, behind the header in z-order whenever the list was tall enough to actually
       scroll. margin-top shrinks the box itself down below the header instead, and the clearance
       value (and every other vertical padding in this block) also dropped by about a third now that
       there's less to clear. */
    /* 2026-10-05 (follow-up 5): "the problem persists in mobile, desktop works now" — the base nav
       rule's 79px BOTTOM margin (sized to clear the footer, which only matters for desktop's
       full-height sidebar) was never reset here. Mobile nav is a short, fixed-height grid ROW that
       sits entirely above the reading row — it never reaches anywhere near the footer, so that 79px
       was silently eating more than half of the already-compact 150px row as invisible bottom
       margin, which is exactly what reads as "a white bar" and a squished row: most of the row WAS
       blank margin, not a rendering bug, just the wrong clearance value leaking in from the desktop
       rule. margin-bottom:0 here removes it; the top clearance still comes from the separate
       intro[hidden] conditional rule below, unaffected by this. */
    '@media(max-width:900px){#scenario-guide-dialog.scenario-guide-dialog--canonical{inset:0!important;width:100vw!important;height:100vh!important;max-height:100vh!important;border-radius:0!important}#scenario-guide-dialog .scenario-guide-shell--canonical{grid-template-columns:1fr!important;grid-template-rows:minmax(150px,24vh) minmax(0,1fr)!important}#scenario-guide-dialog .scenario-guide-shell__nav{margin-bottom:0!important;padding:10px 14px!important;border-right:0!important;border-bottom:1px solid #d6dde2!important}#scenario-guide-dialog .scenario-guide-shell__nav-button{padding:5px 10px!important}#scenario-guide-dialog .scenario-guide-shell__nav-subbutton{padding:4px 10px!important}#scenario-guide-dialog .scenario-guide-shell__reading{padding:50px 20px 70px!important}}',
    /* Mobile-sized counterpart to the intro[hidden]~body conditional clearance above — same "only
       when nothing else already cleared the header" scoping, just the smaller mobile value. 60px
       (not 52px) — confirmed live that the mobile header's real trimmed height is 56px, so 52px left
       a 4px overlap; 60px keeps a real margin instead of matching it exactly. */
    '@media(max-width:900px){#scenario-guide-dialog .scenario-guide-dialog__intro[hidden]~[data-scenario-guide-body] .scenario-guide-shell__nav{margin-top:60px!important}}',
    /* intro's own margin-top is 60px here too (not 50px) for the same reason as nav's mobile
       clearance above — confirmed live the trimmed mobile header is 56px tall, so 50px also left a
       few pixels of overlap. */
    '@media(max-width:900px){#scenario-guide-dialog .scenario-guide-dialog__header{padding:8px 16px 7px!important}#scenario-guide-dialog .scenario-guide-dialog__header h2{font-size:1.2rem!important}#scenario-guide-dialog .scenario-guide-dialog__header .eyebrow{font-size:.66rem!important}#scenario-guide-dialog .scenario-guide-dialog__intro{margin-top:60px!important;padding:5px 16px!important}#scenario-guide-dialog .scenario-guide-dialog__intro p{font-size:.84rem!important}}',
    /* 2026-10-04: the photo-comparison and document-gallery carousels (components/visual-guidance-
       card.js, components/fast-facts-document-gallery.js) are tuned for the full page's wider reading
       column. Cloned into the dialog's narrower, nested-scroll reading pane unchanged, the comparison
       table's own max-height+overflow-y created a visible scrollbar-inside-a-scrollbar, and its wrap
       had no width cap, so more than one column bled into view at once instead of presenting as a
       clean one-at-a-time card. These rules give both carousels one consistent "card" treatment
       matching the dialog's own visual language (border/radius/background already used above) and let
       the dialog's single outer scroll be the only one in play. */
    /* 2026-10-05: the actual root cause of the card-width overflow below: .ff-section__body (the
       wrapper components/fast-facts-workspace.js puts around every card inside a Fast Facts section,
       including this one) is `display:grid` with no grid-template-columns of its own — so it falls
       back to ONE IMPLICIT column track sized by the default `grid-auto-columns:auto`, which sizes
       itself to its widest item's max-content contribution. A card containing the comparison table
       or the document-gallery carousel has deeply nested descendants with a huge intrinsic (min-
       content) width, so the implicit track inflates to fit THAT, and every card placed in it —
       including unrelated plain ones — inherits that same inflated column width. The per-card
       width:100% rules further below are not enough on their own: 100% of an auto track that has
       already been inflated by a sibling's content is still the inflated size (self-referential).
       minmax(0,1fr) replaces the content-based auto track with one explicitly capped at the
       container's own available width regardless of any item's intrinsic size, so overflowing
       descendants are left to their own already-correct internal overflow-x:auto (the wrap/viewport
       elements) instead of each inflating every card in the section. */
    '#scenario-guide-dialog .ff-section__body{grid-template-columns:minmax(0,1fr)!important}',
    /* 2026-10-05: everything from here through the mobile block below used to be scoped to
       #scenario-guide-dialog only, on the theory that this table and the document gallery only ever
       rendered inside the Scenario Guide. They don't — components/question-inline-response.js's
       documents() renders the exact same VisualGuidanceCard.comparison() markup inline in the
       question flow (e.g. "What are you planning to do with the panel?" surfaces a "Photos that may
       help" table the same way), and that instance was still getting components.v45.7.3.css's OLD,
       pre-carousel styling — a sticky-header scrollable panel on desktop, stacked rows with a
       data-label::before prefix on mobile, and its Previous/Next controls display:none!important
       below 760px with nothing replacing them but an undiscoverable native swipe. That old styling
       is retired now (see components.v45.7.3.css's own comment at the top of its visual-guidance
       block) specifically so this modernized version — sticky label column, narrowed label width,
       the multi-image single-row fix, and the hover-reveal overlay nav — is the ONE look this table
       and the document gallery render with everywhere, not just inside the guide. Dropping the
       #scenario-guide-dialog prefix is what actually makes that true; the rules themselves are
       unchanged from what was already proven correct in the dialog. */
    '.visual-guidance-set--comparison{width:100%!important;max-width:100%!important;min-width:0!important}',
    '.visual-guidance-comparison-wrap{width:100%!important;max-width:100%!important;border:1px solid #d6dde2!important;border-radius:14px!important;background:#fff!important}',
    '.visual-guidance-comparison th,.visual-guidance-comparison td{padding:14px 18px!important;vertical-align:top!important;border-bottom:1px solid #e9eef1!important}',
    '.visual-guidance-comparison thead th{vertical-align:middle!important;border-bottom:1px solid #d6dde2!important}',
    '.visual-guidance-comparison th[scope="row"]{font-weight:800!important;color:#3f474d!important;background:#f8fafb!important}',
    /* 2026-10-05: this rule set left:0 and z-index:2 but never actually set position:sticky, so the
       label column scrolled away with the rest of the table exactly like any other cell instead of
       staying pinned — invisible as long as the carousel sat on column 1 (the label was still just
       there in normal flow), but the moment paging moved to column 2+ the row labels disappeared off
       the left edge entirely, which is exactly the kind of mobile-readability problem the carousel
       was supposed to solve. Caught testing the new full-screen popout, where losing the labels is
       obvious because nothing else is wide enough to hide it. */
    '.visual-guidance-comparison th[scope="col"]:first-child,.visual-guidance-comparison th[scope="row"]{position:sticky!important;left:0!important;z-index:2!important;background:#f8fafb!important}',
    '.visual-guidance-comparison th[scope="col"]:first-child,.visual-guidance-comparison th[scope="row"]{width:180px!important;min-width:180px!important}',
    '.visual-guidance-comparison img{height:200px!important}',
    '.visual-guidance-comparison__visuals{display:flex!important;gap:10px!important;align-items:flex-start!important}',
    '.visual-guidance-comparison__visuals .visual-guidance-comparison__figure:not(:only-child){margin:0!important;flex:1 1 0!important;min-width:0!important}',
    '.visual-guidance-comparison__visuals .visual-guidance-comparison__figure:not(:only-child) img{width:100%!important;height:140px!important;object-fit:cover!important}',
    '.visual-guidance-comparison__visuals .visual-guidance-comparison__figure:not(:only-child) figcaption{font-size:.78rem!important;margin-top:4px!important}',
    '.visual-guidance-carousel-shell{position:relative!important}',
    '.visual-guidance-carousel-controls{position:absolute!important;inset:0!important;z-index:4!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;margin:0!important;padding:0 10px!important;pointer-events:none!important}',
    '.visual-guidance-carousel-status,.fast-facts-doc-gallery__status{position:absolute!important;top:10px!important;left:50%!important;transform:translateX(-50%)!important;margin:0!important;padding:4px 12px!important;border-radius:999px!important;background:rgba(255,255,255,.92)!important;box-shadow:0 1px 6px rgba(0,0,0,.16)!important;color:#3f474d!important;font-size:.76rem!important;font-weight:700!important;white-space:nowrap!important}',
    '.visual-guidance-carousel-button,.fast-facts-doc-gallery__controls .visual-guidance-carousel-button{pointer-events:auto!important;flex:0 0 auto!important;width:40px!important;min-width:40px!important;height:40px!important;min-height:40px!important;padding:0!important;display:flex!important;align-items:center!important;justify-content:center!important;border:1px solid #b8c8d1!important;border-radius:999px!important;background:#fff!important;color:#171717!important;font-weight:700!important;box-shadow:0 2px 10px rgba(0,0,0,.22)!important;opacity:0!important;transition:opacity .18s ease!important}',
    '.visual-guidance-carousel-button span{display:none!important}',
    '.visual-guidance-carousel-shell:hover .visual-guidance-carousel-button,.visual-guidance-carousel-shell:focus-within .visual-guidance-carousel-button{opacity:1!important}',
    /* A touch device never fires :hover, so a reveal-on-hover button would otherwise be unreachable
       by sight (still tappable, just invisible) — force it permanently visible wherever there is no
       hover input to reveal it with. */
    '@media(hover:none),(pointer:coarse){.visual-guidance-carousel-button{opacity:1!important}}',
    '.visual-guidance-carousel-button:disabled{opacity:0!important;pointer-events:none!important}',
    '@media(hover:none),(pointer:coarse){.visual-guidance-carousel-button:disabled{opacity:.35!important}}',
    '.fast-facts-doc-gallery__viewport{border:1px solid #d6dde2!important;border-radius:14px!important;padding:16px!important;background:#fff!important}',
    '@media(max-width:760px){.visual-guidance-comparison-wrap{width:100%!important;max-width:100%!important}}',
    '@media(max-width:760px){.visual-guidance-comparison{min-width:0!important;width:max-content!important}}',
    '@media(max-width:760px){.visual-guidance-comparison th[scope="col"]:first-child,.visual-guidance-comparison th[scope="row"]{width:96px!important;min-width:96px!important}}',
    /* table cells can't reliably use a percentage here — table-layout:fixed sums the columns'
       own widths to derive the table's width (width:max-content above), so a cell percentage would
       resolve against a table size that is itself derived from that same percentage (circular, and
       per spec resolves as auto, which is not useful). A fixed px width sized for a small phone
       (label 96 + data 210 = 306, comfortably under a ~320px content width) trades a little empty
       space on wider phones for never overflowing on narrow ones — robust over pixel-perfect. */
    '@media(max-width:760px){.visual-guidance-comparison th[scope="col"]:not(:first-child),.visual-guidance-comparison td{width:210px!important;min-width:210px!important}}',
    '@media(max-width:760px){.visual-guidance-comparison img{height:140px!important}}',
    /* 2026-10-05: full-screen popout for the photo-comparison table on mobile. The expand button
       (components/visual-guidance-card.js's comparison()) is desktop-hidden by default — there is
       no cramped-reading problem to solve above this breakpoint — and becomes visible here, pinned
       to the shell's top-right corner, permanently (not hover-revealed like the prev/next controls,
       since it is the ONLY way to discover the popout and touch has no hover to reveal it with).
       Toggling .visual-guidance-set--fullscreen promotes the whole <section> (shell, table AND the
       per-column boundary/disclaimer paragraphs beneath it) to a fixed, full-viewport card so it
       reads independently of wherever it is normally embedded (the Scenario Guide dialog's own
       nested scroll column, or the plain question-flow page) without needing a second, separately
       built overlay element to keep in sync with the live carousel. */
    '@media(max-width:760px){.visual-guidance-carousel-expand{display:flex!important;position:absolute!important;top:8px!important;right:8px!important;z-index:6!important;width:32px!important;height:32px!important;align-items:center!important;justify-content:center!important;border:1px solid #b8c8d1!important;border-radius:999px!important;background:rgba(255,255,255,.95)!important;color:#171717!important;font-size:1rem!important;line-height:1!important;box-shadow:0 2px 10px rgba(0,0,0,.22)!important;pointer-events:auto!important}}',
    '.visual-guidance-carousel-expand{display:none}',
    'body.vg-fullscreen-open{overflow:hidden!important}',
    '@media(max-width:760px){.visual-guidance-set--comparison.visual-guidance-set--fullscreen{position:fixed!important;inset:0!important;z-index:2000!important;margin:0!important;max-width:100%!important;padding:8px 8px 10px!important;background:#fff!important;overflow:auto!important;-webkit-overflow-scrolling:touch!important}}',
    /* The normal card treats the Previous/Next controls and the status pill as a hover-revealed
       overlay floating ON TOP of the whole table (position:absolute;inset:0 on the controls,
       vertically centered side buttons) — fine when the table is short enough that centering lands
       the buttons in empty margin, but the fullscreen popout's table fills the whole screen, so that
       same centering would land the buttons (and the status pill) directly on top of a content row
       instead. Taking the controls out of absolute/overlay positioning turns them back into a normal
       in-flow block above the table (their existing DOM order already puts controls before the
       wrap, so no reordering is needed) — a slim toolbar strip, not an overlay. */
    '@media(max-width:760px){.visual-guidance-set--fullscreen .visual-guidance-carousel-controls{position:static!important;inset:auto!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;margin:0 0 4px!important;padding:2px 44px 2px 2px!important;pointer-events:auto!important}}',
    '@media(max-width:760px){.visual-guidance-set--fullscreen .visual-guidance-carousel-status{position:static!important;left:auto!important;top:auto!important;transform:none!important}}',
    '@media(max-width:760px){.visual-guidance-set--fullscreen .visual-guidance-carousel-button{opacity:1!important;width:32px!important;min-width:32px!important;height:32px!important;min-height:32px!important}}',
    /* Tightened vertical rhythm, scoped to the fullscreen popout only — the normal inline/dialog
       table keeps its existing roomier spacing (proven readable at desktop and acceptable at the
       mobile carousel's current size); this is specifically about making the already-dense 5-row
       table fit with little or no vertical scrolling once it has a full screen to itself. */
    '@media(max-width:760px){.visual-guidance-set--fullscreen .visual-guidance-comparison th,.visual-guidance-set--fullscreen .visual-guidance-comparison td{padding:4px 6px!important;font-size:.76rem!important;line-height:1.16!important}}',
    '@media(max-width:760px){.visual-guidance-set--fullscreen .visual-guidance-comparison thead th{padding:4px 6px!important}}',
    '@media(max-width:760px){.visual-guidance-set--fullscreen .visual-guidance-comparison th[scope="col"]:first-child,.visual-guidance-set--fullscreen .visual-guidance-comparison th[scope="row"]{width:70px!important;min-width:70px!important;font-size:.68rem!important;line-height:1.1!important}}',
    /* The base mobile rule fixes the data column at 210px (sized for the normal cramped carousel).
       A narrower column here would force MORE text wrapping, not less, working against the point of
       the popout — overriding it to fill the fullscreen viewport (minus the narrowed label column
       and the section's own side padding) lets each row's text lay out on fewer lines instead, which
       is what actually buys back vertical room. The extra specificity from the .visual-guidance-set
       --fullscreen ancestor class is what lets this win over the base rule despite both being
       !important. */
    '@media(max-width:760px){.visual-guidance-set--fullscreen .visual-guidance-comparison th[scope="col"]:not(:first-child),.visual-guidance-set--fullscreen .visual-guidance-comparison td{width:calc(100vw - 70px - 20px)!important;min-width:calc(100vw - 70px - 20px)!important}}',
    '@media(max-width:760px){.visual-guidance-set--fullscreen .visual-guidance-comparison p{margin:0!important}}',
    '@media(max-width:760px){.visual-guidance-set--fullscreen .visual-guidance-comparison ul{margin:0!important;padding-left:13px!important}}',
    '@media(max-width:760px){.visual-guidance-set--fullscreen .visual-guidance-comparison li{margin:0!important}}',
    '@media(max-width:760px){.visual-guidance-set--fullscreen .visual-guidance-comparison figure{margin:0!important}}',
    '@media(max-width:760px){.visual-guidance-set--fullscreen .visual-guidance-comparison figcaption{font-size:.68rem!important;margin-top:1px!important;line-height:1.1!important}}',
    '@media(max-width:760px){.visual-guidance-set--fullscreen .visual-guidance-comparison img{height:46px!important}}',
    '@media(max-width:760px){.visual-guidance-set--fullscreen .visual-guidance-comparison__empty{line-height:1.16!important}}',
    '@media(max-width:760px){.visual-guidance-set--fullscreen .visual-guidance-comparison__visuals{gap:6px!important}}',
    '@media(max-width:760px){.visual-guidance-set--fullscreen .visual-guidance-comparison__visuals .visual-guidance-comparison__figure:not(:only-child) img{height:36px!important}}',
    '@media(max-width:760px){.visual-guidance-set--fullscreen .visual-guidance-comparison__boundaries{margin-top:6px!important;font-size:.66rem!important;line-height:1.18!important}}',
    '@media(max-width:760px){.visual-guidance-set--fullscreen .visual-guidance-comparison__boundaries p{margin:0 0 2px!important}}',
    /* 2026-10-04: "Documents that may be useful later" (components/fast-facts-document-gallery.js).
       .fast-facts-doc-gallery__viewport is a flex container whose intended "one card per slide"
       sizing rule (components.v45.7.3.css's `.fast-facts-doc-gallery__viewport>*{flex:0 0 clamp(
       300px,80vw,420px)}`) targets its DIRECT children — but the actual document cards are one level
       deeper, inside an intermediate .fast-facts-doc-gallery__grid wrapper (a *2-column CSS grid*,
       V45.7.5.3, built before the one-at-a-time carousel, V45.7.5.7, was added around it). That
       `>*` rule ends up sizing the GRID as a whole to ~420px, inside which all 4 cards still try to
       lay out in 2 columns — the squished, multi-column thumbnails. (core/v45.7-navigation-
       scenario-guide.js's unwrapNestedDocumentCarousel() separately removes a second, auto-applied
       IllustrationCarousel wrapper that was making this worse, but doesn't change the grid itself.)
       display:contents removes the grid's own box from layout while keeping its children — in the
       DOM they're still the grid's children, but for LAYOUT purposes they become the viewport's
       direct flex items, so giving them the same flex-basis the viewport's `>*` rule intended for
       its direct children restores one generously-sized, swipeable card per slide. On mobile,
       where the same base CSS switches .fast-facts-doc-gallery__viewport to a single-column grid
       and hides the carousel controls, display:contents has the equivalent effect: each card
       becomes a direct 1fr grid row instead of a cell in a cramped nested 2-column grid. */
    '#scenario-guide-dialog .fast-facts-doc-gallery__grid{display:contents!important}',
    '#scenario-guide-dialog .fast-facts-doc-gallery__item{flex:0 0 clamp(300px,80vw,420px)!important;min-width:0!important;scroll-snap-stop:always!important;scroll-snap-align:start!important}',
    /* 2026-10-05: same shrink-to-fit-around-a-flex-child bug as .visual-guidance-set--comparison
       above (see that rule's comment) — .fast-facts-doc-gallery (an .insight-section, like every
       other card in this guide) has no explicit width, so it sizes itself from its
       .fast-facts-doc-gallery__viewport child's flex layout instead of filling its actual parent.
       Confirmed live: it was rendering ~53px wider than its own .scenario-guide-shell__section and
       extending past the reading pane's right edge — the "Examples to recognize" card rendering
       wider than its sibling cards. */
    '#scenario-guide-dialog .fast-facts-doc-gallery{width:100%!important;max-width:100%!important;min-width:0!important}',
    /* 2026-10-05: core/v45.7-navigation-scenario-guide.js's addSldExample() appends this card as a
       plain, unstyled <section> — nowhere in the project has .scenario-guide-sld ever had any CSS, so
       it rendered with no border/radius/background at all, unlike every sibling .insight-section card
       in the same reading pane (components.visual-examples.css's .insight-hero,.insight-section rule:
       padding/border/radius/background). Matching those same values here is what makes it read as one
       more card in the guide instead of the one plain, borderless block among bordered ones. */
    '#scenario-guide-dialog .scenario-guide-sld{margin-top:18px!important;padding:18px 20px!important;border:1px solid #d6dde2!important;border-radius:14px!important;background:#fff!important}',
    '#scenario-guide-dialog .scenario-guide-sld h3{margin:2px 0 8px!important}',
    '#scenario-guide-dialog .scenario-guide-sld__visual{margin-top:12px!important}'
  ].join('\n');
  function injectStyle(){
    var style=document.getElementById(STYLE_ID);
    if(style)return;
    style=document.createElement('style');style.id=STYLE_ID;style.textContent=CSS;document.head.appendChild(style);
  }
  /* 2026-10-04: every .ff-section (scenario-guide, what-may-change, prepare, planning-context, next —
     components/fast-facts-sections.js's full configured list) is hidden from the page now, not just
     the scenario-guide one — the Fast Facts screen's final on-page content is just the hero summary
     card (model.hero, outside .ff-reading-pane, never touched here) and the Recommended Next Action
     card (.ff-recommended, also outside this loop). Everything else is reachable only through "View
     scenario guide". This is safe precisely because core/v45.7-navigation-scenario-guide.js's
     sanitizeClone() already resets `hidden`/`aria-hidden` on its way into the dialog — hiding more
     sections here needs no change on that side, it already un-hides whatever it clones.

     Scoped to document.getElementById('app') specifically, NOT document — this function also runs
     from a document-wide MutationObserver, which fires again the moment the dialog's cloned sections
     get inserted into document.body (open() in core/v45.7-navigation-scenario-guide.js). An
     unscoped document.querySelectorAll('.ff-section') would match those clones too and re-hide the
     exact content sanitizeClone() just un-hid, which is what happened the first time this was
     written unscoped: every section inside the open dialog silently collapsed to zero height. */
  function suppressInlineGuide(){
    var app=document.getElementById('app');
    if(!app)return;
    Array.prototype.forEach.call(app.querySelectorAll('.ff-section'),function(section){
      section.hidden=true;section.setAttribute('aria-hidden','true');
    });
    Array.prototype.forEach.call(app.querySelectorAll('[data-quick-guidance-disclosure],.quick-guidance-disclosure'),function(node){node.remove();});
  }
  function normalizeDialog(){
    var dialog=document.querySelector('#scenario-guide-dialog,[data-scenario-guide-dialog],dialog.scenario-guide-dialog');
    if(!dialog)return;
    dialog.id='scenario-guide-dialog';dialog.classList.add('scenario-guide-dialog--canonical');
    var shell=dialog.querySelector('.scenario-guide-shell');if(shell)shell.classList.add('scenario-guide-shell--canonical');
    Array.prototype.forEach.call(dialog.querySelectorAll('[data-quick-guidance-disclosure],.quick-guidance-disclosure'),function(node){node.remove();});
    Array.prototype.forEach.call(dialog.querySelectorAll('h1,h2,h3'),function(heading){if(/^guide section\s*\d+/i.test(heading.textContent.trim()))heading.remove();});
  }
  function normalizeLaunchers(){Array.prototype.forEach.call(document.querySelectorAll('[data-scenario-guide-open]'),function(button){button.type='button';button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','scenario-guide-dialog');});}
  function enhance(){injectStyle();suppressInlineGuide();normalizeLaunchers();normalizeDialog();}
  var scheduled=false;
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;enhance();});}
  var observer=new MutationObserver(schedule);
  function install(){enhance();observer.observe(document.documentElement,{childList:true,subtree:true});document.addEventListener('click',function(event){if(event.target.closest&&event.target.closest('[data-scenario-guide-open]'))setTimeout(enhance,0);},true);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  root.V457594ScenarioGuideRuntime={enhance:enhance};
})(window);
