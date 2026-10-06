import assert from 'node:assert/strict';
import {summarizeReleaseHealth} from '../release-health-v1200.mjs';
const green=summarizeReleaseHealth({packageVersion:'12000000000.0.0',runtime:{running:true,base:'http://127.0.0.1:4783'},certification:{productionValidated:true,generatedAt:'now'}});
assert.equal(green.ready,true);
assert.equal(green.productionCertified,true);
const red=summarizeReleaseHealth({packageVersion:'12000000000.0.0',runtime:{running:false},certification:{productionValidated:true}});
assert.equal(red.ready,false);
console.log('v12.0.0 release health: PASS');
