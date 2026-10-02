import assert from 'node:assert/strict';
import {listFavorites,setFavorite,favoritePolicy} from '../local-bridge/task-favorites-v991.mjs';
assert.equal(listFavorites().includes('health-check'),true);
assert.equal(setFavorite('mute-mac',true).ok,true);
assert.equal(listFavorites().includes('mute-mac'),true);
assert.equal(setFavorite('unknown',true).ok,false);
assert.equal(favoritePolicy.arbitraryActions,false);
console.log('v9.9.1 favorites: PASS');
