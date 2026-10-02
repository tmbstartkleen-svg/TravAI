import assert from 'node:assert/strict';
import {listTaskTemplates,buildTaskFromTemplate,templatePolicy} from '../local-bridge/task-templates-v990.mjs';

const items=listTaskTemplates();
assert.equal(items.some(x=>x.id==='health-check'),true);
assert.equal(items.find(x=>x.id==='health-check').requiresApproval,false);
assert.equal(items.find(x=>x.id==='mute-mac').requiresApproval,true);

const task=buildTaskFromTemplate('privacy-settings');
assert.equal(task.steps[0].action,'open-system-settings-pane');
await assert.rejects(async()=>buildTaskFromTemplate('missing'),/TEMPLATE_NOT_FOUND/);

assert.equal(templatePolicy.fixedTemplatesOnly,true);
assert.equal(templatePolicy.arbitraryCommands,false);
console.log('v9.9.0 task templates: PASS');
