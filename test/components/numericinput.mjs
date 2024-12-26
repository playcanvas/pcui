import { describe, it } from 'node:test';
import { strictEqual } from 'assert';

import 'global-jsdom/register'

import { NumericInput } from '../../dist/module/src/components/NumericInput/index.mjs';

describe('NumericInput', () => {
    it('constructor: no args', () => {
        const numericInput = new NumericInput();

        strictEqual(numericInput.class.length, 4);
        strictEqual(numericInput.class.contains('font-regular'), true);
        strictEqual(numericInput.class.contains('pcui-element'), true);
        strictEqual(numericInput.class.contains('pcui-input-element'), true);
        strictEqual(numericInput.class.contains('pcui-numeric-input'), true);
    });

    it('steps value with up/down arrow keys', () => {
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

    describe('expressions', () => {
        it('string number', () => {
            const numericInput = new NumericInput();

            numericInput.value = "123";
            strictEqual(numericInput.value, 123);
        });

        it('basic addition', () => {
            const numericInput = new NumericInput();

            numericInput.value = "2 + 2";
            strictEqual(numericInput.value, 4);
        });

        it('basic multiplication', () => {
            const numericInput = new NumericInput();

            numericInput.value = "3 * 4";
            strictEqual(numericInput.value, 12);
        });

        it('basic subtraction', () => {
            const numericInput = new NumericInput();

            numericInput.value = "10 - 3";
            strictEqual(numericInput.value, 7);
        });

        it('basic division', () => {
            const numericInput = new NumericInput();

            numericInput.value = "15 / 3";
            strictEqual(numericInput.value, 5);
        });

        it('parentheses', () => {
            const numericInput = new NumericInput();

            numericInput.value = "(2 + 2) * 3";
            strictEqual(numericInput.value, 12);
            
            numericInput.value = "2 + (3 * 4)";
            strictEqual(numericInput.value, 14);
        });

        it('invalid inputs', () => {
            const numericInput = new NumericInput();
            
            numericInput.value = "2 + abc";
            strictEqual(numericInput.value, 0);
            
            numericInput.value = "2 +* 3";
            strictEqual(numericInput.value, 0);
            
            numericInput.value = "function() {}";
            strictEqual(numericInput.value, 0);
        });

        it('length limit', () => {
            const numericInput = new NumericInput();
            
            numericInput.value = "1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1";  // > 20 chars
            strictEqual(numericInput.value, 0);
        });
    });
});
