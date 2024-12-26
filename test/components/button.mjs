import { describe, it } from 'node:test';
import { strictEqual } from 'assert';

import 'global-jsdom/register'

import { Button } from '../../dist/module/src/components/Button/index.mjs';

describe('Button', () => {
    it('constructor: no args', () => {
        const button = new Button();

        strictEqual(button.class.length, 3);
        strictEqual(button.class.contains('font-regular'), true);
        strictEqual(button.class.contains('pcui-button'), true);
        strictEqual(button.class.contains('pcui-element'), true);

        strictEqual(button.text, undefined);
        strictEqual(button.size, undefined);
        strictEqual(button.icon, undefined);
    });

    it('click event', () => {
        const button = new Button();

        let clicked = false;
        button.on('click', () => {
            clicked = true;
        });

        button.dom.dispatchEvent(new MouseEvent('click'));

        strictEqual(clicked, true);
    });
});
