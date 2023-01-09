import test from 'node:test';
import assert from 'node:assert';

import 'global-jsdom/register'

import ArrayInput from '../../dist/module/src/components/arrayinput/index.mjs';

test('ArrayInput defaults', () => {
    const arrayInput = new ArrayInput();

    assert.strictEqual(arrayInput.renderChanges, false);
    assert.equal(arrayInput.value, []);
});
