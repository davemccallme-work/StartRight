/* Facilitator-only arrival diagnostics. Presentation state only. */
function arrivalDebugPanel(){
  if(typeof arrivalDebugEnabled!=="function"||!arrivalDebugEnabled())return "";
  var items=["Initial entry: "+(ArrivalDebug.initialEntry||"default selector"),"Current arrival view: "+String(ArrivalScene.view||"selector"),"Selected channel: "+(ArrivalScene.channel||"none"),"Selector, website, email, and assistant routes are available","Arrival context is transient and separate from canonical project state"];
  if(ArrivalDebug.invalidEntry)items.unshift("Invalid entry parameter fell back to selector: "+ArrivalDebug.invalidEntry);
  return '<aside class="arrival-debug" aria-labelledby="arrival-debug-heading"><h2 id="arrival-debug-heading">Arrival research diagnostics</h2><p>Facilitator-only presentation checks. This panel does not describe customer project data.</p><ul>'+items.map(function(item){return '<li>'+esc(item)+'</li>';}).join('')+'</ul></aside>';
}

;
