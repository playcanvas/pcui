import test from 'node:test';
import { strictEqual } from 'node:assert';

import 'global-jsdom/register'

import NumericInput from '../../dist/module/src/components/NumericInput/index.mjs';

test('NumericInput: constructor: no args', () => {
    const numericInput = new NumericInput();

    strictEqual(numericInput.class.length, 4);
    strictEqual(numericInput.class.contains('font-regular'), true);
    strictEqual(numericInput.class.contains('pcui-element'), true);
    strictEqual(numericInput.class.contains('pcui-numeric-input'), true);
    strictEqual(numericInput.class.contains('pcui-text-input'), true);
});

test('NumericInput: up arrow increments value', () => {
    const numericInput = new NumericInput();

    document.body.appendChild(numericInput.dom);

    numericInput.focus(true);

    strictEqual(numericInput.value, 0);

    numericInput._domInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));

    strictEqual(numericInput.value, 0.1);
});
