import test from 'node:test';
import { strictEqual } from 'node:assert';

import 'global-jsdom/register'

import ArrayInput from '../../dist/module/src/components/ArrayInput/index.mjs';

test('ArrayInput constructor: no args', () => {
    const arrayInput = new ArrayInput();

    strictEqual(arrayInput.class.length, 6);
    strictEqual(arrayInput.class.contains('font-regular'), true);
    strictEqual(arrayInput.class.contains('pcui-array-empty'), true);
    strictEqual(arrayInput.class.contains('pcui-array-input'), true);
    strictEqual(arrayInput.class.contains('pcui-container'), true);
    strictEqual(arrayInput.class.contains('pcui-element'), true);
    strictEqual(arrayInput.class.contains('pcui-flex'), true);

    strictEqual(arrayInput.renderChanges, false);
    strictEqual(arrayInput.value instanceof Array, true);
    strictEqual(arrayInput.value.length, 0);
});
