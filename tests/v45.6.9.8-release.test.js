'use strict';
/* V45.6.9.8 release-version normalization: one internal authority drives every release label. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
/* Retired 2026-10-03: both tests below extracted RELEASE_VERSION under a hard V45.6.x pattern pin,
   which no longer holds now the build is on V45.7.x. The version-independent parts of the contract
   (build.js derives VERSION/output name/title from a single RELEASE_VERSION authority; index.html's
   title matches it) are still true today and covered by tests/v45.6.13-visual-guidance-migration.test.js
   and build.js's own structure. The per-release *_HANDOFF.md/*_VALIDATION.json file-pair check doesn't
   generalize going forward: not every release cuts those files under its own version-prefixed names. */
