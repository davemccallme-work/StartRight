"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const R=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(R,f),"utf8");
test("approved modal runtime is wired once, in order",()=>{
 // Retired 2026-10-03: the RELEASE_VERSION='V45.7.5.9.7' pin is superseded now the build is on V45.7.5.9.9.
 const b=read("build.js"),base="core/v45.7-navigation-scenario-guide.js",modal="core/v45.7.5.9.4-scenario-guide-runtime.js";
 assert.equal(b.split("'"+modal+"'").length-1,1);
 assert.ok(b.indexOf("'"+base+"'")<b.indexOf("'"+modal+"'"));
 assert.ok(b.indexOf("'"+modal+"'")<b.indexOf("'core/v45.7-glossary-runtime.js'"));
 assert.doesNotMatch(b,/['"]core\/v45\.7\.5\.9\.3-unified-scenario-guide\.js['"]/);
});
test("diagram metadata stays in the governed catalog without remapping",()=>{
 const box={};vm.runInNewContext(read("data/visual-example-catalog.js"),box);
 const rows=box.VISUAL_EXAMPLE_CATALOG;
 assert.ok(Array.isArray(rows));
 const diagrams=rows.filter(x=>/^SLD-\d{3}$/.test(x.id));
 assert.ok(diagrams.length>=11);
 for(const x of diagrams){assert.match(x.assetPath,/^assets\//);assert.ok(x.alt);assert.ok(x.reviewStatus);}
});
