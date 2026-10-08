/* V44.26.2 APPLICATION EXPORT REVIEW */
'use strict';
var applicationExportReviewOpen=false;
var APPLICATION_EXPORT_QUESTION_BY_FIELD={description:'description',propertyType:'property',stage:'timing',panelIntent:'panelIntent',existingPanelCapacity:'panelExistingCapacity',proposedPanelCapacity:'panelProposedCapacity',panelServiceMethod:'panelServiceMethod',plannedLoads:'panelLoads',aduType:'aduType',aduAddressStatus:'aduAddressStatus',aduMeterServiceIntent:'aduMeterServiceIntent',aduServiceMethod:'aduServiceMethod',aduAdjacentService:'aduAdjacentService'};
function applicationExportReviewValue(value){return Array.isArray(value)?value.join(', '):String(value==null?'':value);}
function applicationExportReviewReason(reason){var map={'not-collected':'Not collected in Project Navigator','technical-calculation-required':'Requires a technical calculation','technical-determination-required':'Requires technical confirmation','must-not-be-inferred':'Must be confirmed directly','never-auto-populate':'Must be completed by the customer','needs-confirmation':'Needs confirmation','not-applicable':'Not applicable to the current answers'};return map[reason]||'Left blank for customer review';}
function applicationExportReviewDecisionControls(item){
  var selected=exportReviewDecision(S.projectType,item.logicalField,item.value),includeOn=selected==='include',blankOn=selected==='leave-blank';
  return '<div class="application-export-review__decisions" role="group" aria-label="Draft choice for '+esc(item.label)+'"><button class="planning-control '+(includeOn?'is-active':'')+'" data-act="export-review-decision" data-logical-field="'+esc(item.logicalField)+'" data-decision="include" aria-pressed="'+(includeOn?'true':'false')+'">Include in draft</button><button class="planning-control '+(blankOn?'is-active':'')+'" data-act="export-review-decision" data-logical-field="'+esc(item.logicalField)+'" data-decision="leave-blank" aria-pressed="'+(blankOn?'true':'false')+'">Leave blank</button></div>';
}
function applicationExportReviewItems(items,kind){if(!items.length)return '<p class="muted">No items in this group.</p>';return '<ul class="application-export-review__list">'+items.map(function(item){var q=APPLICATION_EXPORT_QUESTION_BY_FIELD[item.logicalField],edit=q?'<button class="linkbtn" data-act="edit-export-question" data-question-id="'+esc(q)+'">Review answer</button>':'';var detail=kind==='omitted'?applicationExportReviewReason(item.reason):applicationExportReviewValue(item.value),decisions=kind==='confirm'?applicationExportReviewDecisionControls(item):'';return '<li><div><strong>'+esc(item.label)+'</strong><span>'+esc(detail)+'</span>'+decisions+'</div>'+edit+'</li>';}).join('')+'</ul>';}
function applicationExportDraftActionHtml(){
  var reviewed=createReviewedApplicationExportPlan(S);
  var gate=canOfferEditableForm791216Draft({route:S.projectType,projectType:S.projectType,reviewedPlan:reviewed});
  var writerAvailable=typeof createEditableForm791216Pdf==='function';
  var enabled=gate.allowed&&writerAvailable;
  var reason=!gate.allowed?(gate.reason==='review-required'?'Review your draft choices before downloading.':'Editable draft PDFs are currently limited to the developed ADU and Panel journeys.'):(writerAvailable?'':'The editable PDF writer is not included in this build.');
  return '<div class="application-export-review__download" role="group" aria-labelledby="editable-form-draft-action-heading">'+
    '<h3 class="sr" id="editable-form-draft-action-heading">Editable draft download</h3>'+
    '<button class="btn primary" type="button" data-act="download-editable-form-draft" aria-describedby="editable-form-draft-help" '+(enabled?'':'disabled aria-disabled="true"')+'>Download editable draft</button>'+
    '<p class="muted" id="editable-form-draft-help">'+esc(enabled?'Downloads a partially completed, editable PDF for your review. Downloading does not submit an application.':reason)+'</p>'+
    '</div>';
}
function applicationExportReviewHtml() {
  var m = createApplicationExportManifest(S);
  var html = "";

  html += '<div class="application-export-review-backdrop"';
  html += ' data-act="close-export-review"';
  html += ' aria-hidden="true">';
  html += '</div>';

  html += '<section class="application-export-review"';
  html += ' id="applicationExportReview"';
  html += ' role="dialog"';
  html += ' aria-modal="true"';
  html += ' aria-labelledby="application-export-review-heading"';
  html += ' tabindex="-1">';

  html += '<div class="application-export-review__head">';
  html += '<div>';
  html += '<div class="eyebrow">Draft form review</div>';
  html += '<h2 id="application-export-review-heading">';
  html += 'Review information before creating a draft form';
  html += '</h2>';
  html += '<p>';
  html += 'See what could come from your answers, ';
  html += 'what needs confirmation, and what would stay blank.';
  html += '</p>';
  html += '</div>';

  html += '<button class="btn ghost"';
  html += ' type="button"';
  html += ' data-act="close-export-review"';
  html += ' aria-label="Close draft form review">';
  html += 'Close';
  html += '</button>';
  html += '</div>';

  if (!m.supported) {
    html += '<div class="note">';
    html += '<span>';
    html += 'This review is currently available only for the ';
    html += 'developed ADU and Panel journeys.';
    html += '</span>';
    html += '</div>';
  }

  html += '<div class="application-export-review__groups">';

  html += '<section aria-labelledby="export-from-answers">';
  html += '<h3 id="export-from-answers">From your answers</h3>';
  html += '<p class="muted">';
  html += 'Customer-provided details that have a direct, ';
  html += 'form-neutral match.';
  html += '</p>';
  html += applicationExportReviewItems(
    m.populated,
    "populated"
  );
  html += '</section>';

  html += '<section aria-labelledby="export-confirm-first">';
  html += '<h3 id="export-confirm-first">';
  html += 'Check before using';
  html += '</h3>';
  html += '<p class="muted">';
  html += 'These are customer-provided answers, but the formal ';
  html += 'form meaning still needs review.';
  html += '</p>';
  html += applicationExportReviewItems(
    m.confirmBeforeAdding,
    "confirm"
  );
  html += '</section>';

  html += '<section aria-labelledby="export-left-blank">';
  html += '<h3 id="export-left-blank">You still need to provide these details</h3>';
  html += '<p class="muted">';
  html += 'Project Navigator will not infer technical, legal, ';
  html += 'contact, or unanswered information.';
  html += '</p>';
  html += applicationExportReviewItems(
    m.omitted,
    "omitted"
  );
  html += '</section>';

  html += '</div>';

  html += '<div class="sr"';
  html += ' aria-live="polite"';
  html += ' aria-atomic="true"';
  html += ' data-export-review-status>';
  html += '</div>';

  html += '<div class="application-export-review__boundary">';
  html += '<strong>This is only a draft. Nothing has been sent to PG&amp;E.</strong> ';
  html += 'Review all information carefully. ';
  html += 'You still need to complete any blank fields. ';
  html += 'Creating or downloading a draft does not send anything to PG&amp;E. ';
  html += 'You decide if and when to begin a separate application.';
  html += '</div>';

  html += applicationExportDraftActionHtml();

  html += '</section>';

  return html;
}

if(typeof module!=='undefined'&&module.exports)module.exports={applicationExportReviewHtml:applicationExportReviewHtml,applicationExportDraftActionHtml:applicationExportDraftActionHtml};

;
