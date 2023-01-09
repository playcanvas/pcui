import test from 'node:test';
import assert from 'node:assert';

import 'global-jsdom/register'

import Button from '../../dist/module/src/components/button/index.mjs';

test('Button defaults', () => {
    const button = new Button();

    assert.strictEqual(button.text, '');
    assert.strictEqual(button.size, null);
    assert.strictEqual(button.icon, undefined);
});
