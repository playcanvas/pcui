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
