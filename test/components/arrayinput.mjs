import { describe, it } from 'node:test';
import { strictEqual, deepStrictEqual } from 'assert';

import 'global-jsdom/register'

import { ArrayInput } from '../../dist/module/src/components/ArrayInput/index.mjs';
import { BindingTwoWay } from '../../dist/module/src/binding/BindingTwoWay/index.mjs';
import { Observer } from '@playcanvas/observer';
// Import TextInput to register 'string' element type
import '../../dist/module/src/components/TextInput/index.mjs';

describe('ArrayInput', () => {
    it('constructor: no args', () => {
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

    it('increasing array size with string values preserves existing values', () => {
        // Create two observers with string array values, one containing an empty string
        const observer1 = new Observer({ myArray: ['foo', 'bar'] });
        const observer2 = new Observer({ myArray: ['foo', ''] });

        // Create an ArrayInput with a binding for strings
        const binding = new BindingTwoWay();
        const arrayInput = new ArrayInput({
            type: 'string',
            binding: binding
        });

        // Link to both observers
        arrayInput.link([observer1, observer2], 'myArray');

        // Verify initial observer state is unchanged after linking
        deepStrictEqual(observer1.get('myArray'), ['foo', 'bar'], 'Observer1 should have original values after linking');
        deepStrictEqual(observer2.get('myArray'), ['foo', ''], 'Observer2 should have original values after linking');

        // Verify the ArrayInput correctly shows 2 elements
        strictEqual(arrayInput._arrayElements.length, 2, 'ArrayInput should have 2 elements');

        // Increase the array size from 2 to 3
        arrayInput._inputSize.value = 3;

        // After size change, observers should have their original values preserved
        // with new default values appended
        const arr1 = observer1.get('myArray');
        const arr2 = observer2.get('myArray');

        strictEqual(arr1.length, 3, 'First observer array should have 3 elements');
        strictEqual(arr2.length, 3, 'Second observer array should have 3 elements');

        // Original values should be preserved
        strictEqual(arr1[0], 'foo', 'First observer, first value should be "foo"');
        strictEqual(arr1[1], 'bar', 'First observer, second value should be "bar"');
        strictEqual(arr2[0], 'foo', 'Second observer, first value should be "foo"');
        strictEqual(arr2[1], '', 'Second observer, second value should be empty string');

        // New values should be the default (empty string for strings)
        strictEqual(arr1[2], '', 'First observer, third value should be empty string');
        strictEqual(arr2[2], '', 'Second observer, third value should be empty string');
    });
});
