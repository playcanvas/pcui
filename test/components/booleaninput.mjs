import test from 'node:test';
import assert from 'node:assert';

import 'global-jsdom/register'

import BooleanInput from '../../dist/module/src/components/booleaninput/index.mjs';

test('BooleanInput defaults', () => {
    const booleanInput = new BooleanInput();

    assert.strictEqual(booleanInput.type, undefined);
    assert.strictEqual(booleanInput.value, false);
});
