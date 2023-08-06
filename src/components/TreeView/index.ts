import Container, { ContainerArgs } from '../Container';
import Element from '../Element';
import TreeViewItem from '../TreeViewItem';
import { searchItems } from '../../helpers/search';

const CLASS_ROOT = 'pcui-treeview';
const CLASS_DRAGGED_ITEM = CLASS_ROOT + '-item-dragged';
const CLASS_DRAGGED_HANDLE = CLASS_ROOT + '-drag-handle';
const CLASS_FILTERING = CLASS_ROOT + '-filtering';
const CLASS_FILTER_RESULT = CLASS_FILTERING + '-result';

const DRAG_AREA_INSIDE = 'inside';
const DRAG_AREA_BEFORE = 'before';
const DRAG_AREA_AFTER = 'after';

/**
 * The arguments for the {@link TreeView} constructor.
 */
export interface TreeViewArgs extends ContainerArgs {
    /**
     * Whether dragging a {@link TreeViewItem} is allowed. Defaults to `true`.
     */
    allowDrag?: boolean,
    /**
     * Whether reordering {@link TreeViewItem}s is allowed. Defaults to `true`.
     */
    allowReordering?: boolean,
    /**
     * Whether renaming {@link TreeViewItem}s is allowed by double clicking on them. Defaults to `false`.
     */
    allowRenaming?: boolean,
    /**
     * A filter that searches {@link TreeViewItem}s and only shows the ones that are relevant to the filter.
     */
    filter?: string,
    /**
     * A function to be called when we right click on a {@link TreeViewItem}.
     */
    onContextMenu?: (evt: MouseEvent, item: TreeViewItem) => void,
    /**
     * A function to be called when we try to reparent tree items. If a function is provided then the
     * tree items will not be reparented by the {@link TreeView} but instead will rely on the function to
     * reparent them as it sees fit.
     */
    onReparent?: any,
    /**
     * The element to scroll on drag. Defaults to this {@link TreeView}'s DOM element.
     */
    dragScrollElement?: HTMLElement
}

/**
 * A container that can show a TreeView like a hierarchy. The TreeView contains
 * {@link TreeViewItem}s.
 */
class TreeView extends Container {
    /**
     * Fired when user starts dragging selected TreeViewItems.
     *
     * @event
     * @example
     * ```ts
     * const treeView = new TreeView({
     *     allowDrag: true // this is the default but we're showing it here for clarity
     * });
     * treeView.on('dragstart', (items) => {
     *     console.log(`Drag started of ${items.length} items');
     * });
     * ```
     */
    public static readonly EVENT_DRAGSTART = 'dragstart';

    /**
     * Fired when user stops dragging selected TreeViewItems.
     *
     * @event
     * @example
     * ```ts
     * const treeView = new TreeView({
     *     allowDrag: true // this is the default but we're showing it here for clarity
     * });
     * treeView.on('dragend', () => {
     *     console.log('Drag ended');
     * });
     * ```
     */
    public static readonly EVENT_DRAGEND = 'dragend';

    /**
     * Fired when user reparents TreeViewItems.
     *
     * @event
     * @example
     * ```ts
     * const treeView = new TreeView();
     * treeView.on('reparent', (reparented: { item: TreeViewItem; oldParent: Element; }[]) => {
     *     console.log(`Reparented ${reparented.length} items`);
     * });
     * ```
     */
    public static readonly EVENT_REPARENT = 'reparent';

    /**
     * Fired when user selects a TreeViewItem.
     *
     * @event
     * @example
     * ```ts
     * const treeView = new TreeView();
     * treeView.on('select', (item: TreeViewItem) => {
     *     console.log(`Selected item ${item.text}`);
     * });
     * ```
     */
    public static readonly EVENT_SELECT = 'select';

    /**
     * Fired when user deselects a TreeViewItem.
     *
     * @event
     * @example
     * ```ts
     * const treeView = new TreeView();
     * treeView.on('deselect', (item: TreeViewItem) => {
     *     console.log(`Deselected item ${item.text}`);
     * });
     * ```
     */
    public static readonly EVENT_DESELECT = 'deselect';

    /**
     * Fired when user renames a TreeViewItem.
     *
     * @event
     * @example
     * ```ts
     * const treeView = new TreeView();
     * treeView.on('rename', (item: TreeViewItem, name: string) => {
     *     console.log(`Renamed item to ${name}`);
     * });
     * ```
     */
    public static readonly EVENT_RENAME = 'rename';

