/* V44.49.32 residential participant cover. */
function arrivalSelectorScreen(){
  var restored=(typeof draftRestored!=="undefined"&&draftRestored)?'<div class="participant-cover__restore" role="status"><strong>Earlier prototype answers are available on this device.</strong> After beginning, you can continue them or start over from the guide.</div>':'';
  return '<section class="participant-cover" aria-labelledby="participant-cover-heading">'
    +'<div class="participant-cover__hero"><div class="eyebrow">Project Navigator research prototype</div>'
    +'<h1 class="big" id="participant-cover-heading">See how early project guidance could help you prepare</h1>'
    +'<p class="lede">Imagine you are planning a residential project, such as an accessory dwelling unit or an electrical panel upgrade. Project Navigator asks a few questions and builds guidance you could use before starting a utility application.</p></div>'
    +'<div class="participant-cover__grid"><section class="participant-cover__section"><h2>What you will do</h2><ul><li>Choose a residential project to explore</li><li>Answer a short set of project questions</li><li>Review what the prototype understands and what still needs confirmation</li><li>Receive a preparation guide with a recommended next action, useful questions, and possible documents to discuss</li></ul></section>'
    +'<section class="participant-cover__section"><h2>As you go</h2><p>Use the prototype as if the project were your own. Some information is illustrative. If a question does not match your situation, choose the closest answer or use the available skip option.</p><p>Your answers are saved only on this device so the prototype can continue if the page is reopened.</p></section></div>'
    +'<div class="participant-cover__boundary"><strong>Research prototype only</strong> — it doesn’t submit an application, approve a project, verify requirements, provide a cost quote, or set a schedule.</div>'
    +restored+'<div class="participant-cover__actions"><button class="btn primary participant-cover__begin" type="button" data-act="arrival-begin" aria-label="Begin the Project Navigator prototype">Begin '+icon("arrow-right",18)+'</button></div>'
    +'</section>';
}

;
