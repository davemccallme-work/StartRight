/* V44.49.62 CANONICAL GLOSSARY CONTROLLER
   One visible row per canonical concept. Aliases support lookup but never render as rows. */
(function(root){
  'use strict';
  var mounted=null,abort=null;
  function normalize(value){return String(value||'').trim().toLowerCase().replace(/\s+/g,' ').replace(/[’‘]/g,"'");}
  function unique(values){var seen={};return (values||[]).filter(function(x){var k=normalize(x);if(!k||seen[k])return false;seen[k]=1;return true;});}
  function canonicalEntries(){
    var byId={},aliasOwner={};
    function merge(record,priority){
      if(!record)return;
      var id=String(record.id||'').trim(),term=String(record.term||record.displayTerm||'').trim(),definition=String(record.definition||'').trim();
      if(!id||!term||!definition)return;
      var current=byId[id];
      if(!current)current=byId[id]={id:id,term:term,definition:definition,aliases:[],priority:priority};
      if(priority>=current.priority){current.term=term;current.definition=definition;current.priority=priority;}
      current.aliases=unique(current.aliases.concat([term],record.aliases||[]));
    }
    (root.ECHO_GLOSSARY_ENTRIES||[]).forEach(function(x){merge(x,1);});
    var comprehension=root.COMPREHENSION_CONTENT&&root.COMPREHENSION_CONTENT.records||[];
    comprehension.forEach(function(x){merge(x,2);});
    var rows=Object.keys(byId).map(function(id){return byId[id];});
    rows.forEach(function(row){row.aliases.forEach(function(alias){var key=normalize(alias);if(!aliasOwner[key])aliasOwner[key]=row.id;});});
    /* If one record's visible term is already an alias owned by another canonical record, hide the alias record. */
    rows=rows.filter(function(row){var owner=aliasOwner[normalize(row.term)];return !owner||owner===row.id;});
    rows.sort(function(a,b){return a.term.localeCompare(b.term);});
    return rows.map(function(x){return {id:x.id,term:x.term,definition:x.definition,aliases:x.aliases};});
  }
  var entries=canonicalEntries(),map={};
  entries.forEach(function(item){map[item.term]=item.definition;(item.aliases||[]).forEach(function(alias){map[alias]=item.definition;map[normalize(alias)]=item.definition;});});
  root.GLOSSARY=root.GLOSSARY||{};Object.keys(map).forEach(function(key){root.GLOSSARY[key]=map[key];});
  function setOpen(button,panel,open){if(open)panel.removeAttribute('hidden');else panel.setAttribute('hidden','');button.setAttribute('aria-expanded',open?'true':'false');var term=button.getAttribute('data-term-label')||button.querySelector('.term-button__label')&&button.querySelector('.term-button__label').textContent||'this term',kind=button.getAttribute('data-definition-action')||'definition';button.setAttribute('aria-label',kind==='project-context'?((open?'Hide':'Show')+' why '+term+' matters for this project'):((open?'Hide':'Show')+' definition of '+term));}
  function handleClick(event){var button=event.target.closest&&event.target.closest('.term-button');if(!button||!mounted.contains(button))return;var id=button.getAttribute('aria-controls')||button.getAttribute('data-def'),panel=id&&document.getElementById(id);if(!panel)return;event.preventDefault();event.stopPropagation();setOpen(button,panel,panel.hasAttribute('hidden'));}
  function mount(rootNode){if(!rootNode)return;if(mounted===rootNode)return;unmount();mounted=rootNode;abort=typeof AbortController!=='undefined'?new AbortController():null;var options=abort?{signal:abort.signal}:false;mounted.addEventListener('click',handleClick,options);}
  function unmount(){if(abort)abort.abort();abort=null;mounted=null;}
  root.GlossaryController={mount:mount,unmount:unmount,entries:entries,canonicalEntries:canonicalEntries,normalize:normalize};
})(typeof window!=='undefined'?window:this);