    protected _selectedItems: TreeViewItem[] = [];

    protected _dragItems: TreeViewItem[] = [];

    protected _allowDrag: boolean;

    protected _allowReordering: boolean;

    protected _allowRenaming: boolean;

    protected _dragging = false;

    protected _dragOverItem: TreeViewItem = null;

    protected _dragArea = DRAG_AREA_INSIDE;

    protected _dragScroll = 0;

    protected _dragScrollInterval: number = null;

    protected _dragHandle: Element;

    protected _dragScrollElement: any;

    protected _onContextMenu: (evt: MouseEvent, item: TreeViewItem) => void;

    protected _onReparentFn: any;

    protected _pressedCtrl = false;

    protected _pressedShift = false;

    protected _filter: string = null;

    protected _filterResults: TreeViewItem[] = [];

    protected _wasDraggingAllowedBeforeFiltering: boolean;

    /**
     * Creates a new TreeView.
     *
     * @param args - The arguments.
     */
    constructor(args: Readonly<TreeViewArgs> = {}) {
        super(args);

        this.class.add(CLASS_ROOT);

        this._allowDrag = args.allowDrag ?? true;
        this._allowReordering = args.allowReordering ?? true;
        this._allowRenaming = args.allowRenaming ?? false;
        this._dragHandle = new Element({
            class: CLASS_DRAGGED_HANDLE
        });
        this._dragScrollElement = args.dragScrollElement || this;
        this.append(this._dragHandle);

        this._onContextMenu = args.onContextMenu;
        this._onReparentFn = args.onReparent;

        this._wasDraggingAllowedBeforeFiltering = this._allowDrag;

        window.addEventListener('keydown', this._updateModifierKeys);
        window.addEventListener('keyup', this._updateModifierKeys);
        window.addEventListener('mousedown', this._updateModifierKeys);

        this.dom.addEventListener('mouseleave', this._onMouseLeave);

        this._dragHandle.dom.addEventListener('mousemove', this._onDragMove);
        this._dragHandle.on('destroy', (dom) => {
            dom.removeEventListener('mousemove', this._onDragMove);
        });
    }

    destroy() {
        if (this._destroyed) return;

        window.removeEventListener('keydown', this._updateModifierKeys);
        window.removeEventListener('keyup', this._updateModifierKeys);
        window.removeEventListener('mousedown', this._updateModifierKeys);
        window.removeEventListener('mousemove', this._onMouseMove);

        this.dom.removeEventListener('mouseleave', this._onMouseLeave);

        if (this._dragScrollInterval) {
            window.clearInterval(this._dragScrollInterval);
            this._dragScrollInterval = null;
        }

        super.destroy();
    }

    protected _updateModifierKeys = (evt: KeyboardEvent) => {
        this._pressedCtrl = evt.ctrlKey || evt.metaKey;
        this._pressedShift = evt.shiftKey;
    };

    /**
     * Finds the next tree item that is not currently hidden.
     *
     * @param currentItem - The current tree item.
     * @returns The next visible tree item.
     */
    protected _findNextVisibleTreeItem(currentItem: TreeViewItem): TreeViewItem {
        if (currentItem.numChildren > 0 && currentItem.open) {
            return currentItem.firstChild;
        }

        const sibling = currentItem.nextSibling;
        if (sibling) return sibling;

        let parent = currentItem.parent;
        if (!(parent instanceof TreeViewItem)) return null;

        let parentSibling = parent.nextSibling;
        while (!parentSibling) {
            parent = parent.parent;
            if (!(parent instanceof TreeViewItem)) {
                break;
            }

            parentSibling = parent.nextSibling;
        }

        return parentSibling;
    }

    /**
     * Finds the last visible child tree item of the specified tree item.
     *
     * @param currentItem - The current item.
     * @returns The last child item.
     */
    protected _findLastVisibleChildTreeItem(currentItem: TreeViewItem) {
        if (!currentItem.numChildren || !currentItem.open) return null;

        let lastChild = currentItem.lastChild;
        while (lastChild && lastChild.numChildren && lastChild.open) {
            lastChild = lastChild.lastChild;
        }

        return lastChild;
    }

