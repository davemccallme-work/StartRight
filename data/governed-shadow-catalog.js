/* V45.6.6 shadow-only assertions. Design proposal is not an approved policy source. */
(function(root){'use strict';
var source={id:'pn-design-shadow-2026',section:'PN-201 through PN-303',authorityTier:6,functionalOwner:null,effectiveDate:null,revision:null,status:'prototype_only'};
var catalog={version:'pn-governed-shadow-v1',rules:[
{id:'SCOPE-ADDED-LOAD-REVIEW',context:'panel',outcomeKey:'scope-review',outcomeValue:'review_scope',applicability:{path:'addedLoad',op:'eq',value:true},when:{path:'panelChange',op:'eq',value:true},prerequisites:{path:'capacityChange',op:'eq',value:false},formalReview:true,source:source,approvalState:'prototype_only',release:'shadow_only',safeFallback:'show_needs_confirmation'},
{id:'SCOPE-SERVICE-REQUEST-REVIEW',context:'panel',outcomeKey:'service-review',outcomeValue:'review_service',applicability:{path:'separateServiceRequest',op:'eq',value:true},when:{path:'panelChange',op:'eq',value:true},formalReview:true,source:source,approvalState:'prototype_only',release:'shadow_only',safeFallback:'show_formal_confirmation_required'},
{id:'SCOPE-UNKNOWN-CAPACITY-REVIEW',context:'panel',outcomeKey:'capacity-review',outcomeValue:'review_capacity',applicability:{path:'panelChange',op:'eq',value:true},when:{path:'capacityChange',op:'eq',value:true},prerequisites:{path:'proposedPanelAmps',op:'gte',value:100},formalReview:true,source:source,approvalState:'prototype_only',release:'shadow_only',safeFallback:'hide'}
]};root.GovernedShadowCatalog=catalog;if(typeof module!=='undefined'&&module.exports)module.exports=catalog;
})(typeof window!=='undefined'?window:this);
