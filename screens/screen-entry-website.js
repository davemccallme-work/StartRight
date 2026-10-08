/* ============================ screen-entry-website.js ============================
   Simulated utility-webpage arrival context. It does not preselect a project,
   answer questions, or write canonical Navigator state. */
function arrivalWebsitePreviewScreen(){
  return '<section class="arrival-preview arrival-preview--website" aria-labelledby="arrival-website-heading">'
    +'<div class="arrival-preview__simulation-label">Prototype website simulation</div>'
    +'<header class="arrival-preview__utility-header">'
      +'<span class="arrival-preview__brand">PG&amp;E-style project guidance</span>'
      +'<span>Residential</span>'
    +'</header>'
    +'<nav class="arrival-preview__breadcrumb" aria-label="Prototype breadcrumb">Home / Electric service projects / Project preparation</nav>'
    +'<div class="arrival-preview__hero">'
      +'<div class="eyebrow">Before you apply</div>'
      +'<h1 id="arrival-website-heading" tabindex="-1">Planning an ADU, panel upgrade, or electric service project?</h1>'
      +'<p class="lede">A little preparation can make it easier to describe your project, understand what information may be requested, and identify questions to discuss before you apply.</p>'
      +'<div class="arrival-preview__benefits">'
        +arrivalWebsiteBenefit("message-circle","Understand your project","Answer a few questions in plain language. You can change your answers as you learn more.")
        +arrivalWebsiteBenefit("file-text","See what may be helpful","Review possible information, documents, and photos associated with your project.")
        +arrivalWebsiteBenefit("state-next-action","Prepare for your next conversation","Identify details that still need confirmation and questions to discuss with your contractor, electrician, or PG&amp;E.")
      +'</div>'
      +'<div class="arrival-preview__actions">'
        +'<button class="btn primary" type="button" data-act="arrival-start-navigator">Explore my project '+icon("arrow-right",16)+'</button>'
        +'<button class="btn ghost" type="button" data-act="arrival-back-selector">'+icon("arrow-left",16)+'Back to entry options</button>'
      +'</div>'
    +'</div>'
    +'<div class="note"><span><strong>Preparation guidance only</strong> — Project Navigator doesn’t submit an application, approve a project, or make an engineering determination.</span></div>'
    +'</section>';
}
function arrivalWebsiteBenefit(iconName,title,text){
  return '<section class="arrival-preview__benefit"><span class="arrival-preview__benefit-icon" aria-hidden="true">'+icon(iconName,22)+'</span><div><h2>'+esc(title)+'</h2><p>'+text+'</p></div></section>';
}

;
