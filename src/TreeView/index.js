import Container from '../Container';
import Element from '../Element';
import TreeViewItem from '../TreeViewItem';
import { searchItems } from '../helpers/search';

import './style.scss';

const CLASS_ROOT = 'pcui-treeview';
const CLASS_DRAGGED_ITEM = CLASS_ROOT + '-item-dragged';
const CLASS_DRAGGED_HANDLE = CLASS_ROOT + '-drag-handle';
const CLASS_FILTERING = CLASS_ROOT + '-filtering';
const CLASS_FILTER_RESULT = CLASS_FILTERING + '-result';

const DRAG_AREA_INSIDE = 'inside';
const DRAG_AREA_BEFORE = 'before';
const DRAG_AREA_AFTER = 'after';

/**
 * @event
 * @name TreeView#dragstart
 * @param {TreeViewItem[]} items - The dragged items
 * @description Fired when we start dragging a TreeViewItem
 */

/**
 * @event
 * @name TreeView#dragend
 * @description Fired when we stop dragging a TreeViewItem
 */

/**
 * @event
 * @name TreeView#reparent
 * @description Fired when we reparent TreeViewItems
 * @param {object[]} items - An array of items we reparented. Each array element contains an object like so: {item, newParent, newChildIndex, oldParent}.
 */

/**
 * @event
 * @name TreeView#select
 * @description Fired when we select a TreeViewItem
 * @param {TreeViewItem} item - The item
 */

/**
 * @event
 * @name TreeView#deselect
 * @description Fired when we deselect a TreeViewItem
 * @param {TreeViewItem} item - The item
 */

/**
 * @event
 * @name TreeView#rename
 * @description Fired when we rename a TreeViewItem
 * @param {TreeViewItem} item - The item
 * @param {string} name - The new name
 */

/**
 * @name TreeView
 * @class
 * @classdesc A container that can show a treeview like a hierarchy. The treeview contains
 * pcui.TreeViewItems.
 * @augments Container
 * @property {boolean} allowDrag=true Whether dragging a TreeViewItem is allowed.
 * @property {boolean} allowReordering=true Whether reordering TreeViewItems is allowed.
 * @property {boolean} allowRenaming Whether renaming TreeViewItems is allowed by double clicking on them.
 * @property {boolean} isDragging Whether we are currently dragging a TreeViewItem.
 * @property {string} filter Gets / sets a filter that searches TreeViewItems and only shows the ones that are relevant to the filter.
 * @property {TreeViewItem[]} selected Gets the selected TreeViewItems.
 */
class TreeView extends Container {
    /**
     * Creates a new TreeView.
     *
     * @param {object} [args] - The arguments. All properties can be set through the arguments as well.
     * @param {Function} [args.onContextMenu] - A function to be called when we right click on a TreeViewItem.
     * @param {Function} [args.onReparent] - A function to be called when we try to reparent tree items. If a function is provided then the
     * @param {Element} [args.dragScrollElement] - An element (usually a container of the tree view) that will be scrolled when the user
     * drags towards the edges of the treeview. Defaults to the TreeView itself.
     * tree items will not be reparented by the TreeView but instead will rely on the function to reparent them as it sees fit.
     */
    constructor(args) {
        if (!args) args = {};

        super(args);

        this.class.add(CLASS_ROOT);

        this._selectedItems = [];
        this._dragItems = [];
        this._allowDrag = (args.allowDrag !== undefined ? args.allowDrag : true);
        this._allowReordering = (args.allowReordering !== undefined ? args.allowReordering : true);
        this._allowRenaming = (args.allowRenaming !== undefined ? args.allowRenaming : false);
        this._dragging = false;
        this._dragOverItem = null;
        this._dragArea = DRAG_AREA_INSIDE;
        this._dragScroll = 0;
        this._dragScrollInterval = null;
        this._dragHandle = new Element(document.createElement('div'), {
            class: CLASS_DRAGGED_HANDLE
        });
        this._dragScrollElement = args.dragScrollElement || this;
        this.append(this._dragHandle);

        this._onContextMenu = args.onContextMenu;
        this._onReparentFn = args.onReparent;

        this._pressedCtrl = false;
        this._pressedShift = false;

        this._filter = null;
        this._filterResults = [];
        this._wasDraggingAllowedBeforeFiltering = this._allowDrag;

        this._domEvtModifierKeys = this._updateModifierKeys.bind(this);
        this._domEvtMouseLeave = this._onMouseLeave.bind(this);
        this._domEvtDragMove = this._onDragMove.bind(this);
        this._domEvtMouseMove = this._onMouseMove.bind(this);

        window.addEventListener('keydown', this._domEvtModifierKeys);
        window.addEventListener('keyup', this._domEvtModifierKeys);
        window.addEventListener('mousedown', this._domEvtModifierKeys);

        this.dom.addEventListener('mouseleave', this._domEvtMouseLeave);

        this._dragHandle.dom.addEventListener('mousemove', this._domEvtDragMove);
        this._dragHandle.on('destroy', (dom) => {
            dom.removeEventListener('mousemove', this._domEvtDragMove);
        });
    }

