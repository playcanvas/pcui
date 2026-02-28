import { describe, it } from 'node:test';
import { strictEqual } from 'assert';

import 'global-jsdom/register';

import { GridView } from '../../dist/module/src/components/GridView/index.mjs';
import { GridViewItem } from '../../dist/module/src/components/GridViewItem/index.mjs';

function buildGrid() {
    const gridView = new GridView();
    const item1 = new GridViewItem({ text: 'item1' });
    const item2 = new GridViewItem({ text: 'item2' });
    const item3 = new GridViewItem({ text: 'item3' });

    gridView.append(item1);
    gridView.append(item2);
    gridView.append(item3);

    return { gridView, item1, item2, item3 };
}

describe('GridView', () => {
    describe('selection and focus', () => {
        it('should not move focus when setting selected programmatically', () => {
            const { gridView, item1, item2 } = buildGrid();
            document.body.appendChild(gridView.dom);

            item1.focus();
            strictEqual(document.activeElement, item1.dom);

            item2.selected = true;
            strictEqual(item2.selected, true);
            strictEqual(document.activeElement, item1.dom);

            document.body.removeChild(gridView.dom);
        });

        it('should move focus on arrow key navigation', () => {
            const { gridView, item1, item2 } = buildGrid();
            document.body.appendChild(gridView.dom);

            item1.selected = true;
            item1.focus();

            item1.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
            strictEqual(item2.selected, true);
            strictEqual(document.activeElement, item2.dom);

            document.body.removeChild(gridView.dom);
        });
    });
});
