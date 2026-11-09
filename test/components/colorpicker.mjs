import { describe, it } from 'node:test';
import { deepStrictEqual, strictEqual } from 'assert';

import '../../utils/jsdom-globals.mjs';

import { ColorPicker } from '../../dist/module/src/components/ColorPicker/index.mjs';

// the first child of the root element is the swatch that displays the current color
const swatchColor = colorPicker => colorPicker.dom.firstElementChild.style.backgroundColor;

describe('ColorPicker', () => {
    it('constructor: no args defaults to black', () => {
        const colorPicker = new ColorPicker();

        deepStrictEqual(colorPicker.value, [0, 0, 0]);
        strictEqual(swatchColor(colorPicker), 'rgb(0, 0, 0)');
    });

    it('constructor: 4 channels defaults to opaque black', () => {
        const colorPicker = new ColorPicker({ channels: 4 });

        deepStrictEqual(colorPicker.value, [0, 0, 0, 1]);
        strictEqual(swatchColor(colorPicker), 'rgb(0, 0, 0)');
    });

    it('constructor: value channels are in the range 0 to 1', () => {
        const colorPicker = new ColorPicker({ value: [1, 0.5, 0, 1] });

        deepStrictEqual(colorPicker.value, [1, 0.5, 0]);
        strictEqual(swatchColor(colorPicker), 'rgb(255, 127, 0)');
    });
});
