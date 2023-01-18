import test from 'node:test';
import assert from 'node:assert';

import 'global-jsdom/register'

import Button from '../../dist/module/src/components/button/index.mjs';

test('Button defaults', () => {
    const button = new Button();

    assert.strictEqual(button.text, undefined);
    assert.strictEqual(button.size, undefined);
    assert.strictEqual(button.icon, undefined);
});
