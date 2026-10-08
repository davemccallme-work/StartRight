/* V45.6.9.9 GOVERNED ANSWER-RESPONSE CATALOG
   Customer-facing copy shown inside the selected-answer accordion ("About “answer”").
   Governance contract:
     - Content is educational and answer-specific. It never states eligibility, approval,
       requirement, availability, cost, or schedule.
     - This catalog REFERENCES document keys; it never releases them. Document items appear only
       when core/document-guidance-engine.js independently releases the same key.
     - Visual assets are NOT listed here. ProgressiveVisuals/ProgressiveInsights remain the only
       image trigger authority.
     - "I’m not sure" entries carry coaching only: no document keys, no configuration images.
   Field contract:
     responseId            stable ID (lowercase-kebab)
     projectType           'adu' | 'panel'
     questionId            question ID; for compound questions the field listed in answerField
     answerField           optional; the canonical answer key used for matching (default questionId)
     answerValue           canonical stored value, or '*' for any known value
     definition            plain-language meaning of the selected answer
     preparation           one practical, safe next step (optional)
     uncertainty           what still needs confirmation (optional)
     documentGuidanceKeys  keys in DOCUMENT_GUIDANCE_CATALOG.documents (optional)
     status                content review status */
(function(root){'use strict';
var UNSURE='I’m not sure';
function r(id,pt,q,v,def,prep,unc,docs,field){return {responseId:id,projectType:pt,questionId:q,answerField:field||q,answerValue:v,definition:def,preparation:prep||'',uncertainty:unc||'',documentGuidanceKeys:docs||[],status:'human-review-required',contentVersion:'45.6.9.9'};}
var rows=[
/* ---------- ADU: unit type ---------- */
r('adu-type-detached','adu','aduType','Detached ADU','A detached ADU is a separate structure from the main home.','If available, keep the site plan or permit description nearby. It can show where the unit sits on the property.','How the unit would be metered or connected is a separate question.',['site']),
r('adu-type-attached','adu','aduType','Attached ADU','An attached ADU is physically connected to the main home.','If available, keep the plans or permit description nearby. They can show where the unit connects to the home.','Being attached does not settle the meter or service arrangement.',['elevation']),
r('adu-type-junior','adu','aduType','Junior ADU','A Junior ADU is a smaller unit created within the main home.','If available, keep the plans or permit description nearby. They may help confirm how the unit is classified.','Under Electric Rule 18, a Junior ADU cannot be separately metered and is not required to have a separate address. This metering rule does not by itself determine whether another service connection is available.',['load']),
r('adu-type-unsure','adu','aduType',UNSURE,'Choosing I’m not sure keeps the unit type open. That is fine at this stage.','Your permit description, plans, or project contractor can usually confirm whether the unit is detached, attached, or a Junior ADU.','The unit type is still open.'),
/* ---------- ADU: address status ---------- */
r('adu-address-assigned','adu','aduAddressStatus','Yes, a separate address is assigned','Your city or county has issued a separate address for the unit.','Keep the address letter or permit record that shows the assigned address.','An address alone does not determine the meter or service arrangement.',['address']),
r('adu-address-in-progress','adu','aduAddressStatus','The address request is in progress','Your city or county has not finished assigning an address for the unit.','Note the request date and who you are working with at the city or county.','Whether a separate address is needed for your project is still open.',['address']),
r('adu-address-none','adu','aduAddressStatus','No separate address is assigned','No separate address has been issued for the unit.','If you are considering a separate meter or service, ask your city or county whether a separate address is needed.','Whether a separate address is needed for your project is still open.',['address']),
r('adu-address-unsure','adu','aduAddressStatus',UNSURE,'Choosing I’m not sure keeps the address status open.','Your city or county building or planning department can confirm whether an address has been assigned.','The address status is still open.'),
/* ---------- ADU: electrical setup ---------- */
r('adu-setup-existing','adu','aduMeterServiceIntent','Use the existing meter and service','The unit would share the home’s existing meter and electric service.','A licensed electrician can use a list of planned equipment to prepare a load calculation.','Whether the existing panel and service can support the unit is still open.',['load']),
r('adu-setup-meter','adu','aduMeterServiceIntent','Add a separate meter','A meter measures electricity use. A separate meter does not by itself mean a separate service connection.','Ask whether the proposed meter would use the existing service or another connection.','Which arrangement applies is confirmed during formal review.',['site','elevation','address']),
r('adu-setup-service','adu','aduMeterServiceIntent','Add a separate service connection','A service connection is the physical connection from the PG&E system to the property.','Gather the unit type, address status, site plan, and proposed equipment location.','Whether another service connection is available or appropriate is confirmed during formal review.',['site','address']),
r('adu-setup-unsure','adu','aduMeterServiceIntent',UNSURE,'Choosing I’m not sure keeps the electrical setup open.','A licensed electrician can explain the difference between sharing the existing setup, adding a meter, and adding a service connection.','The electrical setup is still open.'),
/* ---------- ADU: service method ---------- */
r('adu-route-overhead','adu','aduServiceMethod','Overhead','Overhead describes a route where visible wires typically reach the property from a pole.','From a safe location on the ground, a wide photo of the property may help. Do not approach utility lines.','The route for your project is still open.'),
r('adu-route-underground','adu','aduServiceMethod','Underground','Underground describes a route below ground.','Mark the unit, existing equipment, and a possible route on a property sketch. Do not dig to investigate.','The actual route and any site work are still open.',['civil']),
r('adu-route-unsure','adu','aduServiceMethod',UNSURE,'Choosing I’m not sure keeps the route open.','From a safe location, look for visible wires running from a pole toward the building.','The route is still open.'),
/* ---------- ADU: adjacent equipment ---------- */
r('adu-adjacent-yes','adu','aduAdjacentService','Yes, next to existing equipment','New equipment would be in the same immediate equipment area, such as beside or very close to the existing meter or panel. This does not confirm that the location is acceptable.','A safe, wider photo of the area may help. Do not open equipment or remove covers.','Whether the location is acceptable is still open.',['adjacent']),
r('adu-adjacent-no','adu','aduAdjacentService','No, not next to existing equipment','New equipment would be at a different location from the existing meter or panel area. Additional routing, placement, or utility review may be needed. This does not confirm that the location is acceptable.','Mark the proposed location on a property sketch.','Whether the location is acceptable is still open.'),
r('adu-adjacent-unsure','adu','aduAdjacentService',UNSURE,'Choosing I’m not sure keeps the equipment location open.','Your contractor or electrician can help identify a proposed location.','The equipment location is still open.'),
/* ---------- Panel: intent ---------- */
r('panel-intent-increase','panel','panelIntent','Increase the panel capacity','A capacity increase means considering a panel with a higher amperage rating.','Bring the existing rating and a list of planned equipment to a licensed electrician for a load calculation.','Whether a higher rating is needed, and whether utility-side work applies, is still open.',['load']),
r('panel-intent-same','panel','panelIntent','Replace the panel at the same capacity','A same-capacity replacement keeps the existing amperage rating.','Safe photos of the existing panel, main breaker, and rating label may help.','If amperage, location, or electrical load changes, the scope may change.',['panel','breaker','rating']),
r('panel-intent-add-load','panel','panelIntent','Add electrical equipment; panel change not decided','Adding equipment does not by itself mean the panel needs to change.','List the equipment you plan to add so a licensed electrician can prepare a load calculation.','Whether the existing panel can support the equipment is still open.',['load']),
r('panel-intent-relocate','panel','panelIntent','Relocate the panel','Relocation means moving the panel to a different location.','Safe photos of the current location and the proposed location may help.','Equipment placement and service routing still need review.',['panel']),
r('panel-intent-unsure','panel','panelIntent',UNSURE,'Choosing I’m not sure keeps the panel scope open.','A licensed electrician can help compare replacing, increasing capacity, relocating, or keeping the existing panel.','The panel scope is still open.'),
/* ---------- Panel: service method ---------- */
r('panel-route-overhead','panel','panelServiceMethod','Overhead service','Overhead service reaches the property through visible wires supported by poles.','From a safe location on the ground, photos of the weatherhead and service span may help. Do not approach utility lines.','Whether the route or equipment changes is still open.',['weatherhead','span']),
r('panel-route-underground','panel','panelServiceMethod','Underground service','Underground service reaches the property through wiring below ground.','Gather existing site and equipment-location information. Do not dig or try to locate underground facilities.','The actual route and any site work are still open.'),
r('panel-route-unsure','panel','panelServiceMethod',UNSURE,'Choosing I’m not sure keeps the service route open.','From a safe location, look for visible wires running from a pole toward the building.','The service route is still open.'),
/* ---------- Panel: existing rating (non-increase path) ---------- */
r('panel-existing-known','panel','panelExistingCapacity','*','The main breaker rating is a starting point for understanding the existing equipment.','A safe, readable photo of the main breaker and rating label may help. Do not remove the panel cover.','A rating alone does not show whether the panel can support planned equipment.',['breaker','rating']),
r('panel-existing-unsure','panel','panelExistingCapacity',UNSURE,'Choosing I’m not sure keeps the existing rating open.','A licensed electrician can read the rating safely.','The existing rating is still open.'),
/* ---------- Panel: capacity comparison (matched on the proposed rating) ---------- */
r('panel-compare-400','panel','panelCapacityCompare','400 amps or more','You are considering a 400-amp-or-more residential service. This is an idea to discuss, not a required or approved size.','Ask the electrician whether a panel cut sheet and a single-line diagram should be prepared for this configuration.','Whether this configuration is needed or available is confirmed during formal review.',['cutsheet','sld','elevation'],'panelProposedCapacity'),
r('panel-compare-320','panel','panelCapacityCompare','320 amps','You are considering a 320-amp panel. This is an idea to discuss, not a required or approved size.','Ask the electrician or equipment supplier for the proposed panel cut sheet.','Whether this configuration is needed or available is confirmed during formal review.',['cutsheet','elevation'],'panelProposedCapacity'),
r('panel-compare-known','panel','panelCapacityCompare','*','The proposed rating is an idea to discuss, not a required or approved size.','Bring both ratings and your equipment list to a licensed electrician.','Whether a different rating is needed is still open.',['elevation'],'panelProposedCapacity'),
r('panel-compare-unsure','panel','panelCapacityCompare',UNSURE,'Choosing I’m not sure keeps the proposed rating open.','A load calculation can help frame the rating to discuss.','The proposed rating is still open.',[],'panelProposedCapacity'),
/* ---------- Panel: planned loads (multi-select) ---------- */
r('panel-loads-selected','panel','panelLoads','*','The equipment you selected helps frame a load calculation.','Note the make and model of each item if available.','Added equipment does not by itself show that a larger panel or service is needed.',['load']),
r('panel-loads-none','panel','panelLoads','No added equipment','You are not planning to add electrical equipment.','If plans change, update this answer so the guidance stays accurate.','The panel scope may still need confirmation.'),
r('panel-loads-unsure','panel','panelLoads',UNSURE,'Choosing I’m not sure keeps the planned equipment open.','A licensed electrician can help list likely equipment.','The planned equipment is still open.')
];
var BOUNDARY='This explains your answer. It is not an eligibility decision, approval, document requirement, or reviewed design.';
function validate(list){var e=[],ids={};(list||rows).forEach(function(x,i){if(!x.responseId||!/^[a-z0-9-]+$/.test(x.responseId))e.push('row '+i+' invalid responseId');if(ids[x.responseId])e.push('duplicate responseId '+x.responseId);ids[x.responseId]=1;if(x.answerValue===UNSURE&&x.documentGuidanceKeys.length)e.push(x.responseId+' unsure answers may not reference documents');if(!x.definition)e.push(x.responseId+' missing definition');});return e;}
root.ANSWER_RESPONSE_CATALOG={version:'45.6.9.9',unsure:UNSURE,boundary:BOUNDARY,rows:rows,validate:validate};
if(typeof module!=='undefined'&&module.exports)module.exports=root.ANSWER_RESPONSE_CATALOG;
})(typeof window!=='undefined'?window:this);
