import { strictEqual } from 'assert';
import { describe, it } from 'node:test';

import 'global-jsdom/register'

import { Container } from '../../dist/module/src/components/Container/index.mjs';

describe('Container', () => {
    it('reads legacy DOM properties directly', () => {
        const dom = document.createElement('div');
        const element = new Proxy(
            { dom },
            {
                has() {
                    throw new Error('unexpected property existence check');
                }
            }
        );

        strictEqual(new Container()._getDomFromElement(element), dom);
    });
});
