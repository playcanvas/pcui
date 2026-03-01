import { describe, it } from 'node:test';
import { strictEqual } from 'assert';

import 'global-jsdom/register';

import { TreeView } from '../../dist/module/src/components/TreeView/index.mjs';
import { TreeViewItem } from '../../dist/module/src/components/TreeViewItem/index.mjs';

/**
 * Helper to build a small tree:
 *   root
 *   ├── child1
 *   │   ├── grandchild1
 *   │   └── grandchild2
 *   └── child2
 */
function buildTree() {
    const treeView = new TreeView();
    const root = new TreeViewItem({ text: 'root', open: false });
    const child1 = new TreeViewItem({ text: 'child1', open: false });
    const child2 = new TreeViewItem({ text: 'child2', open: false });
    const grandchild1 = new TreeViewItem({ text: 'grandchild1' });
    const grandchild2 = new TreeViewItem({ text: 'grandchild2' });

    child1.append(grandchild1);
    child1.append(grandchild2);
    root.append(child1);
    root.append(child2);
    treeView.append(root);

    return { treeView, root, child1, child2, grandchild1, grandchild2 };
}

describe('TreeView', () => {
    describe('selection and focus', () => {
        it('should not move focus when setting selected programmatically', () => {
            const { treeView, root, child1 } = buildTree();
            document.body.appendChild(treeView.dom);

            root.focus();
            strictEqual(document.activeElement, root._containerContents.dom);

            child1.selected = true;
            strictEqual(child1.selected, true);
            strictEqual(document.activeElement, root._containerContents.dom);

            document.body.removeChild(treeView.dom);
        });

        it('should move focus with ArrowDown', () => {
            const { treeView, root, child1 } = buildTree();
            document.body.appendChild(treeView.dom);

            treeView.expandAll();
            root.selected = true;
            root.focus();

            root._containerContents.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
            strictEqual(child1.selected, true);
            strictEqual(document.activeElement, child1._containerContents.dom);

            document.body.removeChild(treeView.dom);
        });

        it('should move focus with ArrowUp', () => {
            const { treeView, root, child1 } = buildTree();
            document.body.appendChild(treeView.dom);

            treeView.expandAll();
            child1.selected = true;
            child1.focus();

            child1._containerContents.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
            strictEqual(root.selected, true);
            strictEqual(document.activeElement, root._containerContents.dom);

            document.body.removeChild(treeView.dom);
        });

        it('should move focus with ArrowRight into first child', () => {
            const { treeView, child1, grandchild1 } = buildTree();
            document.body.appendChild(treeView.dom);

            treeView.expandAll();
            child1.selected = true;
            child1.focus();

            child1._containerContents.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
            strictEqual(grandchild1.selected, true);
            strictEqual(document.activeElement, grandchild1._containerContents.dom);

            document.body.removeChild(treeView.dom);
        });

        it('should move focus with ArrowLeft to parent', () => {
            const { treeView, child1, grandchild1 } = buildTree();
            document.body.appendChild(treeView.dom);

            treeView.expandAll();
            grandchild1.selected = true;
            grandchild1.focus();

            grandchild1._containerContents.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
            strictEqual(child1.selected, true);
            strictEqual(document.activeElement, child1._containerContents.dom);

            document.body.removeChild(treeView.dom);
        });

        it('should collapse without moving focus on ArrowLeft when item is expanded', () => {
            const { treeView, child1 } = buildTree();
            document.body.appendChild(treeView.dom);

            treeView.expandAll();
            child1.selected = true;
            child1.focus();
            strictEqual(child1.open, true);

            child1._containerContents.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
            strictEqual(child1.open, false);
            strictEqual(child1.selected, true);
            strictEqual(document.activeElement, child1._containerContents.dom);

            document.body.removeChild(treeView.dom);
        });
    });

    describe('roving tabindex', () => {
        it('should have exactly one item with tabIndex=0', () => {
            const { treeView, root } = buildTree();
            document.body.appendChild(treeView.dom);

            const tabStops = treeView.dom.querySelectorAll('[tabindex="0"]');
            strictEqual(tabStops.length, 1);
            strictEqual(tabStops[0], root._containerContents.dom);

            document.body.removeChild(treeView.dom);
        });

        it('should move tabIndex=0 to the focused item on arrow navigation', () => {
            const { treeView, root, child1 } = buildTree();
            document.body.appendChild(treeView.dom);

            treeView.expandAll();
            root.selected = true;
            root.focus();

            root._containerContents.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

            strictEqual(root._containerContents.dom.tabIndex, -1);
            strictEqual(child1._containerContents.dom.tabIndex, 0);
            strictEqual(treeView.dom.querySelectorAll('[tabindex="0"]').length, 1);

            document.body.removeChild(treeView.dom);
        });

        it('should update active item when an item is selected', () => {
            const { treeView, root, child1 } = buildTree();
            document.body.appendChild(treeView.dom);

            treeView.expandAll();
            strictEqual(root._containerContents.dom.tabIndex, 0);

            child1.selected = true;
            strictEqual(child1._containerContents.dom.tabIndex, 0);
            strictEqual(root._containerContents.dom.tabIndex, -1);

            document.body.removeChild(treeView.dom);
        });

        it('should reassign active item when the active item is removed', () => {
            const { treeView, root, child1 } = buildTree();
            document.body.appendChild(treeView.dom);

            treeView.expandAll();
            strictEqual(root._containerContents.dom.tabIndex, 0);

            treeView.remove(root);

            const tabStops = treeView.dom.querySelectorAll('[tabindex="0"]');
            strictEqual(tabStops.length, 0);

            document.body.removeChild(treeView.dom);
        });

        it('should select the item when focus enters from outside via keyboard', () => {
            const { treeView, root } = buildTree();
            document.body.appendChild(treeView.dom);

            strictEqual(root.selected, false);

            // Simulate keyboard Tab-in by focusing and dispatching focusin.
            // jsdom's :focus-visible heuristic is unreliable across tests,
            // so we stub matches() to return true for the duration.
            const contentDom = root._containerContents.dom;
            const origMatches = contentDom.matches.bind(contentDom);
            contentDom.matches = (sel) => sel === ':focus-visible' ? true : origMatches(sel);
            contentDom.focus();
            contentDom.matches = origMatches;

            strictEqual(root.selected, true);

            document.body.removeChild(treeView.dom);
        });
    });

    describe('#expandAll', () => {
        it('should open every item in the tree', () => {
            const { treeView, root, child1, grandchild1, grandchild2 } = buildTree();

            treeView.expandAll();

            strictEqual(root.open, true);
            strictEqual(child1.open, true);
            strictEqual(grandchild1.open, true);
            strictEqual(grandchild2.open, true);
        });
    });

    describe('#collapseAll', () => {
        it('should close every item in the tree', () => {
            const { treeView, root, child1 } = buildTree();

            treeView.expandAll();
            treeView.collapseAll();

            strictEqual(root.open, false);
            strictEqual(child1.open, false);
        });
    });

    describe('#traverse', () => {
        it('should visit every item depth-first', () => {
            const { treeView, root, child1, child2, grandchild1, grandchild2 } = buildTree();

            const visited = [];
            treeView.traverse((item) => {
                visited.push(item.text);
            });

            strictEqual(visited.length, 5);
            strictEqual(visited[0], 'root');
            strictEqual(visited[1], 'child1');
            strictEqual(visited[2], 'grandchild1');
            strictEqual(visited[3], 'grandchild2');
            strictEqual(visited[4], 'child2');
        });

        it('should visit nothing on an empty tree', () => {
            const treeView = new TreeView();
            const visited = [];
            treeView.traverse((item) => {
                visited.push(item);
            });

            strictEqual(visited.length, 0);
        });
    });
});
