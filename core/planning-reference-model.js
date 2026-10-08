/* V44.49.49 cost and timing simplification.
   Descriptive planning guidance only. No cost, duration, complexity, readiness, or confidence score. */
(function(root){'use strict';
var DEFAULT_FACTORS=[
 {id:'customer-contractor',owner:'You or your contractor',text:'Complete project information, contractor design work, and site readiness can affect when later work can occur.'},
 {id:'utility',owner:'PG&E',text:'Application review, engineering review, capacity review, construction coordination, and meter or service work may affect timing.'},
 {id:'agency',owner:'City or county',text:'Permits, inspections, clearances, and releases may affect when later work can occur.'}
];
var BOUNDARY='Timing information is a planning reference, not a project commitment.';
var ACTION='Confirm the project details and likely documents before applying. After applying, respond within the timeframe stated in each request.';
function clone(x){return JSON.parse(JSON.stringify(x==null?[]:x));}
function scenario(state){var d=state&&state.derived||{},a=state&&state.answers||{};return d.classification||d.scenarioId||(state&&state.projectType==='adu'?(a.aduMeterServiceIntent==='Add a separate service connection'?'adu-separate-service':'adu-unknown'):(state&&state.projectType==='panel'?'panel-unknown':'unknown'));}
function qualifyBenchmark(b,ctx){if(!b||!b.scenarioId||!b.sourceId||!b.period||!b.population||!b.measurementBasis||!b.caveat)return false;if(b.scenarioId!==ctx.scenarioId)return false;if(b.exclusions==null)return false;return true;}
function references(state,registry){var ctx={scenarioId:scenario(state)},list=Array.isArray(registry)?registry:[];return list.filter(function(b){return qualifyBenchmark(b,ctx);}).map(function(b){return Object.assign({},b,{label:b.kind==='regulated-target'?'Regulated target':'Public historical average'});});}
function expressGuidance(state){var d=state&&state.derived||{},facts=state&&state.derivedFacts||{};var explicit=d.expressPath===true||facts.expressEligible===true&&facts.expressPathConfirmed===true;if(!explicit)return null;return {kind:'express-only',text:'For this identified Express path, prepare requested documents before applying. After applying, follow the timeframe stated in each request; missed deadlines can cause cancellation and reapplication.',day19Reference:true,boundary:'This Express-path guidance does not apply to every project, and no countdown has started.'};}
function model(state,registry){return {scenarioId:scenario(state),factors:clone(DEFAULT_FACTORS),preparationAction:ACTION,boundary:BOUNDARY,references:references(state,registry),express:expressGuidance(state),prohibitedTreatments:['dollar-sign scale','dot-based time scale','complexity level','out-of scale','project-specific duration prediction']};}
root.PlanningReferenceModel={DEFAULT_FACTORS:clone(DEFAULT_FACTORS),BOUNDARY:BOUNDARY,ACTION:ACTION,scenario:scenario,qualifyBenchmark:qualifyBenchmark,references:references,expressGuidance:expressGuidance,model:model};
})(typeof window!=='undefined'?window:this);