    /**
     * Finds the previous visible tree item of the specified tree item.
     *
     * @param currentItem - The current tree item.
     * @returns The previous item.
     */
    protected _findPreviousVisibleTreeItem(currentItem: TreeViewItem) {
        const sibling = currentItem.previousSibling;
        if (sibling) {
            if (sibling.numChildren > 0 && sibling.open)  {
                return this._findLastVisibleChildTreeItem(sibling);
            }

            return sibling;
        }

        const parent = currentItem.parent;
        if (!(parent instanceof TreeViewItem)) return null;

        return parent;
    }

    /**
     * Gets the visible tree items between the specified start and end tree items.
     *
     * @param startChild - The start tree item.
     * @param endChild - The end tree item.
     */
    protected _getChildrenRange(startChild: TreeViewItem, endChild: TreeViewItem): TreeViewItem[] {
        const result = [];

        // select search results if we are currently filtering tree view items
        if (this._filterResults.length) {
            const filterResults = this.dom.querySelectorAll(`.${CLASS_ROOT}-item.${CLASS_FILTER_RESULT}`);

            let startIndex = -1;
            let endIndex = -1;

            for (let i = 0; i < filterResults.length; i++) {
                const item = filterResults[i].ui;

                if (item === startChild) {
                    startIndex = i;
                } else if (item === endChild) {
                    endIndex = i;
                }

                if (startIndex !== -1 && endIndex !== -1) {
                    const start = (startIndex < endIndex ? startIndex : endIndex);
                    const end = (startIndex < endIndex ? endIndex : startIndex);
                    for (let j = start; j <= end; j++) {
                        result.push(filterResults[j].ui as TreeViewItem);
                    }

                    break;
                }
            }
        } else {
            // if we are not filtering the tree view then find the next visible tree item
            let current = startChild;

            const rectStart = startChild.dom.getBoundingClientRect();
            const rectEnd = endChild.dom.getBoundingClientRect();

            if (rectStart.top < rectEnd.top) {
                while (current && current !== endChild) {
                    current = this._findNextVisibleTreeItem(current);
                    if (current && current !== endChild) {
                        result.push(current);
                    }
                }
            } else {
                while (current && current !== endChild) {
                    current = this._findPreviousVisibleTreeItem(current);
                    if (current && current !== endChild) {
                        result.push(current);
                    }
                }
            }

            result.push(endChild);

        }

        return result;
    }

    protected _onAppendChild(element: Element) {
        super._onAppendChild(element);

        if (element instanceof TreeViewItem) {
            this._onAppendTreeViewItem(element);
        }
    }

    protected _onRemoveChild(element: Element) {
        if (element instanceof TreeViewItem) {
            this._onRemoveTreeViewItem(element);
        }

        super._onRemoveChild(element);
    }

    protected _onAppendTreeViewItem(item: TreeViewItem) {
        item.treeView = this;

        if (this._filter) {
            // add new item to filtered results if it
            // satisfies the current filter
            this._searchItems([[item.text, item]], this._filter);
        }

        // do the same for all children of the element
        item.forEachChild((child) => {
            if (child instanceof TreeViewItem) {
                this._onAppendTreeViewItem(child);
            }
        });
    }

    protected _onRemoveTreeViewItem(item: TreeViewItem) {
        item.selected = false;

        // do the same for all children of the element
        item.forEachChild((child) => {
            if (child instanceof TreeViewItem) {
                this._onRemoveTreeViewItem(child);
            }
        });
    }

