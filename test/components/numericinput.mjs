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
            
            numericInput.value = "10 / (4 - 2)";
            strictEqual(numericInput.value, 5);
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
            
            // Expression with 19 chars works
            numericInput.value = "1+1+1+1+1+1+1+1+1+1";
            strictEqual(numericInput.value, 10);
            
            // Expression with 20 chars fails
            numericInput.value = "1+1+1+1+1+1+1+1+1+10";
            strictEqual(numericInput.value, 0);
        });

        describe('percentages', () => {
            it('basic percentage', () => {
                const numericInput = new NumericInput();
                
                numericInput.value = 200;
                numericInput.value = "50%";
                strictEqual(numericInput.value, 100);  // 50% of 200
                
                numericInput.value = 200;
                numericInput.value = "150%";
                strictEqual(numericInput.value, 300);  // 150% of 200
            });

            it('percentage in expressions', () => {
                const numericInput = new NumericInput();
                
                numericInput.value = 100;
                numericInput.value = "50% + 10";
                strictEqual(numericInput.value, 60);   // (50% of 100) + 10
                
                numericInput.value = 100;
                numericInput.value = "25% * 2";
                strictEqual(numericInput.value, 50);   // (25% of 100) * 2
            });

            it('multiple percentages', () => {
                const numericInput = new NumericInput();
                
                numericInput.value = 100;
                numericInput.value = "25% + 50%";
                strictEqual(numericInput.value, 75);   // (25% of 100) + (50% of 100)
            });

            it('invalid percentages', () => {
                const numericInput = new NumericInput();
                
                numericInput.value = 100;
                numericInput.value = "abc%";
                strictEqual(numericInput.value, 0);
                
                numericInput.value = 100;
                numericInput.value = "%50";
                strictEqual(numericInput.value, 0);
                
                numericInput.value = 100;
                numericInput.value = "50%%";
                strictEqual(numericInput.value, 0);
            });

            it('percentage with zero base value', () => {
                const numericInput = new NumericInput();
                
                numericInput.value = 0;
                numericInput.value = "50%";
                strictEqual(numericInput.value, 0);  // 50% of 0 is 0
            });

            it('percentage with negative base value', () => {
                const numericInput = new NumericInput();
                
                numericInput.value = -100;
                numericInput.value = "50%";
                strictEqual(numericInput.value, -50);  // 50% of -100
                
                numericInput.value = -100;
                numericInput.value = "150%";
                strictEqual(numericInput.value, -150);  // 150% of -100
            });

            it('percentage with decimal base value', () => {
                const numericInput = new NumericInput();
                
                numericInput.value = 0.5;
                numericInput.value = "200%";
                strictEqual(numericInput.value, 1);  // 200% of 0.5
            });
        });
    });
});
