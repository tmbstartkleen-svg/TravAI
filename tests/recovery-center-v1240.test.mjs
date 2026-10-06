import assert from 'node:assert/strict';
import {formatRecovery} from '../recovery-center-v1240.mjs';
assert.match(formatRecovery({healthy:false,recovery:[{id:'start-runtime',command:'npm run runtime:ensure'}]})[0],/runtime:ensure/);
assert.match(formatRecovery({healthy:false,recovery:[{id:'refresh-certification',command:'npm run certify:local'}]})[0],/certify:local/);
assert.equal(formatRecovery({healthy:true,recovery:[]}).length,1);
console.log('v12.4.0 recovery center: PASS');
