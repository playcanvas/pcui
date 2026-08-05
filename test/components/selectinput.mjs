import { strictEqual } from 'assert';
import { describe, it } from 'node:test';

import 'global-jsdom/register'

import { SelectInput } from '../../dist/module/src/components/SelectInput/index.mjs';

describe('SelectInput', () => {
    it('compares fallback values without coercion', () => {
        const input = new SelectInput({
            type: 'number',
            value: 1,
            options: [
                { v: 1, t: 'one' },
                { v: 2, t: 'two' }
            ],
            fallbackOrder: ['1', '2'],
            disabledOptions: { 1: 'disabled' }
        });

        strictEqual(input._value, '1');
    });

    it('uses custom equality for multi-select values', () => {
        const next = {};
        let receiver;
        let compared;
        const value = {
            equals(other) {
                receiver = this;
                compared = other;
                return true;
            }
        };
        const input = new SelectInput({ multiSelect: true, type: 'custom', value });

        input.value = next;

        strictEqual(receiver, value);
        strictEqual(compared, next);
        strictEqual(input._value, value);
    });
});
