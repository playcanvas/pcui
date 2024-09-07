import { EventHandle } from '@playcanvas/observer';

import { Container, ContainerArgs } from '../Container';
import { Element } from '../Element';
import { GridViewItem } from '../GridViewItem';

const CLASS_ROOT = 'pcui-gridview';
const CLASS_VERTICAL = CLASS_ROOT + '-vertical';

/**
 * The arguments for the {@link GridView} constructor.
 */
interface GridViewArgs extends ContainerArgs {
    /**
     * If `true` the {@link GridView} layout will be vertical.
     */
    vertical?: boolean;
    /**
     * If `true`, the layout will allow for multiple options to be selected. Defaults to `true`.
     */
    multiSelect?: boolean;
    /**
     * If `true` and `multiSelect` is set to `false`, the layout will allow options to be deselected. Defaults to `true`.
     */
    allowDeselect?: boolean;
    /**
     * A filter function to filter {@link GridViewItem}s with signature `(GridViewItem) => boolean`.
     */
    filterFn?: (item: GridViewItem) => boolean;
}

/**
 * Represents a container that shows a flexible wrappable list of items that looks like a grid.
 * Contains {@link GridViewItem}s.
 */
class GridView extends Container {
    protected _vertical: boolean;

    protected _clickFn: (evt: MouseEvent, item: GridViewItem) => void;

    protected _filterFn: (item: GridViewItem) => boolean;

    protected _filterAnimationFrame: number = null;

    protected _filterCanceled = false;

    protected _multiSelect: boolean;

    protected _allowDeselect: boolean;

    protected _selected: GridViewItem[] = [];

    /**
     * Creates a new GridView.
     *
     * @param args - The arguments.
     */
    constructor(args: Readonly<GridViewArgs> = {}) {
        super(args);

        this._vertical = !!args.vertical;
        this.class.add(this._vertical ? CLASS_VERTICAL : CLASS_ROOT);

        this.on('append', (element: Element) => {
            this._onAppendGridViewItem(element as GridViewItem);
        });
        this.on('remove', (element: Element) => {
            this._onRemoveGridViewItem(element as GridViewItem);
        });

        this._filterFn = args.filterFn;

        // Default options for GridView layout
        this._multiSelect = args.multiSelect ?? true;
        this._allowDeselect = args.allowDeselect ?? true;
    }

    protected _onAppendGridViewItem(item: GridViewItem) {
        if (!(item instanceof GridViewItem)) return;

        let evtClick: EventHandle;
        if (this._clickFn)
            evtClick = item.on('click', evt => this._clickFn(evt, item));
        else
            evtClick = item.on('click', evt => this._onClickItem(evt, item));
        let evtSelect = item.on('select', () => this._onSelectItem(item));

        let evtDeselect: EventHandle;
        if (this._allowDeselect)
            evtDeselect = item.on('deselect', () => this._onDeselectItem(item));

        if (this._filterFn && !this._filterFn(item)) {
            item.hidden = true;
        }

        item.once('griditem:remove', () => {
            evtClick.unbind();
            evtClick = null;

            evtSelect.unbind();
            evtSelect = null;

            if (this._allowDeselect) {
                evtDeselect.unbind();
                evtDeselect = null;
            }
        });
    }

    protected _onRemoveGridViewItem(item: GridViewItem) {
        if (!(item instanceof GridViewItem)) return;

        item.selected = false;

        item.emit('griditem:remove');
        item.unbind('griditem:remove');
    }

    protected _onClickItem(evt: MouseEvent, item: GridViewItem) {
        if ((evt.ctrlKey || evt.metaKey) && this._multiSelect) {
            item.selected = !item.selected;
        } else if (evt.shiftKey && this._multiSelect) {
            const lastSelected = this._selected[this._selected.length - 1];
            if (lastSelected) {
                const comparePosition = lastSelected.dom.compareDocumentPosition(item.dom);
                if (comparePosition & Node.DOCUMENT_POSITION_FOLLOWING) {
                    let sibling = lastSelected.nextSibling;
                    while (sibling) {
                        sibling.selected = true;
                        if (sibling === item) break;

                        sibling = sibling.nextSibling;
                    }
                } else {
                    let sibling = lastSelected.previousSibling;
                    while (sibling) {
                        sibling.selected = true;
                        if (sibling === item) break;

                        sibling = sibling.previousSibling;
                    }
                }
            } else {
                item.selected = true;
            }
        } else {
            let othersSelected = false;
            let i = this._selected.length;
            while (i--) {
                if (this._selected[i] && this._selected[i] !== item) {
                    this._selected[i].selected = false;
                    othersSelected = true;
                }
            }

            if (othersSelected) {
                item.selected = true;
            } else {
                item.selected = !item.selected;
            }
        }
    }

    protected _onSelectItem(item: GridViewItem) {
        this._selected.push(item);
        this.emit('select', item);
    }

    protected _onDeselectItem(item: GridViewItem) {
        const index = this._selected.indexOf(item);
        if (index !== -1) {
            this._selected.splice(index, 1);
            this.emit('deselect', item);
        }
    }

    /**
     * Deselects all selected grid view items.
     */
    deselect() {
        let i = this._selected.length;
        while (i--) {
            if (this._selected[i]) {
                this._selected[i].selected = false;
            }
        }
    }

    /**
     * Filters grid view items with the filter function provided in the constructor.
     */
    filter() {
        this.forEachChild((child) => {
            if (child instanceof GridViewItem) {
                child.hidden = this._filterFn && !this._filterFn(child);
            }
        });
    }

    /**
     * Filters grid view items asynchronously by only allowing up to the specified number of grid
     * view item operations. Fires the following events:
     *
     * - filter:start - When filtering starts.
     * - filter:end - When filtering ends.
     * - filter:delay - When an animation frame is requested to process another batch.
     * - filter:cancel - When filtering is canceled.
     *
     * @param batchLimit - The maximum number of items to show before requesting another animation frame.
     */
    filterAsync(batchLimit = 100) {
        let i = 0;
        const children = this.dom.childNodes;
        const len = children.length;

        this.emit('filter:start');

        this._filterCanceled = false;

        const next = () => {
            this._filterAnimationFrame = null;
            let visible = 0;
            for (; i < len && visible < batchLimit; i++) {
                if (this._filterCanceled) {
                    this._filterCanceled = false;
                    this.emit('filter:cancel');
                    return;
                }

                const child = children[i].ui;
                if (child instanceof GridViewItem) {
                    if (this._filterFn && !this._filterFn(child)) {
                        child.hidden = true;
                    } else {
                        child.hidden = false;
                        visible++;
                    }
                }
            }

            if (i < len) {
                this.emit('filter:delay');
                this._filterAnimationFrame = requestAnimationFrame(next);
            } else {
                this.emit('filter:end');
            }
        };

        next();
    }

    /**
     * Cancels asynchronous filtering.
     */
    filterAsyncCancel() {
        if (this._filterAnimationFrame) {
            cancelAnimationFrame(this._filterAnimationFrame);
            this._filterAnimationFrame = null;
        } else {
            this._filterCanceled = true;
        }
    }

    destroy() {
        if (this._destroyed) return;

        if (this._filterAnimationFrame) {
            cancelAnimationFrame(this._filterAnimationFrame);
            this._filterAnimationFrame = null;
        }

        super.destroy();
    }

    /**
     * Gets the selected GridViewItems.
     */
    get selected() {
        return this._selected.slice();
    }

    /**
     * Gets whether the grid layout is vertical or not.
     */
    get vertical() {
        return this._vertical;
    }
}

export { GridView, GridViewArgs };
