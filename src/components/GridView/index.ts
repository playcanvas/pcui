import { EventHandle } from '@playcanvas/observer';

import { Container, ContainerArgs } from '../Container';
import { Element } from '../Element';
import { GridViewItem } from '../GridViewItem';

const CLASS_ROOT = 'pcui-gridview';
const CLASS_VERTICAL = `${CLASS_ROOT}-vertical`;

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
    /**
     * Fired when user activates a {@link GridViewItem} by pressing Enter or double-clicking.
     *
     * @event
     * @example
     * ```ts
     * const gridView = new GridView();
     * gridView.on('activate', (item: GridViewItem) => {
     *     console.log(`Activated item ${item.text}`);
     * });
     * ```
     */
    public static readonly EVENT_ACTIVATE = 'activate';

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

        this.dom.addEventListener('keydown', this._onKeyDown);
        this.dom.addEventListener('dblclick', this._onDblClick);
    }

    protected _onAppendGridViewItem(item: GridViewItem) {
        if (!(item instanceof GridViewItem)) return;

        let evtClick: EventHandle;
        if (this._clickFn) {
            evtClick = item.on('click', evt => this._clickFn(evt, item));
        } else {
            evtClick = item.on('click', evt => this._onClickItem(evt, item));
        }
        let evtSelect = item.on('select', () => this._onSelectItem(item));

        let evtDeselect: EventHandle;
        if (this._allowDeselect) {
            evtDeselect = item.on('deselect', () => this._onDeselectItem(item));
        }

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

    protected _onKeyDown = (evt: KeyboardEvent) => {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter'].indexOf(evt.key) === -1) return;

        const element = evt.target as HTMLElement;
        if (element.tagName === 'INPUT') return;

        // Walk up from the event target to find the GridViewItem
        let targetElement: HTMLElement = element;
        let item: GridViewItem | null = null;
        while (targetElement && targetElement !== this.dom) {
            if ((targetElement as any).ui instanceof GridViewItem) {
                item = (targetElement as any).ui;
                break;
            }
            targetElement = targetElement.parentElement;
        }

        if (!item) return;

        evt.preventDefault();
        evt.stopPropagation();

        if (evt.key === 'Enter') {
            this.emit(GridView.EVENT_ACTIVATE, item);
            return;
        }

        if (!item.allowSelect) return;
        let target: GridViewItem | null = null;

        if (this._vertical) {
            switch (evt.key) {
                case 'ArrowUp': target = item.previousSibling; break;
                case 'ArrowDown': target = item.nextSibling; break;
                case 'ArrowLeft': target = this._findItemInAdjacentRow(item, -1); break;
                case 'ArrowRight': target = this._findItemInAdjacentRow(item, 1); break;
            }
        } else {
            switch (evt.key) {
                case 'ArrowLeft': target = item.previousSibling; break;
                case 'ArrowRight': target = item.nextSibling; break;
                case 'ArrowUp': target = this._findItemInAdjacentRow(item, -1); break;
                case 'ArrowDown': target = this._findItemInAdjacentRow(item, 1); break;
            }
        }

        if (target) {
            this._selectSingleItem(target);
        }
    };

    protected _onDblClick = (evt: MouseEvent) => {
        let targetElement = evt.target as HTMLElement;
        let item: GridViewItem | null = null;
        while (targetElement && targetElement !== this.dom) {
            if ((targetElement as any).ui instanceof GridViewItem) {
                item = (targetElement as any).ui;
                break;
            }
            targetElement = targetElement.parentElement;
        }

        if (item) {
            evt.preventDefault();
            evt.stopPropagation();
            this.emit(GridView.EVENT_ACTIVATE, item);
        }
    };

    protected _selectSingleItem(item: GridViewItem) {
        let i = this._selected.length;
        while (i--) {
            if (this._selected[i] && this._selected[i] !== item) {
                this._selected[i].selected = false;
            }
        }
        item.selected = true;
    }

    protected _findItemInAdjacentRow(item: GridViewItem, direction: number): GridViewItem | null {
        const positionProp = this._vertical ? 'offsetLeft' : 'offsetTop';
        const itemPos = (item.dom as HTMLElement)[positionProp];

        // Determine the index of the current item within its row
        let index = 0;
        let sibling = item.previousSibling;
        while (sibling && (sibling.dom as HTMLElement)[positionProp] === itemPos) {
            index++;
            sibling = sibling.previousSibling;
        }

        // Find the first item in the adjacent row
        let firstInRow: GridViewItem | null = null;

        if (direction > 0) {
            let current = item.nextSibling;
            while (current) {
                if ((current.dom as HTMLElement)[positionProp] !== itemPos) {
                    firstInRow = current;
                    break;
                }
                current = current.nextSibling;
            }
        } else {
            let lastInPrevRow: GridViewItem | null = null;
            let current = item.previousSibling;
            while (current) {
                if ((current.dom as HTMLElement)[positionProp] !== itemPos) {
                    lastInPrevRow = current;
                    break;
                }
                current = current.previousSibling;
            }
            if (!lastInPrevRow) return null;

            const prevPos = (lastInPrevRow.dom as HTMLElement)[positionProp];
            firstInRow = lastInPrevRow;
            while (firstInRow.previousSibling && (firstInRow.previousSibling.dom as HTMLElement)[positionProp] === prevPos) {
                firstInRow = firstInRow.previousSibling;
            }
        }

        if (!firstInRow) return null;

        // Navigate to the same column position, or the last item if the row is shorter
        let target = firstInRow;
        const targetPos = (target.dom as HTMLElement)[positionProp];
        for (let i = 0; i < index; i++) {
            const next = target.nextSibling;
            if (!next || (next.dom as HTMLElement)[positionProp] !== targetPos) break;
            target = next;
        }

        return target;
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

        this.dom.removeEventListener('keydown', this._onKeyDown);
        this.dom.removeEventListener('dblclick', this._onDblClick);

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
