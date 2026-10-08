"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const R=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(R,f),"utf8");
// 2026-10-05: .story-stack (components.css) was display:grid with no grid-template-columns — falls
// back to one implicit column sized by grid-auto-columns:auto, which sizes to its content's
// MAX-CONTENT width (the width content needs laid out on a single line, ignoring wrap opportunities).
// screens/screen-summary.js is the only place this class is used ("preparation-guide__story
// story-stack", the Guidance page's whole card stack) — confirmed live the container rendered at
// 2229px against a 606px viewport, pushing the entire Guidance page into horizontal overflow, purely
// from ordinary paragraph text, no single culprit element required. Same root cause and same fix
// already proven for .ff-section__body elsewhere in this codebase.
test("story-stack caps its grid track to the container's available width instead of its content's intrinsic size",()=>{
  const c=read("components.css");
  assert.match(c,/\.story-stack\{display:grid;grid-template-columns:minmax\(0,1fr\);gap:var\(--space-3,\.75rem\)\}/);
});
test("story-stack is still the Guidance page's one and only story container — the fix targets the actual overflowing class",()=>{
  const s=read("screens/screen-summary.js");
  assert.match(s,/preparation-guide__story story-stack/);
});
