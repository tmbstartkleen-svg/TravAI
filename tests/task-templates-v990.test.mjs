import assert from 'node:assert/strict';
import {listTaskTemplates,buildTaskFromTemplate,templatePolicy} from '../local-bridge/task-templates-v990.mjs';

const items=listTaskTemplates();
assert.equal(items.some(x=>x.id==='health-check'),true);
assert.equal(items.find(x=>x.id==='health-check').requiresApproval,false);
assert.equal(items.find(x=>x.id==='mute-mac').requiresApproval,true);
assert.equal(items.find(x=>x.id==='system-check').requiresApproval,true);
assert.equal(items.find(x=>x.id==='work-start').category,'workflow');
assert.equal(items.find(x=>x.id==='system-review').category,'system');

const task=buildTaskFromTemplate('privacy-settings');
assert.equal(task.steps[0].action,'open-system-settings-pane');
const bundle=buildTaskFromTemplate('system-check');
assert.equal(bundle.steps.length,3);
assert.equal(bundle.steps[0].action,'read-health');
assert.equal(bundle.steps[2].action,'open-system-settings-pane');
const large=buildTaskFromTemplate('work-start');
assert.equal(large.steps.length,4);
assert.equal(large.steps[0].action,'read-health');
assert.equal(large.steps[3].action,'open-system-settings-pane');
await assert.rejects(async()=>buildTaskFromTemplate('missing'),/TEMPLATE_NOT_FOUND/);

assert.equal(templatePolicy.fixedTemplatesOnly,true);
assert.equal(templatePolicy.arbitraryCommands,false);
assert.equal(templatePolicy.categorizedTemplates,true);
console.log('v9.9.0 task templates: PASS');
