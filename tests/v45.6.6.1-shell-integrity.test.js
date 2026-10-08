'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const shell=fs.readFileSync(path.join(root,'index.html'),'utf8');
const builder=fs.readFileSync(path.join(root,'build.js'),'utf8');
function inspectArtifact(artifact){const source=builder.replace(/\bmain\(\);\s*$/,'').replace('const shell=read(SHELL);','const shell=h;');assert.notEqual(source,builder,'builder entrypoint must be removed for isolated guardrail test');const context={require,__dirname:root,process:{argv:['node','build.js']},console};vm.runInNewContext(source+'\nthis.inspect=artifactChecks;',context);return Array.from(context.inspect(artifact));}
test('HTML shell closes cleanly without flattened-file separator or trailing CSS',()=>{assert.match(shell,/<\/html>\s*$/i);assert.doesNotMatch(shell,/(?:^|\n)\s*File:\s*components\.visual-examples\.css\b/i);assert.equal(shell.split('</html>').length,2);});
test('builder rejects appended source and stray text after closing HTML',()=>{assert.ok(!inspectArtifact(shell).some(x=>x.includes('trailing content')||x.includes('flattened source marker')));const contaminated=shell+'\n---------\nFile: components.visual-examples.css\n.fast-facts{max-width:760px}';const errors=inspectArtifact(contaminated);assert.ok(errors.some(x=>x.includes('trailing content')),errors.join('; '));});
test('builder rejects leaked file marker even when before closing HTML',()=>{const contaminated=shell.replace('</html>','\nFile: components.visual-examples.css\n</html>');const errors=inspectArtifact(contaminated);assert.ok(errors.some(x=>x.includes('flattened source marker')),errors.join('; '));});
