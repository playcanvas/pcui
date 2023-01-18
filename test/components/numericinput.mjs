import test from 'node:test';
import { strictEqual } from 'assert';

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

test('NumericInput: up/down arrow keys step value', () => {
    const numericInput = new NumericInput({
        step: 0.1
    });

    document.body.appendChild(numericInput.dom);

    numericInput.focus(true);

    strictEqual(numericInput.value, 0);

    const upEvent = new KeyboardEvent('keydown', {
        key: 'ArrowUp'
    });
    numericInput.input.dispatchEvent(upEvent);

    strictEqual(numericInput.value, 0.1);

    const downEvent = new KeyboardEvent('keydown', {
        key: 'ArrowDown'
    });
    numericInput.input.dispatchEvent(downEvent);

    strictEqual(numericInput.value, 0);

    document.body.removeChild(numericInput.dom);

    numericInput.destroy();
});
