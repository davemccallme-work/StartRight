/* 2026-10-05: scripted fixtures for the "Try a simulated document check" exercise
   (components/simulated-document-check.js). This is NOT a real upload — no file is ever read,
   analyzed, or stored. Each fixture references ONLY existing ids already governed elsewhere in the
   app: `documentId` must exist in data/document-guidance-catalog.js (its title/description/icon are
   read from there at render time, not duplicated here), and `assetId` must resolve via
   LearningCardRegistry.byId() (the same registry already gating every other illustrative image in
   this app behind reviewStatus/rightsStatus/publicationStatus checks). One fixture resolves
   "passed", the other "needsFile", so both scripted outcomes are visible without a branching UI. */
(function(r){'use strict';
var fixtures=[
  {
    documentId:'DOC-SITE',
    assetId:'DOC-001',
    outcome:'passed',
    present:[
      'The property boundary and structures appear visible.',
      'Existing and proposed equipment locations appear marked.',
      'An orientation reference (such as a north arrow) appears included.'
    ],
    nextStep:'Bring a site plan like this to your conversation with a licensed electrician or your city or county permitting office.'
  },
  {
    documentId:'DOC-LOAD',
    assetId:'DOC-002',
    outcome:'needsFile',
    present:[
      'A list of existing electrical equipment appears included.'
    ],
    missing:[
      'Expected demand or amperage for each listed item.',
      'Planned new equipment is not itemized separately.'
    ],
    nextStep:'Ask a licensed electrician to help complete demand figures on a load sheet like this before using it in a conversation with PG&E.'
  }
];
r.SIMULATED_DOCUMENT_FIXTURES=fixtures;
if(typeof module!=='undefined'&&module.exports)module.exports=fixtures;
})(typeof window!=='undefined'?window:this);
