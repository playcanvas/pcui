import { describe, it } from 'node:test';
import { strictEqual, deepStrictEqual } from 'assert';

import 'global-jsdom/register'

import { ArrayInput } from '../../dist/module/src/components/ArrayInput/index.mjs';
import { BindingTwoWay } from '../../dist/module/src/binding/BindingTwoWay/index.mjs';
import { Observer } from '@playcanvas/observer';

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

    describe('multi-observer linking', () => {
        it('creates per-observer paths when linking array elements with multiple observers', () => {
            // Create two observers with arrays of same length but different values
            const observer1 = new Observer({ myArray: [10, 20] });
            const observer2 = new Observer({ myArray: [30, 40] });

            const arrayInput = new ArrayInput({
                type: 'number',
                binding: new BindingTwoWay()
            });

            document.body.appendChild(arrayInput.dom);

            // Track the LAST path emitted for each index during linkElement event
            // (events may fire multiple times during update cycle)
            const linkedPathsByIndex = new Map();
            arrayInput.on('linkElement', (element, index, path) => {
                linkedPathsByIndex.set(index, path);
            });

            // Link to multiple observers with a single path template
            arrayInput.link([observer1, observer2], 'myArray');

            // Verify that paths are created as arrays (one for each observer)
            // when there are multiple observers
            strictEqual(linkedPathsByIndex.size, 2); // 2 unique element indices

            // Each linked element should have an array of paths (one per observer)
            for (const [index, path] of linkedPathsByIndex) {
                strictEqual(Array.isArray(path), true, `Path for index ${index} should be an array`);
                strictEqual(path.length, 2, `Path array for index ${index} should have 2 entries (one per observer)`);
                // Verify path format: myArray.0, myArray.1
                strictEqual(path[0], `myArray.${index}`);
                strictEqual(path[1], `myArray.${index}`);
            }

            document.body.removeChild(arrayInput.dom);
            arrayInput.destroy();
        });

        it('uses string path for single observer', () => {
            const observer = new Observer({ myArray: [1, 2, 3] });

            const arrayInput = new ArrayInput({
                type: 'number',
                binding: new BindingTwoWay()
            });

            document.body.appendChild(arrayInput.dom);

            const linkedPathsByIndex = new Map();
            arrayInput.on('linkElement', (element, index, path) => {
                linkedPathsByIndex.set(index, path);
            });

            // Link to single observer
            arrayInput.link([observer], 'myArray');

            // For single observer, path should be a string (not an array)
            strictEqual(linkedPathsByIndex.size, 3); // 3 unique element indices
            for (const [index, path] of linkedPathsByIndex) {
                strictEqual(typeof path, 'string', `Path for index ${index} should be a string`);
                strictEqual(path, `myArray.${index}`);
            }

            document.body.removeChild(arrayInput.dom);
            arrayInput.destroy();
        });

        it('creates path array for single observer with multiple paths', () => {
            const observer = new Observer({ path1: [1, 2], path2: [3, 4] });

            const arrayInput = new ArrayInput({
                type: 'number',
                binding: new BindingTwoWay()
            });

            document.body.appendChild(arrayInput.dom);

            const linkedPathsByIndex = new Map();
            arrayInput.on('linkElement', (element, index, path) => {
                linkedPathsByIndex.set(index, path);
            });

            // Link to single observer with multiple paths (e.g., for curves)
            arrayInput.link([observer], ['path1', 'path2']);

            // For single observer with multiple paths, should create array of paths
            strictEqual(linkedPathsByIndex.size, 2); // 2 unique element indices
            for (const [index, path] of linkedPathsByIndex) {
                strictEqual(Array.isArray(path), true, `Path for index ${index} should be an array`);
                strictEqual(path.length, 2);
                strictEqual(path[0], `path1.${index}`);
                strictEqual(path[1], `path2.${index}`);
            }

            document.body.removeChild(arrayInput.dom);
            arrayInput.destroy();
        });

        it('reads values from multiple observers into internal state', () => {
            // Create two observers with different array values
            const observer1 = new Observer({ myArray: [1, 2, 3] });
            const observer2 = new Observer({ myArray: [4, 5, 6] });

            const arrayInput = new ArrayInput({
                type: 'number',
                binding: new BindingTwoWay()
            });

            document.body.appendChild(arrayInput.dom);

            // Link to multiple observers
            arrayInput.link([observer1, observer2], 'myArray');

            // Verify that the observers still have their original values
            // (linking should not modify the observers)
            deepStrictEqual(observer1.get('myArray'), [1, 2, 3]);
            deepStrictEqual(observer2.get('myArray'), [4, 5, 6]);

            document.body.removeChild(arrayInput.dom);
            arrayInput.destroy();
        });
    });
});
