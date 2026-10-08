/* ============================ recognition (V44: alias-derived CUSTOMER_LANG) ============================
   Single source of truth: PROJECT_TYPES[].aliases in data.js. Excludes "unsure" (no aliases). */
var CUSTOMER_LANG=(function(){var m={};(typeof PROJECT_TYPES!=="undefined"?PROJECT_TYPES:[]).forEach(function(p){if(p&&p.id&&p.id!=="unsure"&&p.aliases&&p.aliases.length){m[p.id]=p.aliases.slice();}});return m;})();
function rankProjectTypes(text){var raw=String(text||"").toLowerCase(),out=[];
  Object.keys(CUSTOMER_LANG).forEach(function(id){var s=0;CUSTOMER_LANG[id].forEach(function(ph){if(raw.indexOf(ph)>=0)s+=(ph.indexOf(" ")>=0?6:3);});if(s>0)out.push({id:id,score:s});});
  out.sort(function(a,b){return b.score-a.score;});return out;}
function suggestProjectTypes(text){var r=rankProjectTypes(text);if(!r.length)return {mode:"clarify",candidates:[]};
  var top=r[0].score,close=r.filter(function(x){return x.score>=Math.max(3,top*0.6);}).slice(0,3);
  if(close.length===1&&top>=5)return {mode:"strong",candidates:close};
  if(close.length>=2)return {mode:"several",candidates:close};
  if(top>=3)return {mode:"strong",candidates:close};
  return {mode:"clarify",candidates:r.slice(0,2)};}


;
