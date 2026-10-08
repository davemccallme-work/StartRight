/* ============================ arrival-walkthrough.js ============================
   Calm, semantic process walkthrough. Animation is CSS-only and informational;
   reduced-motion users receive the same sequence without animation. */
function arrivalWalkthrough(){
  var steps=[
    {icon:"home",title:"Choose a project",text:"Select the residential project you want to explore."},
    {icon:"message-circle",title:"Answer a few questions",text:"Describe the project in plain language and clarify what is known."},
    {icon:"state-confirmation",title:"Understand what still needs confirmation",text:"Review known information and identify details that may still need confirmation."},
    {icon:"file-text",title:"Receive your preparation guide",text:"Review your recommended next action, useful questions, and possible documents to discuss."}
  ];
  return '<section class="arrival-walkthrough" aria-labelledby="arrival-walkthrough-heading" aria-describedby="arrival-walkthrough-description">'
    +'<div class="eyebrow">How it works</div>'
    +'<h2 id="arrival-walkthrough-heading">A short preparation walkthrough</h2>'
    +'<p id="arrival-walkthrough-description" class="muted">The same four-step explanation remains available when animation is reduced or unavailable.</p>'
    +'<ol class="arrival-walkthrough__steps">'
    +steps.map(function(s,i){return '<li class="arrival-walkthrough__step" style="--arrival-order:'+i+'">'
      +'<span class="arrival-walkthrough__icon" aria-hidden="true">'+icon(s.icon,22)+'</span>'
      +'<span class="arrival-walkthrough__copy"><strong>'+esc(s.title)+'</strong><span>'+esc(s.text)+'</span></span>'
      +'</li>';}).join('')
    +'</ol></section>';
}

;
