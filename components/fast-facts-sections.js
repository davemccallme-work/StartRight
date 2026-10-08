/* V45.6.9.8 Fast Facts section configuration.
   SINGLE SOURCE OF TRUTH for Fast Facts navigation labels, anchor IDs, display
   order, section titles, and optional empty states. The desktop rail, the
   narrow-viewport "On this page" control, and the reading-pane sections are all
   rendered from this list by components/fast-facts-workspace.js.

   Governance boundary: these are page-navigation destinations only. No field in
   this configuration may express progress, completion, readiness, eligibility,
   approval, application status, step numbers, or percentages.

   Field contract (all additive; unknown fields are ignored by the renderer):
     slot        Required. Stable semantic key that content blocks target.
                 Expected values: lowercase-kebab strings. Never renamed casually;
                 renaming requires updating content blocks and tests together.
     anchorId    Required. Stable DOM id for deep links / in-page navigation.
                 Default convention: 'ff-section-' + slot.
     navLabel    Required. Short customer-facing destination label.
     title       Required. Section heading that makes sense out of context.
     intro       Optional. One-sentence orientation shown under the heading.
                 Default: omitted.
     emptyState  Optional. Customer-facing copy shown when no content block
                 targets this slot. Default: null, which omits the section from
                 BOTH the page and the navigation (no orphaned links).
   Order: array order is display order for rail, "On this page", and page. */
var FAST_FACTS_SECTIONS=[
  {slot:'scenario-guide',anchorId:'ff-section-scenario-guide',navLabel:'Scenario guide',title:'Scenario guide',intro:'A plain-language overview of the kind of project you selected.',emptyState:null},
  {slot:'what-may-change',anchorId:'ff-section-what-may-change',navLabel:'What may change',title:'What may change',intro:'Service, panel, meter, equipment, or site conditions that are often part of this kind of project.',emptyState:null},
  {slot:'prepare',anchorId:'ff-section-prepare',navLabel:'Prepare',title:'Prepare',intro:'Photos, documents, and details that can be useful to gather. Examples are for recognition only.',emptyState:null},
  {slot:'planning-context',anchorId:'ff-section-planning-context',navLabel:'Planning context',title:'Planning context',intro:'Who evaluates what, and historical cost and timing context with its limits.',emptyState:null},
  {slot:'next',anchorId:'ff-section-next',navLabel:'Next',title:'Next: what to clarify, confirm, or discuss',intro:'Open items stay visible here until they are answered or confirmed.',emptyState:'Nothing else to list yet. Your next answers will add items to clarify or discuss.'}
];
var FastFactsSections=(function(){
  'use strict';
  function list(){return FAST_FACTS_SECTIONS.slice();}
  function bySlot(slot){for(var i=0;i<FAST_FACTS_SECTIONS.length;i++)if(FAST_FACTS_SECTIONS[i].slot===slot)return FAST_FACTS_SECTIONS[i];return null;}
  function validate(sections){
    var errors=[],slots={},anchors={};
    (sections||FAST_FACTS_SECTIONS).forEach(function(s,i){
      if(!s||!s.slot)errors.push('section '+i+' missing slot');
      if(!s||!s.anchorId||!/^[a-z][a-z0-9-]*$/.test(s.anchorId))errors.push('section '+i+' anchorId must be a stable lowercase id');
      if(!s||!s.navLabel||!s.title)errors.push('section '+i+' missing navLabel or title');
      if(s&&slots[s.slot])errors.push('duplicate slot '+s.slot);
      if(s&&anchors[s.anchorId])errors.push('duplicate anchorId '+s.anchorId);
      if(s&&/\b(step|complete|completed|incomplete|ready|eligible|approved|submitted|percent|%)\b/i.test(String(s.navLabel)))errors.push('navLabel implies progress or status: '+s.navLabel);
      if(s){slots[s.slot]=true;anchors[s.anchorId]=true;}
    });
    return errors;
  }
  return {list:list,bySlot:bySlot,validate:validate};
})();
if(typeof module!=='undefined'&&module.exports)module.exports={FAST_FACTS_SECTIONS:FAST_FACTS_SECTIONS,FastFactsSections:FastFactsSections};
