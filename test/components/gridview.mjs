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

        it('should move focus with ArrowRight', () => {
            const { gridView, item1, item2 } = buildGrid();
            document.body.appendChild(gridView.dom);

            item1.selected = true;
            item1.focus();

            item1.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
            strictEqual(item2.selected, true);
            strictEqual(document.activeElement, item2.dom);

            document.body.removeChild(gridView.dom);
        });

        it('should move focus with ArrowLeft', () => {
            const { gridView, item2, item1 } = buildGrid();
            document.body.appendChild(gridView.dom);

            item2.selected = true;
            item2.focus();

            item2.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
            strictEqual(item1.selected, true);
            strictEqual(document.activeElement, item1.dom);

            document.body.removeChild(gridView.dom);
        });
    });

    describe('roving tabindex', () => {
        it('should have exactly one item with tabIndex=0', () => {
            const { gridView, item1 } = buildGrid();
            document.body.appendChild(gridView.dom);

            const tabStops = gridView.dom.querySelectorAll('[tabindex="0"]');
            strictEqual(tabStops.length, 1);
            strictEqual(tabStops[0], item1.dom);

            document.body.removeChild(gridView.dom);
        });

        it('should move tabIndex=0 to the focused item on arrow navigation', () => {
            const { gridView, item1, item2 } = buildGrid();
            document.body.appendChild(gridView.dom);

            item1.selected = true;
            item1.focus();

            item1.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

            strictEqual(item1.dom.tabIndex, -1);
            strictEqual(item2.dom.tabIndex, 0);
            strictEqual(gridView.dom.querySelectorAll('[tabindex="0"]').length, 1);

            document.body.removeChild(gridView.dom);
        });

        it('should update active item when an item is selected', () => {
            const { gridView, item1, item2 } = buildGrid();
            document.body.appendChild(gridView.dom);

            strictEqual(item1.dom.tabIndex, 0);

            item2.selected = true;
            strictEqual(item2.dom.tabIndex, 0);
            strictEqual(item1.dom.tabIndex, -1);

            document.body.removeChild(gridView.dom);
        });

        it('should reassign active item when the active item is removed', () => {
            const { gridView, item1, item2 } = buildGrid();
            document.body.appendChild(gridView.dom);

            strictEqual(item1.dom.tabIndex, 0);

            gridView.remove(item1);
            strictEqual(item2.dom.tabIndex, 0);
            strictEqual(gridView.dom.querySelectorAll('[tabindex="0"]').length, 1);

            document.body.removeChild(gridView.dom);
        });

        it('should select the item when focus enters from outside via keyboard', () => {
            const { gridView, item1 } = buildGrid();
            document.body.appendChild(gridView.dom);

            strictEqual(item1.selected, false);

            // Simulate keyboard Tab-in by focusing and dispatching focusin.
            // jsdom's :focus-visible heuristic is unreliable across tests,
            // so we stub matches() to return true for the duration.
            const origMatches = item1.dom.matches.bind(item1.dom);
            item1.dom.matches = (sel) => sel === ':focus-visible' ? true : origMatches(sel);
            item1.focus();
            item1.dom.matches = origMatches;

            strictEqual(item1.selected, true);

            document.body.removeChild(gridView.dom);
        });
    });
});