    // Called when a key is down on a child TreeViewItem.
    protected _onChildKeyDown(evt: KeyboardEvent, item: TreeViewItem) {
        if (['Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(evt.key) === -1) return;

        evt.preventDefault();
        evt.stopPropagation();

        if (evt.key === 'ArrowDown') {
            // select next tree item
            if (this._selectedItems.length) {
                const next = this._findNextVisibleTreeItem(item);
                if (next) {
                    if (this._pressedShift || this._pressedCtrl) {
                        next.selected = true;
                    } else {
                        this._selectSingleItem(next);
                    }
                }
            }
        } else if (evt.key === 'ArrowUp') {
            // select previous tree item
            if (this._selectedItems.length) {
                const prev = this._findPreviousVisibleTreeItem(item);
                if (prev) {
                    if (this._pressedShift || this._pressedCtrl) {
                        prev.selected = true;
                    } else {
                        this._selectSingleItem(prev);
                    }
                }
            }

        } else if (evt.key === 'ArrowLeft') {
            // close selected tree item
            if (item.parent !== this) {
                item.open = false;
            }
        } else if (evt.key === 'ArrowRight') {
            // open selected tree item
            item.open = true;
        } else if (evt.key === 'Tab') {
            // tab
            // skip
        }
    }

    // Called when we click on a child TreeViewItem
    protected _onChildClick(evt: MouseEvent, item: TreeViewItem) {
        if (evt.button !== 0) return;
        if (!item.allowSelect) return;

        if (this._pressedCtrl) {
            // toggle selection when Ctrl is pressed
            item.selected = !item.selected;
        } else if (this._pressedShift) {
            // on shift add to selection
            if (!this._selectedItems.length || this._selectedItems.length === 1 && this._selectedItems[0] === item) {
                item.selected = true;
                return;
            }

            const selected = this._selectedItems[this._selectedItems.length - 1];
            this._openHierarchy(selected);

            const children = this._getChildrenRange(selected, item);
            children.forEach((child) => {
                if (child.allowSelect) {
                    child.selected = true;
                }
            });

        } else {
            // deselect other items
            this._selectSingleItem(item);
        }
    }

    /**
     * Call specified function on every child TreeViewItem by traversing the hierarchy depth first.
     *
     * @param fn - The function to call. The function takes the TreeViewItem as an argument.
     */
    protected _traverseDepthFirst(fn: (item: TreeViewItem) => void) {
        function traverse(item: Element) {
            if (!item || !(item instanceof TreeViewItem)) return;

            fn(item);

            if (item.numChildren) {
                for (const child of item.dom.childNodes) {
                    traverse(child.ui);
                }
            }
        }

        for (const child of this.dom.childNodes) {
            traverse(child.ui);
        }
    }

    /**
     * Do a depth first traversal of all tree items
     * and assign an order to them so that we know which one
     * is above the other. Performance wise this means it traverses
     * all tree items every time however seems to be pretty fast even with 15 - 20 K entities.
     */
    protected _getTreeOrder(): Map<TreeViewItem, number> {
        const treeOrder = new Map<TreeViewItem, number>();
        let order = 0;

        this._traverseDepthFirst((item: TreeViewItem) => {
            treeOrder.set(item, order++);
        });

        return treeOrder;
    }

    protected _getChildIndex(item: TreeViewItem, parent: TreeViewItem) {
        return Array.prototype.indexOf.call(parent.dom.childNodes, item.dom) - 1;
    }

    // Called when we start dragging a TreeViewItem.
    protected _onChildDragStart(evt: MouseEvent, item: TreeViewItem) {
        if (!this.allowDrag || this._dragging) return;

        this._dragItems = [];

        if (this._selectedItems.indexOf(item) !== -1) {
            const dragged = [];

            // check that all selected items to be dragged are
            // at the same depth from the root
            let desiredDepth = -1;
            for (let i = 0; i < this._selectedItems.length; i++) {
                let parent = this._selectedItems[i].parent;
                let depth = 0;
                let isChild = false;
                while (parent && parent instanceof TreeViewItem) {
                    // if parent is already in dragged items then skip
                    // depth calculation for this item
                    if (this._selectedItems.indexOf(parent) !== -1) {
                        isChild = true;
                        break;
                    }

                    depth++;
                    parent = parent.parent;
                }

                if (!isChild) {
                    if (desiredDepth === -1) {
                        desiredDepth = depth;
                    } else if (desiredDepth !== depth) {
                        return;
                    }

                    dragged.push(this._selectedItems[i]);
                }
            }

            // add dragged class to each item
            this._dragItems = dragged;
        } else {
            item.class.add(CLASS_DRAGGED_ITEM);
            this._dragItems.push(item);
        }

        if (this._dragItems.length) {
            this._dragItems.forEach((item) => {
                item.class.add(CLASS_DRAGGED_ITEM);
            });

            this.isDragging = true;

            this.emit('dragstart', this._dragItems.slice());
        }
    }

    // Called when we stop dragging a TreeViewItem.
    protected _onChildDragEnd(evt: MouseEvent, item: TreeViewItem) {
        if (!this.allowDrag || !this._dragging) return;

        this._dragItems.forEach(item => item.class.remove(CLASS_DRAGGED_ITEM));

        // if the root is being dragged then
        // do not allow reparenting because we do not
        // want to reparent the root
        let isRootDragged = false;
        for (let i = 0; i < this._dragItems.length; i++) {
            if (this._dragItems[i].parent === this)  {
                isRootDragged = true;
                break;
            }
        }

        if (!isRootDragged && this._dragOverItem) {
            if (this._dragItems.length > 1) {
                // sort items based on order in the hierarchy
                const treeOrder = this._getTreeOrder();
                this._dragItems.sort((a, b) => {
                    return treeOrder.get(a) - treeOrder.get(b);
                });
            }

            if (this._dragItems.length) {
                // reparent items
                const reparented: any[] = [];

                // if we do not have _onReparentFn then reparent all the dragged items
                // in the DOM
                if (!this._onReparentFn) {
                    // first remove all items from their parent
                    this._dragItems.forEach((item) => {
                        if (item.parent === this._dragOverItem && this._dragArea === DRAG_AREA_INSIDE) return;

                        reparented.push({
                            item: item,
                            oldParent: item.parent
                        });
                        (item.parent as Container).remove(item);
                    });

                    // now reparent items
                    reparented.forEach((r, i) => {
                        if (this._dragArea === DRAG_AREA_BEFORE) {
                            // If dragged before a TreeViewItem...
                            r.newParent = this._dragOverItem.parent as Container;
                            r.newParent.appendBefore(r.item, this._dragOverItem);
                            r.newChildIndex = this._getChildIndex(r.item, r.newParent);
                        } else if (this._dragArea === DRAG_AREA_INSIDE) {
                            // If dragged inside a TreeViewItem...
                            r.newParent = this._dragOverItem;
                            r.newParent.append(r.item);
                            r.newParent.open = true;
                            r.newChildIndex = this._getChildIndex(r.item, r.newParent);
                        } else if (this._dragArea === DRAG_AREA_AFTER) {
                            // If dragged after a TreeViewItem...
                            r.newParent = this._dragOverItem.parent as Container;
                            r.newParent.appendAfter(r.item, i > 0 ? reparented[i - 1].item : this._dragOverItem);
                            r.newChildIndex = this._getChildIndex(r.item, r.newParent);
                        }
                    });

                } else {
                    // if we have an _onReparentFn then we will not perform the reparenting here
                    // but will instead calculate the new indexes and pass that data to the reparent function
                    // to perform the reparenting

                    const fakeDom: { parent: TreeViewItem; children: ChildNode[]; }[] = [];

                    const getChildren = (treeviewItem: TreeViewItem) => {
                        let idx = fakeDom.findIndex(entry => entry.parent === treeviewItem);
                        if (idx === -1) {
                            fakeDom.push({ parent: treeviewItem, children: [...treeviewItem.dom.childNodes] });
                            idx = fakeDom.length - 1;
                        }

                        return fakeDom[idx].children;
                    };

                    this._dragItems.forEach((item) => {
                        if (item.parent === this._dragOverItem && this._dragArea === DRAG_AREA_INSIDE) return;

                        reparented.push({
                            item: item,
                            oldParent: item.parent
                        });

                        // add array of parent's child nodes to fakeDom array
                        const parentChildren = getChildren(item.parent as TreeViewItem);

                        // remove this item from the children array in fakeDom
                        const childIdx = parentChildren.indexOf(item.dom);
                        parentChildren.splice(childIdx, 1);
                    });

                    // now reparent items
                    reparented.forEach((r, i) => {
                        if (this._dragArea === DRAG_AREA_BEFORE) {
                            // If dragged before a TreeViewItem...
                            r.newParent = this._dragOverItem.parent;
                            const parentChildren = getChildren(this._dragOverItem.parent as TreeViewItem);
                            const index = parentChildren.indexOf(this._dragOverItem.dom);
                            parentChildren.splice(index, 0, r.item.dom);
                            r.newChildIndex = index;
                        } else if (this._dragArea === DRAG_AREA_INSIDE) {
                            // If dragged inside a TreeViewItem...
                            r.newParent = this._dragOverItem;
                            const parentChildren = getChildren(this._dragOverItem);
                            parentChildren.push(r.item.dom);
                            r.newChildIndex = parentChildren.length - 1;
                        } else if (this._dragArea === DRAG_AREA_AFTER) {
                            // If dragged after a TreeViewItem...
                            r.newParent = this._dragOverItem.parent;
                            const parentChildren = getChildren(this._dragOverItem.parent as TreeViewItem);
                            const after = i > 0 ? reparented[i - 1].item : this._dragOverItem;
                            const index = parentChildren.indexOf(after.dom);
                            parentChildren.splice(index + 1, 0, r.item.dom);
                            r.newChildIndex = index + 1;
                        }

                        // subtract 1 from new child index to account for the extra node that
                        // each tree view item has inside
                        r.newChildIndex--;
                    });
                }

                if (reparented.length) {
                    if (this._onReparentFn) {
                        this._onReparentFn(reparented);
                    }

                    this.emit('reparent', reparented);
                }
            }
        }

        this._dragItems = [];

        this.isDragging = false;

        this.emit('dragend');
    }

    // Called when we drag over a TreeViewItem.
    protected _onChildDragOver(evt: MouseEvent, item: TreeViewItem) {
        if (!this._allowDrag || !this._dragging) return;

        if (item.allowDrop && this._dragItems.indexOf(item) === -1) {
            this._dragOverItem = item;
        } else {
            this._dragOverItem = null;
        }

        this._updateDragHandle();
        this._onDragMove(evt);
    }

    // Called when the mouse cursor leaves the tree view.
    protected _onMouseLeave = (evt: MouseEvent) => {
        if (!this._allowDrag || !this._dragging) return;

        this._dragOverItem = null;
        this._updateDragHandle();
    };

    // Called when the mouse moves while dragging
    protected _onMouseMove = (evt: MouseEvent) => {
        if (!this._dragging) return;

        // Determine if we need to scroll the treeview if we are dragging towards the edges
        const rect = this.dom.getBoundingClientRect();
        this._dragScroll = 0;
        let top = rect.top;

        let bottom = rect.bottom;
        if (this._dragScrollElement !== this) {
            const dragScrollRect = this._dragScrollElement.dom.getBoundingClientRect();
            top = Math.max(top + this._dragScrollElement.dom.scrollTop, dragScrollRect.top);
            bottom = Math.min(bottom + this._dragScrollElement.dom.scrollTop, dragScrollRect.bottom);
        }

        top = Math.max(0, top);
        bottom = Math.min(bottom, document.body.clientHeight);

        if (evt.pageY < top + 32 && this._dragScrollElement.dom.scrollTop > 0) {
            this._dragScroll = -1;
        } else if (evt.pageY > bottom - 32 && this._dragScrollElement.dom.scrollHeight > this._dragScrollElement.height + this._dragScrollElement.dom.scrollTop) {
            this._dragScroll = 1;
        }
    };

    // Scroll treeview if we are dragging towards the edges
    protected _scrollWhileDragging() {
        if (!this._dragging) return;
        if (this._dragScroll === 0) return;

        this._dragScrollElement.dom.scrollTop += this._dragScroll * 8;
        this._dragOverItem = null;
        this._updateDragHandle();
    }

    // Called while we drag the drag handle
    protected _onDragMove = (evt: MouseEvent) => {
        evt.preventDefault();
        evt.stopPropagation();

        if (!this._allowDrag || !this._dragOverItem) return;

        const rect = this._dragHandle.dom.getBoundingClientRect();
        const area = Math.floor((evt.clientY - rect.top) / rect.height * 5);

        const oldArea = this._dragArea;
        const oldDragOver = this._dragOverItem;

        if (this._dragOverItem.parent === this) {
            let parent = false;
            for (let i = 0; i < this._dragItems.length; i++) {
                if (this._dragItems[i].parent === this._dragOverItem) {
                    parent = true;
                    this._dragOverItem = null;
                    break;
                }
            }

            if (!parent) {
                this._dragArea = DRAG_AREA_INSIDE;
            }
        } else {
            // check if we are trying to drag item inside any of its children
            let invalid = false;
            for (let i = 0; i < this._dragItems.length; i++) {
                if (this._dragItems[i].dom.contains(this._dragOverItem.dom)) {
                    invalid = true;
                    break;
                }
            }

            if (invalid) {
                this._dragOverItem = null;
            } else if (this._allowReordering && area <= 1 && this._dragItems.indexOf(this._dragOverItem.previousSibling) === -1) {
                this._dragArea = DRAG_AREA_BEFORE;
            } else if (this._allowReordering && area >= 4 && this._dragItems.indexOf(this._dragOverItem.nextSibling) === -1 && (this._dragOverItem.numChildren === 0 || !this._dragOverItem.open)) {
                this._dragArea = DRAG_AREA_AFTER;
            } else {
                let parent = false;
                if (this._allowReordering && this._dragOverItem.open) {
                    for (let i = 0; i < this._dragItems.length; i++) {
                        if (this._dragItems[i].parent === this._dragOverItem) {
                            parent = true;
                            this._dragArea = DRAG_AREA_BEFORE;
                            break;
                        }
                    }
                }
                if (!parent)
                    this._dragArea = DRAG_AREA_INSIDE;
            }
        }

        if (oldArea !== this._dragArea || oldDragOver !== this._dragOverItem) {
            this._updateDragHandle();
        }
    };

    // Updates the drag handle position and size
    protected _updateDragHandle(dragOverItem?: TreeViewItem, force?: boolean) {
        if (!force && (!this._allowDrag || !this._dragging)) return;

        if (!dragOverItem) {
            dragOverItem = this._dragOverItem;
        }

        if (!dragOverItem || dragOverItem.hidden || !dragOverItem.parentsOpen) {
            this._dragHandle.hidden = true;
        } else {
            // @ts-ignore
            const rect = dragOverItem._containerContents.dom.getBoundingClientRect();

            this._dragHandle.hidden = false;
            this._dragHandle.class.remove(DRAG_AREA_AFTER, DRAG_AREA_BEFORE, DRAG_AREA_INSIDE);
            this._dragHandle.class.add(this._dragArea);

            const top = rect.top;
            let left = rect.left;
            let width = rect.width;
            if (this.dom.parentElement) {
                const parentRect = this.dom.parentElement.getBoundingClientRect();
                left = Math.max(left, parentRect.left);
                width = Math.min(width, this.dom.parentElement.clientWidth - left + parentRect.left);
            }

            this._dragHandle.style.top = top  + 'px';
            this._dragHandle.style.left = left + 'px';
            this._dragHandle.style.width = (width - 7) + 'px';
        }
    }

    /**
     * Opens all the parents of the specified item.
     *
     * @param endItem - The end tree view item.
     */
    protected _openHierarchy(endItem: TreeViewItem) {
        endItem.parentsOpen = true;
    }

    /**
     * Selects a tree view item.
     *
     * @param item - The tree view item.
     */
    protected _selectSingleItem(item: TreeViewItem) {
        let i = this._selectedItems.length;
        let othersSelected = false;
        while (i--) {
            if (this._selectedItems[i] && this._selectedItems[i] !== item) {
                this._selectedItems[i].selected = false;
                othersSelected = true;
            }
        }

        if (othersSelected) {
            item.selected = true;
        } else {
            item.selected = !item.selected;
        }
    }

    /**
     * Called when a child tree view item is selected.
     *
     * @param item - The tree view item.
     */
    protected _onChildSelected(item: TreeViewItem) {
        this._selectedItems.push(item);
        this._openHierarchy(item);
        this.emit('select', item);
    }

    /**
     * Called when a child tree view item is deselected.
     *
     * @param item - The tree view item.
     */
    protected _onChildDeselected(item: TreeViewItem) {
        const index = this._selectedItems.indexOf(item);
        if (index !== -1) {
            this._selectedItems.splice(index, 1);
            this.emit('deselect', item);
        }
    }

    /**
     * Called when a child tree view item is renamed.
     *
     * @param item - The tree view item.
     * @param newName - The new name.
     */
    protected _onChildRename(item: TreeViewItem, newName: string) {
        if (this._filter) {
            // unfilter this item
            item.class.remove(CLASS_FILTER_RESULT);
            const index = this._filterResults.indexOf(item);
            if (index !== -1) {
                this._filterResults.splice(index, 1);
            }

            // see if we can include it in the current filter
            this._searchItems([[item.text, item]], this._filter);
        }
        this.emit('rename', item, newName);
    }

    protected _searchItems(searchArr: [string, TreeViewItem][], filter: string) {
        const results = searchItems(searchArr, filter);
        if (!results.length) return;

        results.forEach((item: TreeViewItem) => {
            this._filterResults.push(item);
            item.class.add(CLASS_FILTER_RESULT);
        });
    }

    /**
     * Searches the treeview.
     *
     * @param filter - The search filter.
     */
    protected _applyFilter(filter: string) {
        this._clearFilter();

        this._wasDraggingAllowedBeforeFiltering = this._allowDrag;
        this._allowDrag = false;

        this.class.add(CLASS_FILTERING);

        const search: [string, TreeViewItem][] = [];
        this._traverseDepthFirst((item) => {
            search.push([item.text, item]);
        });

        this._searchItems(search, filter);
    }

    /**
     * Clears search filter.
     */
    protected _clearFilter() {
        this._filterResults.forEach((item) => {
            if (item.destroyed) return;
            item.class.remove(CLASS_FILTER_RESULT);
        });
        this._filterResults.length = 0;

        this.class.remove(CLASS_FILTERING);

        this._allowDrag = this._wasDraggingAllowedBeforeFiltering;
    }

    /**
     * Show the drag handle on the given tree item.
     *
     * @param treeItem - The tree item.
     */
    showDragHandle(treeItem: TreeViewItem) {
        this._updateDragHandle(treeItem, true);
    }

    /**
     * Deselects all selected tree view items.
     */
    deselect() {
        let i = this._selectedItems.length;
        while (i--) {
            if (this._selectedItems[i]) {
                this._selectedItems[i].selected = false;
            }
        }
    }

    /**
     * Removes all child tree view items.
     */
    clearTreeItems() {
        let i = this.dom.childNodes.length;
        while (i--) {
            const dom = this.dom.childNodes[i];
            if (!dom) continue;
            const ui = dom.ui;
            if (ui instanceof TreeViewItem) {
                ui.destroy();
            }
        }

        this._selectedItems = [];
        this._dragItems = [];
        this._allowDrag = this._wasDraggingAllowedBeforeFiltering;
    }

    /**
     * Whether dragging a TreeViewItem is allowed.
     */
    set allowDrag(value: boolean) {
        this._allowDrag = value;
        if (this._filter) {
            this._wasDraggingAllowedBeforeFiltering = value;
        }
    }

    get allowDrag(): boolean {
        return this._allowDrag;
    }

    /**
     * Whether reordering TreeViewItems is allowed.
     */
    set allowReordering(value: boolean) {
        this._allowReordering = value;
    }

    get allowReordering(): boolean {
        return this._allowReordering;
    }

    /**
     * Whether renaming TreeViewItems is allowed by double clicking on them.
     */
    set allowRenaming(value: boolean) {
        this._allowRenaming = value;
    }

    get allowRenaming(): boolean {
        return this._allowRenaming;
    }

    /**
     * Whether a TreeViewItem is currently being dragged.
     */
    set isDragging(value: boolean) {
        if (this._dragging === value) return;

        if (value) {
            this._dragging = true;
            this._updateDragHandle();

            // handle mouse move to scroll when dragging if necessary
            if (this.scrollable || this._dragScrollElement !== this) {
                window.removeEventListener('mousemove', this._onMouseMove);
                window.addEventListener('mousemove', this._onMouseMove);
                if (!this._dragScrollInterval) {
                    this._dragScrollInterval = window.setInterval(() => {
                        this._scrollWhileDragging();
                    }, 1000 / 60);
                }
            }
        } else {
            this._dragOverItem = null;
            this._updateDragHandle();

            this._dragging = false;

            window.removeEventListener('mousemove', this._onMouseMove);
            if (this._dragScrollInterval) {
                window.clearInterval(this._dragScrollInterval);
                this._dragScrollInterval = null;
            }
        }
    }

    get isDragging(): boolean {
        return this._dragging;
    }

    /**
     * Returns all of the currently selected TreeViewItems.
     */
    get selected(): Array<TreeViewItem> {
        return this._selectedItems.slice();
    }

    /**
     * A filter that searches TreeViewItems and only shows the ones that are relevant to the filter.
     */
    set filter(value) {
        if (this._filter === value) return;

        this._filter = value;

        if (value) {
            this._applyFilter(value);
        } else {
            this._clearFilter();
        }
    }

    get filter() {
        return this._filter;
    }

    /**
     * Whether Ctrl is currently pressed.
     */
    get pressedCtrl(): boolean {
        return this._pressedCtrl;
    }

    /**
     * Whether Shift is currently pressed.
     */
    get pressedShift(): boolean {
        return this._pressedShift;
    }
}

export default TreeView;
