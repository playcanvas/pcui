import test from 'node:test';
import { strictEqual } from 'assert';

import 'global-jsdom/register'

import { BooleanInput } from '../../dist/module/src/components/BooleanInput/index.mjs';

test('BooleanInput constructor: no args', () => {
    const booleanInput = new BooleanInput();

    strictEqual(booleanInput.class.length, 4);
    strictEqual(booleanInput.class.contains('font-regular'), true);
    strictEqual(booleanInput.class.contains('pcui-boolean-input'), true);
    strictEqual(booleanInput.class.contains('pcui-element'), true);
    strictEqual(booleanInput.class.contains('pcui-not-flexible'), true);

    strictEqual(booleanInput.type, undefined);
    strictEqual(booleanInput.value, null);
});
