/* ============================ arrival-scenes.js ============================
   Presentation-only arrival context. It is intentionally outside canonical S,
   is not serialized, and must not influence recognition, guidance, drafts, or export. */
var ArrivalScene={view:"cover",channel:"",returnFocusId:""};
var ARRIVAL_CHANNELS=["website","email","assistant"];
function arrivalChannelAllowed(value){return ARRIVAL_CHANNELS.indexOf(String(value||""))>=0;}
function arrivalIsActive(){return ArrivalScene.view==="cover";}
function arrivalSelectChannel(value){if(!arrivalChannelAllowed(value))return false;ArrivalScene.channel=value;return true;}
function arrivalContinue(){
  if(!arrivalChannelAllowed(ArrivalScene.channel))return false;
  ArrivalScene.returnFocusId="arrival-channel-"+ArrivalScene.channel;
  ArrivalScene.view=ArrivalScene.channel+"-preview";
  return true;
}
function arrivalEnterNavigator(){ArrivalScene.view="navigator";return true;}
function arrivalBegin(){ArrivalScene.view="navigator";return true;}
function arrivalBackToSelector(){ArrivalScene.view="cover";return true;}
function arrivalWebsitePreviewActive(){return ArrivalScene.view==="website-preview";}

function arrivalEmailPreviewActive(){return ArrivalScene.view==="email-preview";}
function arrivalAssistantPreviewActive(){return ArrivalScene.view==="assistant-preview";}

var _arrivalParamsApplied=false;
var ArrivalDebug={enabled:false,initialEntry:"",invalidEntry:""};
function arrivalApplyQueryParams(search){
  if(_arrivalParamsApplied)return;
  _arrivalParamsApplied=true;
  try{
    var raw=typeof search==="string"?search:((typeof window!=="undefined"&&window.location)?window.location.search:"");
    var q=new URLSearchParams(raw),entry=String(q.get("entry")||"").toLowerCase();
    ArrivalDebug.enabled=q.get("debug")==="arrival";
    ArrivalDebug.initialEntry=entry;
    if(!entry)return;
    if(entry==="selector"){
      ArrivalScene.channel="";
      ArrivalScene.view="selector";
      return;
    }
    if(arrivalChannelAllowed(entry)){
      ArrivalScene.channel=entry;
      ArrivalScene.returnFocusId="arrival-channel-"+entry;
      ArrivalScene.view=entry+"-preview";
      return;
    }
    ArrivalDebug.invalidEntry=entry;
    ArrivalScene.channel="";
    ArrivalScene.view="cover";
  }catch(e){
    ArrivalScene.channel="";
    ArrivalScene.view="cover";
  }
}
function arrivalDebugEnabled(){return !!ArrivalDebug.enabled;}

function arrivalNavigationSnapshot(){return {view:ArrivalScene.view,channel:ArrivalScene.channel||""};}
function restoreArrivalNavigation(x){if(!x)return false;ArrivalScene.channel=arrivalChannelAllowed(x.channel)?x.channel:"";ArrivalScene.view=String(x.view||"selector");render();return true;}

;
