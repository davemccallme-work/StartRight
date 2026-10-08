/* V45.6.2 shadow-only rule catalog. Prototype assertions are not publication approvals. */
(function(root){'use strict';
var catalog={version:'shadow-v1',mode:'shadow',rules:[
 {id:'SHADOW-PANEL-REPLACE-INTENT',context:'panel',factPaths:['panel.intent'],when:{op:'eq',path:'panel.intent',value:'replace'},source:{id:'prototype-panel-intent',status:'prototype_only',owner:'Project Navigator research'},release:'shadow_only',fallback:'withhold'},
 {id:'SHADOW-PANEL-UPGRADE-INTENT',context:'panel',factPaths:['panel.intent'],when:{op:'eq',path:'panel.intent',value:'upgrade'},source:{id:'prototype-panel-intent',status:'prototype_only',owner:'Project Navigator research'},release:'shadow_only',fallback:'withhold'},
 {id:'SHADOW-PANEL-RELOCATE-INTENT',context:'panel',factPaths:['panel.intent'],when:{op:'eq',path:'panel.intent',value:'relocate'},source:{id:'prototype-panel-intent',status:'prototype_only',owner:'Project Navigator research'},release:'shadow_only',fallback:'withhold'},
 {id:'SHADOW-PANEL-ADDED-LOAD-UNRESOLVED',context:'panel',factPaths:['panel.intent'],when:{op:'eq',path:'panel.intent',value:'added_load_unresolved'},source:{id:'prototype-panel-scope-capture',status:'prototype_only',owner:'Project Navigator research'},release:'shadow_only',fallback:'withhold'},
 {id:'SHADOW-ADU-TYPE-KNOWN',context:'adu',factPaths:['adu.type'],when:{op:'known',path:'adu.type'},source:{id:'prototype-adu-type',status:'prototype_only',owner:'Project Navigator research'},release:'shadow_only',fallback:'withhold'}
]};
root.ShadowRuleCatalog=catalog;
if(typeof module!=='undefined'&&module.exports)module.exports=catalog;
})(typeof window!=='undefined'?window:this);
