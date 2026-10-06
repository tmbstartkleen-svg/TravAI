import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const workflow=await readFile(new URL('../.github/workflows/deploy-pages.yml',import.meta.url),'utf8');
assert.equal(workflow.includes("_site/release.json"),true);
assert.equal(workflow.includes("packageVersion:p.version"),true);
assert.equal(workflow.includes("commit:process.env.GITHUB_SHA"),true);
assert.equal(workflow.includes("runtimeAuthority:'http://127.0.0.1:4783'"),true);
assert.equal(workflow.includes('actions/upload-artifact@v4'),true);
console.log('v11.8.0 portable release manifest: PASS');
