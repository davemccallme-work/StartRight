'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../core/v45.7-navigation-scenario-guide.js'),'utf8');
// Retired 2026-10-05: "Clear my answers" no longer lives in the scenario guide's last reading
// section at all — it moved to screens/screen-summary.js, at the end of the preparation guide.
// See tests/v45.7.5.9.8-final-reset-placement.test.js for the current placement assertions.
test('scenario guide section-building loop no longer appends a Clear my answers control',()=>{
 assert.doesNotMatch(source,/data-scenario-guide-clear-answers/);
});
test('no duplicate cloned section heading or empty numbered fallback',()=>{
 assert.match(source,/duplicate\.textContent\.trim\(\).*?group\.label\.trim\(\)/);
 assert.match(source,/duplicate\.remove\(\)/);
 assert.doesNotMatch(source,/\('Guide section '\+\(index\+1\)\)/);
 assert.match(source,/section\.id==='ff-section-scenario-guide'/);
});