    _updateModifierKeys(evt) {
        this._pressedCtrl = evt.ctrlKey || evt.metaKey;
        this._pressedShift = evt.shiftKey;
    }

    /**
     * Finds the next tree item that is not currently hidden
     *
     * @param {TreeViewItem} currentItem - The current tree item
     * @returns {TreeViewItem} The next tree item.
     */
    _findNextVisibleTreeItem(currentItem) {
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
     * @param {TreeViewItem} currentItem - The current item.
     * @returns {TreeViewItem} The last child item.
     */
    _findLastVisibleChildTreeItem(currentItem) {
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
     * @param {TreeViewItem} currentItem - The current tree item.
     * @returns {TreeViewItem} The previous item.
     */
    _findPreviousVisibleTreeItem(currentItem) {
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
     * @param {TreeViewItem} startChild - The start tree item.
     * @param {TreeViewItem} endChild - The end tree item.
     * @returns {TreeViewItem[]} The tree items.
     */
    _getChildrenRange(startChild, endChild) {
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
                        result.push(filterResults[j].ui);
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

    _onAppendChild(element) {
        super._onAppendChild(element);

        if (element instanceof TreeViewItem) {
            this._onAppendTreeViewItem(element);
        }
    }

    _onRemoveChild(element) {
        if (element instanceof TreeViewItem) {
            this._onRemoveTreeViewItem(element);
        }

        super._onRemoveChild(element);
    }

    _onAppendTreeViewItem(element) {
        element.treeView = this;

        if (this._filter) {
            // add new item to filtered results if it
            // satisfies the current filter
            this._searchItems([[element.text, element]], this._filter);
        }

        // do the same for all children of the element
        element.forEachChild((child) => {
            if (child instanceof TreeViewItem) {
                this._onAppendTreeViewItem(child);
            }
        });
    }

    _onRemoveTreeViewItem(element) {
        element.selected = false;

        // do the same for all children of the element
        element.forEachChild((child) => {
            if (child instanceof TreeViewItem) {
                this._onRemoveTreeViewItem(child);
            }
        });
    }

    // Called when a key is down on a child TreeViewItem.
    _onChildKeyDown(evt, element) {
        if ([9, 37, 38, 39, 40].indexOf(evt.keyCode) === -1) return;

        evt.preventDefault();
        evt.stopPropagation();

        if (evt.keyCode === 40) {
            // down - select next tree item
            if (this._selectedItems.length) {
                const next = this._findNextVisibleTreeItem(element);
                if (next) {
                    if (this._pressedShift || this._pressedCtrl) {
                        next.selected = true;
                    } else {
                        this._selectSingleItem(next);
                    }
                }
            }
        } else if (evt.keyCode === 38) {
            // up - select previous tree item
            if (this._selectedItems.length) {
                const prev = this._findPreviousVisibleTreeItem(element);
                if (prev) {
                    if (this._pressedShift || this._pressedCtrl) {
                        prev.selected = true;
                    } else {
                        this._selectSingleItem(prev);
                    }
                }
            }

        } else if (evt.keyCode === 37) {
            // left (close)
            if (element.parent !== this) {
                element.open = false;
            }
        } else if (evt.keyCode === 39) {
            // right (open)
            element.open = true;
        } else if (evt.keyCode === 9) {
            // tab
            // skip
        }
    }

    // Called when we click on a child TreeViewItem
    _onChildClick(evt, element) {
        if (evt.button !== 0) return;
        if (!element.allowSelect) return;

        if (this._pressedCtrl) {
            // toggle selection when Ctrl is pressed
            element.selected = !element.selected;
        } else if (this._pressedShift) {
            // on shift add to selection
            if (!this._selectedItems.length || this._selectedItems.length === 1 && this._selectedItems[0] === element) {
                element.selected = true;
                return;
            }

            const selected = this._selectedItems[this._selectedItems.length - 1];
            this._openHierarchy(selected);

            const children = this._getChildrenRange(selected, element);
            children.forEach((child) => {
                if (child.allowSelect) {
                    child.selected = true;
                }
            });

        } else {
            // deselect other items
            this._selectSingleItem(element);
        }
    }

    /**
     * Call specified function on every child TreeViewItem by traversing the hierarchy depth first.
     *
     * @param {Function} fn - The function to call. The function takes the TreeViewItem as an argument.
     */
    _traverseDepthFirst(fn) {
        function traverse(item) {
            if (!item || !(item instanceof TreeViewItem)) return;

            fn(item);

            if (item.numChildren) {
                for (let i = 0; i < item.dom.childNodes.length; i++) {
                    traverse(item.dom.childNodes[i].ui);
                }
            }
        }

        for (let i = 0; i < this.dom.childNodes.length; i++) {
            traverse(this.dom.childNodes[i].ui);
        }
    }

    /**
     * Do a depth first traversal of all tree items
     * and assign an order to them so that we know which one
     * is above the other. Performance wise this means it traverses
     * all tree items every time however seems to be pretty fast even with 15 - 20 K entities.
     */
    _updateTreeOrder() {
        let order = 0;

        this._traverseDepthFirst((item) => {
            item._treeOrder = order++;
        });
    }

    _getChildIndex(item, parent) {
        return Array.prototype.indexOf.call(parent.dom.childNodes, item.dom) - 1;
    }

    // Called when we start dragging a TreeViewItem.
    _onChildDragStart(evt, element) {
        if (!this.allowDrag || this._dragging) return;

        this._dragItems = [];

        if (this._selectedItems.indexOf(element) !== -1) {
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
            element.class.add(CLASS_DRAGGED_ITEM);
            this._dragItems.push(element);
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
    _onChildDragEnd(evt, element) {
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
                this._updateTreeOrder();
                this._dragItems.sort((a, b) => {
                    return a._treeOrder - b._treeOrder;
                });
            }

            if (this._dragItems.length) {
                // reparent items
                const reparented = [];

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
                        item.parent.remove(item);
                    });

                    // now reparent items
                    reparented.forEach((r, i) => {
                        if (this._dragArea === DRAG_AREA_BEFORE) {
                            // If dragged before a TreeViewItem...
                            r.newParent = this._dragOverItem.parent;
                            this._dragOverItem.parent.appendBefore(r.item, this._dragOverItem);
                            r.newChildIndex = this._getChildIndex(r.item, r.newParent);
                        } else if (this._dragArea === DRAG_AREA_INSIDE) {
                            // If dragged inside a TreeViewItem...
                            r.newParent = this._dragOverItem;
                            this._dragOverItem.append(r.item);
                            this._dragOverItem.open = true;
                            r.newChildIndex = this._getChildIndex(r.item, r.newParent);
                        } else if (this._dragArea === DRAG_AREA_AFTER) {
                            // If dragged after a TreeViewItem...
                            r.newParent = this._dragOverItem.parent;
                            this._dragOverItem.parent.appendAfter(r.item, i > 0 ? reparented[i - 1].item : this._dragOverItem);
                            r.newChildIndex = this._getChildIndex(r.item, r.newParent);
                        }
                    });

                } else {
                    // if we have an _onReparentFn then we will not perform the reparenting here
                    // but will instead calculate the new indexes and pass that data to the reparent function
                    // to perform the reparenting

                    const fakeDom = [];

                    const getChildren = (treeviewItem) => {
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
                        const parentChildren = getChildren(item.parent);

                        // remove this item from the children array in fakeDom
                        const childIdx = parentChildren.indexOf(item.dom);
                        parentChildren.splice(childIdx, 1);
                    });

                    // now reparent items
                    reparented.forEach((r, i) => {
                        if (this._dragArea === DRAG_AREA_BEFORE) {
                            // If dragged before a TreeViewItem...
                            r.newParent = this._dragOverItem.parent;
                            const parentChildren = getChildren(this._dragOverItem.parent);
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
                            const parentChildren = getChildren(this._dragOverItem.parent);
                            const after = i > 0 ? reparented[i - 1].item : this._dragOverItem;
                            const index = parentChildren.indexOf(after.dom);
                            parentChildren.splice(index + 1, 0, r.item.dom);
                            r.newChildIndex = index + 1;
                        }

                        // substract 1 from new child index to account for the extra node that
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
    _onChildDragOver(evt, element) {
        if (!this._allowDrag || !this._dragging) return;

        if (element.allowDrop && this._dragItems.indexOf(element) === -1) {
            this._dragOverItem = element;
        } else {
            this._dragOverItem = null;
        }

        this._updateDragHandle();
        this._onDragMove(evt);
    }

    // Called when the mouse cursor leaves the tree view.
    _onMouseLeave(evt) {
        if (!this._allowDrag || !this._dragging) return;

        this._dragOverItem = null;
        this._updateDragHandle();
    }

    // Called when the mouse moves while dragging
    _onMouseMove(evt) {
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
    }

    // Scroll treeview if we are dragging towards the edges
    _scrollWhileDragging() {
        if (!this._dragging) return;
        if (this._dragScroll === 0) return;

        this._dragScrollElement.dom.scrollTop += this._dragScroll * 8;
        this._dragOverItem = null;
        this._updateDragHandle();
    }

    // Called while we drag the drag handle
    _onDragMove(evt) {
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
                    for (var i = 0; i < this._dragItems.length; i++) {
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
    }

    // Updates the drag handle position and size
    _updateDragHandle(dragOverItem, force) {
        if (!force && (!this._allowDrag || !this._dragging)) return;

        if (!dragOverItem) {
            dragOverItem = this._dragOverItem;
        }

        if (!dragOverItem || dragOverItem.hidden || !dragOverItem.parentsOpen) {
            this._dragHandle.hidden = true;
        } else {
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
     * Opens all the parents of the specified item
     *
     * @param {TreeViewItem} endItem - The end tree view item
     */
    _openHierarchy(endItem) {
        endItem.parentsOpen = true;
    }

    /**
     * Selects a tree view item
     *
     * @param {TreeViewItem} item - The tree view item
     */
    _selectSingleItem(item) {
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
     * @param {TreeViewItem} item - The tree view item.
     */
    _onChildSelected(item) {
        this._selectedItems.push(item);
        this._openHierarchy(item);
        this.emit('select', item);
    }

    /**
     * Called when a child tree view item is deselected.
     *
     * @param {TreeViewItem} item - The tree view item.
     * @param {Element} element - The element.
     */
    _onChildDeselected(element) {
        const index = this._selectedItems.indexOf(element);
        if (index !== -1) {
            this._selectedItems.splice(index, 1);
            this.emit('deselect', element);
        }
    }

    /**
     * Called when a child tree view item is renamed.
     *
     * @param {TreeViewItem} item - The tree view item.
     * @param {string} newName - The new name.
     */
    _onChildRename(item, newName) {
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

    _searchItems(searchArr, filter) {
        const results = searchItems(searchArr, filter);
        if (!results.length) return;

        results.forEach((item) => {
            this._filterResults.push(item);
            item.class.add(CLASS_FILTER_RESULT);
        });

    }

    /**
     * Searches treeview
     *
     * @param {string} filter - The search filter
     */
    _applyFilter(filter) {
        this._clearFilter();

        this._wasDraggingAllowedBeforeFiltering = this._allowDrag;
        this._allowDrag = false;

        this.class.add(CLASS_FILTERING);

        const search = [];
        this._traverseDepthFirst((item) => {
            search.push([item.text, item]);
        });

        this._searchItems(search, filter);
    }

    /**
     * Clears search filter.
     */
    _clearFilter() {
        this._filterResults.forEach((item) => {
            if (item.destroyed) return;
            item.class.remove(CLASS_FILTER_RESULT);
        });
        this._filterResults.length = 0;

        this.class.remove(CLASS_FILTERING);

        this._allowDrag = this._wasDraggingAllowedBeforeFiltering;
    }

    showDragHandle(treeItem) {
        this._updateDragHandle(treeItem, true);
    }

    /**
     * @name TreeView#deselect
     * @description Deselects all selected tree view items.
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
     * @name TreeView#clearTreeItems
     * @description Removes all child tree view items
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

    destroy() {
        if (this._destroyed) return;

        window.removeEventListener('keydown', this._domEvtModifierKeys);
        window.removeEventListener('keyup', this._domEvtModifierKeys);
        window.removeEventListener('mousedown', this._domEvtModifierKeys);
        window.removeEventListener('mousemove', this._domEvtMouseMove);

        this.dom.removeEventListener('mouseleave', this._domEvtMouseLeave);

        if (this._dragScrollInterval) {
            clearInterval(this._dragScrollInterval);
            this._dragScrollInterval = null;
        }

        super.destroy();
    }

    set allowDrag(value) {
        this._allowDrag = value;
        if (this._filter) {
            this._wasDraggingAllowedBeforeFiltering = value;
        }
    }

    get allowDrag() {
        return this._allowDrag;
    }

    set allowReordering(value) {
        this._allowReordering = value;
    }

    get allowReordering() {
        return this._allowReordering;
    }

    set allowRenaming(value) {
        this._allowRenaming = value;
    }

    get allowRenaming() {
        return this._allowRenaming;
    }

    set isDragging(value) {
        if (this._dragging === value) return;

        if (value) {
            this._dragging = true;
            this._updateDragHandle();

            // handle mouse move to scroll when dragging if necessary
            if (this.scrollable || this._dragScrollElement !== this) {
                window.removeEventListener('mousemove', this._domEvtMouseMove);
                window.addEventListener('mousemove', this._domEvtMouseMove);
                if (!this._dragScrollInterval) {
                    this._dragScrollInterval = setInterval(this._scrollWhileDragging.bind(this), 1000 / 60);
                }
            }
        } else {
            this._dragOverItem = null;
            this._updateDragHandle();

            this._dragging = false;

            window.removeEventListener('mousemove', this._domEvtMouseMove);
            if (this._dragScrollInterval) {
                clearInterval(this._dragScrollInterval);
                this._dragScrollInterval = null;
            }
        }
    }

    get isDragging() {
        return this._dragging;
    }

    get selected() {
        return this._selectedItems.slice();
    }

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

    get pressedCtrl() {
        return this._pressedCtrl;
    }

    get pressedShift() {
        return this._pressedShift;
    }
}

export default TreeView;
