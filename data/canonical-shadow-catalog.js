/* V45.6.5 prototype-only source registry. No approval or customer release is asserted. */
(function(root){'use strict';
var source={id:'project-navigator-shadow-scope',authorityTier:6,section:'PN-101 to PN-303 design proposal',status:'prototype_only',functionalOwner:null};
var catalog={version:'pn-governance-shadow-v1',rules:[
{id:'SHADOW-ADDED-LOAD',context:'panel',factPaths:['addedLoad'],expected:true,source:source,approvalState:'prototype_only',release:'shadow_only',fallback:'hide',safeFallback:'show_needs_confirmation'},
{id:'SHADOW-PANEL-CHANGE',context:'panel',factPaths:['panelChange'],expected:true,source:source,approvalState:'prototype_only',release:'shadow_only',fallback:'hide',safeFallback:'show_needs_confirmation'},
{id:'SHADOW-SEPARATE-SERVICE-REQUEST',context:'panel',factPaths:['separateServiceRequest'],expected:true,source:source,approvalState:'prototype_only',release:'shadow_only',fallback:'hide',safeFallback:'show_formal_confirmation_required'}
]};root.CanonicalShadowCatalog=catalog;if(typeof module!=='undefined'&&module.exports)module.exports=catalog;
})(typeof window!=='undefined'?window:this);
