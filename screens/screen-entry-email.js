/* ============================ screen-entry-email.js ============================
   Simulated email reading experience. Generic identities only; no sent-message,
   campaign, customer-record, or application state is created. */
function arrivalEmailPreviewScreen(){
  return '<section class="arrival-preview arrival-preview--email" aria-labelledby="arrival-email-heading">'
    +'<div class="arrival-preview__simulation-label">Simulated email for prototype research</div>'
    +'<article class="arrival-email">'
      +'<header class="arrival-email__chrome">'
        +'<h1 id="arrival-email-heading" tabindex="-1">Prepare for your electric service project</h1>'
        +'<dl><div><dt>From</dt><dd>PG&amp;E Project Guidance</dd></div><div><dt>To</dt><dd>Customer</dd></div><div><dt>Subject</dt><dd>Prepare for your electric service project</dd></div></dl>'
      +'</header>'
      +'<div class="arrival-email__body">'
        +'<p>Hello,</p>'
        +'<p>If you are planning an ADU, panel upgrade, or another project that may affect electric service, Project Navigator can help you prepare before beginning an application.</p>'
        +'<p>Answer a few questions to organize what you already know, see information that may be helpful, and identify details that still need confirmation.</p>'
        +'<h2>What to expect</h2>'
        +'<ul><li>Plain-language project questions</li><li>Guidance based on the answers you provide</li><li>Examples of information or photos that may help</li><li>A review of information that could support a future draft form</li></ul>'
        +'<p class="arrival-email__reassurance"><strong>You can explore without submitting anything to PG&amp;E.</strong></p>'
        +'<div class="arrival-preview__actions"><button class="btn primary" type="button" data-act="arrival-start-navigator">Review my project '+icon("arrow-right",16)+'</button><button class="btn ghost" type="button" data-act="arrival-back-selector">'+icon("arrow-left",16)+'Back to entry options</button></div>'
      +'</div>'
      +'<footer class="arrival-email__footer">Project Navigator doesn’t submit an application or confirm project eligibility.</footer>'
    +'</article></section>';
}

;
