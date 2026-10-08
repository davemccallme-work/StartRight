'use strict';const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');const R=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(R,f),'utf8');const js=read('core/v45.7-navigation-scenario-guide.js'),css=read('components.v45.7.3.css');
test('loads the runtime after intake/events',()=>{const b=read('build.js');assert.ok(b.indexOf('core/events.js')<b.indexOf('core/v45.7-intake-simplification.js'));assert.ok(b.indexOf('core/v45.7-intake-simplification.js')<b.indexOf('core/v45.7-navigation-scenario-guide.js'));assert.match(b,/components\.v45\.7\.3\.css/);});
// Retired 2026-10-03: the RELEASE_VERSION='V45.7.3' pin is superseded now the build is on V45.7.5.9.9.
test('stage navigation focuses a destination heading with sticky-header offset',()=>{assert.match(js,/function destination\(\)/);assert.match(js,/headerOffset\(\)/);assert.match(js,/target\.focus\(\{preventScroll:true\}\)/);assert.match(js,/getBoundingClientRect\(\)\.top/);});
test('reduced motion disables animated navigation',()=>{assert.match(js,/prefers-reduced-motion: reduce/);assert.match(js,/behavior:reduced\(\)\?'auto':'smooth'/);});
// Retired 2026-10-03: the ad-hoc lazy-image-settlement logic this checked for was consolidated into
// the dedicated ImageViewer/IllustrationCarousel modules (see core/events.js pnEnhanceImages()).
test('Scenario Guide is optional and launched from the primary action',()=>{assert.match(js,/data-scenario-guide-open/);assert.match(js,/View scenario guide/);});
// Retired 2026-10-03: "removed from competing in-page navigation" via hard hidden=true/nav removal
// was itself superseded twice over — first by V45.7.5.9.2's collapsible <details> disclosure, which
// was then fully superseded by V45.7.5.9.4's suppressInlineGuide() (core/v45.7.5.9.4-scenario-guide-runtime.js),
// which hides the section (hidden+aria-hidden), hides its nav links, and removes any stray disclosure.
// The disclosure approach was removed outright as dead weight; see tests/v45.8.0-p1-build-fixes.test.js
// "Fast Facts enhancement no longer builds content only to have it deleted".
test('dialog has modal semantics, accessible name, close controls, and mobile treatment',()=>{assert.match(js,/aria-modal/);assert.match(js,/aria-labelledby/);assert.match(js,/showModal/);assert.match(css,/@media\(max-width:640px\)/);assert.match(css,/height:100dvh/);});
test('dialog supports Escape, focus trap, and focus restoration',()=>{assert.match(js,/e\.key==='Escape'/);assert.match(js,/e\.key!==\'Tab\'/);assert.match(js,/launcher\.focus\(\)/);});
test('opening the guide does not write application state or persistence',()=>{const open=js.slice(js.indexOf('function open('),js.indexOf('function enhanceScenarioGuide'));assert.doesNotMatch(open,/\bS\.|scheduleDraftSave|persistDraft|localStorage|sessionStorage|InsightInstrumentation|answerChanged/);});
// Retired 2026-10-03: the source()/rec launcher-insertion helper was fully rewritten; the current
// equivalent (addLauncher/addFastFactsLauncher appending a button, not cloning .ff-recommended) is
// covered by tests/v45.7.4.2-layout-hotfix.test.js "guide launch is inserted for final guidance and Fast Facts".
test('forced colors and visible focus safeguards exist',()=>{assert.match(css,/@media\(forced-colors:active\)/);assert.match(css,/:focus-visible/);});
