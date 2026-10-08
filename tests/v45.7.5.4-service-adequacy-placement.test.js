"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const R=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(R,f),"utf8");
// Retired 2026-10-03: the RELEASE_VERSION='V45.7.5.4' pin is superseded now the build is on V45.7.5.9.9.
// Note: the bare filenames below (screen-questions.js, v45.7-correctness-guidance.js,
// question-inline-response.js) predate a later reorg into screens/ and components/ subdirectories;
// updated to the current paths rather than retired, since the underlying checks are still valid.
test("question renderer derives inline service adequacy guidance",()=>{const s=read("screens/screen-questions.js");assert.match(s,/function inlineServiceAdequacyGuidance/);assert.match(s,/V457ServiceContextEngine\.servicePotential/);});
test("warning is limited to relevant panel interpretation questions",()=>{const s=read("screens/screen-questions.js");assert.match(s,/\['panelIntent','panelExistingCapacity','panelCapacityCompare','panelProposedCapacity','panelLoads'\]/);assert.match(s,/S\.projectType!=='panel'/);});
test("warning is inserted inside inline response content",()=>{const s=read("screens/screen-questions.js");assert.match(s,/inner\+=inlineServiceAdequacyGuidance\(q\)/);const i=s.indexOf("inner+=inlineServiceAdequacyGuidance(q)"),r=s.indexOf("QuestionInlineResponse.render");assert.ok(i<r);});
test("warning remains fail closed",()=>{const s=read("screens/screen-questions.js");assert.match(s,/svc\.status!=='eligible'/);assert.match(s,/typeof V457ServiceContextEngine==='undefined'/);});
test("outer correctness renderer no longer duplicates service adequacy warning",()=>{const s=read("components/v45.7-correctness-guidance.js");assert.doesNotMatch(s,/o\.push\(note\('Panel size does not confirm service adequacy'/);});
test("documents remain after injected interpretation content",()=>{const s=read("components/question-inline-response.js");const inner=s.indexOf("+(innerHtml||'')"),docs=s.indexOf("+documents(m)");assert.ok(inner>=0&&docs>inner);});
// Retired 2026-10-05: the bounded-max-height sticky-header "contained" design is gone — see
// tests/v45.7.5.3.2-contained-table.test.js for the current column-carousel contract that replaced
// it (now global, not dialog-only) in core/v45.7.5.9.4-scenario-guide-runtime.js.
test("photo comparison table still renders (contained-panel behavior retired, not the table itself)",()=>{const s=read("components/visual-guidance-card.js");assert.match(s,/function comparison/);});
