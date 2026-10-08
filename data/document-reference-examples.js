/* V45.6.10 DOCUMENT REFERENCE EXAMPLES
   Which educational example image accompanies a document AFTER DocumentGuidanceEngine releases it.
   Purpose: show what the document looks like. It is never the customer's configuration or design.
   Keys are DOCUMENT_GUIDANCE_CATALOG document IDs. Assets must exist in LearningCardRegistry. */
(function(root){'use strict';
root.DOCUMENT_REFERENCE_EXAMPLES={
  'DOC-SLD':{byProjectType:{panel:'SLD-012',adu:'SLD-004'},caption:'Example of what a single-line diagram looks like. It is not a design for your project.'},
  'DOC-CUTSHEET':{assetId:'DOC-006',caption:'Example of what a panel cut sheet looks like. It is not your equipment.'},
  'DOC-SITE':{assetId:'DOC-001',caption:'Example of what a site plan looks like. It is not your property.'},
  'DOC-LOAD':{assetId:'DOC-002',caption:'Example of what a load sheet looks like. It is not a calculation for your project.'},
  'DOC-ELEVATION':{assetId:'DOC-003-ELEVATION',caption:'Example of what an exterior elevation looks like. It is not your building.'}
};
if(typeof module!=='undefined'&&module.exports)module.exports=root.DOCUMENT_REFERENCE_EXAMPLES;
})(typeof window!=='undefined'?window:this);
