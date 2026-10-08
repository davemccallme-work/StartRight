#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),src=path.join(root,'echo_scope_glossary.json'),out=path.join(root,'components/generated-glossary-data.js'),check=process.argv.includes('--check');
function normalize(value){return String(value||'').trim().toLowerCase().replace(/\s+/g,' ').replace(/[’‘]/g,"'");}
function generate(){
  const raw=JSON.parse(fs.readFileSync(src,'utf8'));
  if(!Array.isArray(raw.GLOSSARY))throw new Error('GLOSSARY array missing');
  const ids=new Set(),labels=new Map(),aliases=new Map(),rows=[];
  for(const item of raw.GLOSSARY){
    const id=String(item.id||'').trim(),term=String(item.term||'').trim(),definition=String(item.definition||'').trim();
    if(!id||!term||!definition)throw new Error('Every glossary entry needs id, term, and definition');
    if(ids.has(id))throw new Error('Duplicate canonical glossary ID: '+id);ids.add(id);
    const labelKey=normalize(term);if(labels.has(labelKey))throw new Error('Duplicate normalized glossary label: '+term);labels.set(labelKey,id);
    const rowAliases=[term].concat(item.aliases||[]).map(String).map(x=>x.trim()).filter(Boolean);
    for(const alias of rowAliases){const key=normalize(alias),owner=aliases.get(key);if(owner&&owner!==id)throw new Error('Conflicting glossary alias: '+alias+' -> '+owner+' and '+id);aliases.set(key,id);}
    rows.push({id,term,definition,aliases:[...new Set(rowAliases)].sort((a,b)=>a.localeCompare(b))});
  }
  rows.sort((a,b)=>a.term.localeCompare(b.term));
  return '/* GENERATED from echo_scope_glossary.json. Do not hand edit. */\nvar ECHO_GLOSSARY_ENTRIES='+JSON.stringify(rows)+';\n';
}
const generated=generate(),current=fs.existsSync(out)?fs.readFileSync(out,'utf8'):'';
if(check){if(current!==generated){console.error('Generated glossary drift detected');process.exit(1)}console.log('PASS glossary drift check');}
else{fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,generated);console.log('WROTE '+path.relative(root,out));}
