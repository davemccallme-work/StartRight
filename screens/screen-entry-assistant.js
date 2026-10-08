/* ============================ screen-entry-assistant.js ============================
   Fixed, bounded referral conversation. It does not invoke the live preparation
   coach, recognize a route, or write customer answers. */
function arrivalAssistantPreviewScreen(){
  return '<section class="arrival-preview arrival-preview--assistant" aria-labelledby="arrival-assistant-heading">'
    +'<div class="arrival-preview__simulation-label">Simulated assistant conversation</div>'
    +'<div class="arrival-assistant">'
      +'<header class="arrival-assistant__head"><span class="arrival-assistant__head-icon" aria-hidden="true">'+icon("message-circle",22)+'</span><div><h1 id="arrival-assistant-heading" tabindex="-1">Get project-specific preparation guidance</h1><p>Fixed prototype conversation, not an open chatbot</p></div></header>'
      +'<div class="arrival-assistant__log">'
        +'<section class="arrival-assistant__message arrival-assistant__message--customer"><h2>Customer</h2><p>I’m planning an ADU and may need to upgrade my electrical panel. Where should I start?</p></section>'
        +'<section class="arrival-assistant__message arrival-assistant__message--assistant"><h2>Assistant</h2><p>Project Navigator can help you organize what you know and understand what may be relevant before you apply.</p><p>It will ask a few questions about your project and provide preparation guidance based on your answers. You can review possible documents or photos, identify information that still needs confirmation, and prepare questions for your electrician, contractor, or PG&amp;E.</p><p class="muted small">Project Navigator cannot approve your design, determine engineering requirements, or submit an application.</p></section>'
      +'</div>'
      +'<div class="arrival-preview__actions"><button class="btn primary" type="button" data-act="arrival-start-navigator">Start Project Navigator '+icon("arrow-right",16)+'</button><button class="btn ghost" type="button" data-act="arrival-back-selector">'+icon("arrow-left",16)+'Back to entry options</button></div>'
    +'</div></section>';
}

;
