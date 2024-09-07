import { CLASS_FONT_REGULAR } from '../../class';
import { Container, ContainerArgs } from '../Container';
import { Element } from '../Element';
import { Label } from '../Label';
import { TextInput } from '../TextInput';

const CLASS_ROOT = 'pcui-treeview-item';
const CLASS_ICON = CLASS_ROOT + '-icon';
const CLASS_TEXT = CLASS_ROOT + '-text';
const CLASS_SELECTED = CLASS_ROOT + '-selected';
const CLASS_OPEN = CLASS_ROOT + '-open';
const CLASS_CONTENTS = CLASS_ROOT + '-contents';
const CLASS_EMPTY = CLASS_ROOT + '-empty';
const CLASS_RENAME = CLASS_ROOT + '-rename';

/**
 * The arguments for the {@link TreeViewItem} constructor.
 */
interface TreeViewItemArgs extends ContainerArgs {
    /**
     * Whether the item is selected.
     */
    selected?: boolean;
    /**
     * Whether the item can be selected. Defaults to `true`.
     */
    allowSelect?: boolean,
    /**
     * Whether the item is open meaning showing its children.
     */
    open?: boolean,
    /**
     * Whether this {@link TreeViewItem} can be dragged. Only considered if the parent {@link TreeView}
     * has `allowDrag` set to `true`. Defaults to `true`.
     */
    allowDrag?: boolean,
    /**
     * Whether dropping is allowed on the {@link TreeViewItem}. Defaults to `true`.
     */
    allowDrop?: boolean,
    /**
     * The text shown by the {@link TreeViewItem}.
     */
    text?: string,
    /**
     * The icon shown before the text in the {@link TreeViewItem}. Defaults to 'E360'.
     */
    icon?: string,
    /**
     * Method to be called when the {@link TreeViewItem} is selected.
     */
    onSelect?: (deselect: () => void) => void,
    /**
     * Method to be called when the {@link TreeViewItem} is deselected.
     */
    onDeselect?: () => void
}

/**
 * A TreeViewItem is a single node in a hierarchical {@link TreeView} control.
 */
class TreeViewItem extends Container {
    /**
     * Fired when user selects the TreeViewItem.
     *
     * @event
     * @example
     * ```ts
     * treeViewItem.on('select', (item: TreeViewItem) => {
     *     console.log('TreeViewItem selected', item);
     * });
     * ```
     */
    public static readonly EVENT_SELECT = 'select';

    /**
     * Fired when user deselects the TreeViewItem.
     *
     * @event
     * @example
     * ```ts
     * treeViewItem.on('deselect', (item: TreeViewItem) => {
     *     console.log('TreeViewItem deselected', item);
     * });
     * ```
     */
    public static readonly EVENT_DESELECT = 'deselect';

    /**
     * Fired when user opens the TreeViewItem.
     *
     * @event
     * @example
     * ```ts
     * treeViewItem.on('open', (item: TreeViewItem) => {
     *     console.log('TreeViewItem opened', item);
     * });
     * ```
     */
    public static readonly EVENT_OPEN = 'open';

    /**
     * Fired when user closes the TreeViewItem.
     *
     * @event
     * @example
     * ```ts
     * treeViewItem.on('close', (item: TreeViewItem) => {
     *     console.log('TreeViewItem closed', item);
     * });
     * ```
     */
    public static readonly EVENT_CLOSE = 'close';

    protected _containerContents: Container;

    protected _labelIcon: Label;

    protected _labelText: Label;

    protected _numChildren = 0;

    protected _treeView: any;

    protected _allowDrag: boolean;

    protected _allowDrop: boolean;

    protected _allowSelect: boolean;

    protected _icon: string;

    /**
     * Creates a new TreeViewItem.
     *
     * @param args - The arguments.
     */
    constructor(args: Readonly<TreeViewItemArgs> = {}) {
        super(args);

        this.class.add(CLASS_ROOT, CLASS_EMPTY);

        this._containerContents = new Container({
            class: CLASS_CONTENTS,
            flex: true,
            flexDirection: 'row',
            tabIndex: 0
        });
        this.append(this._containerContents);

        this._containerContents.dom.draggable = true;

        this._labelIcon = new Label({
            class: CLASS_ICON
        });
        this._containerContents.append(this._labelIcon);

        this.icon = args.icon ?? 'E360';

        this._labelText = new Label({
            class: CLASS_TEXT
        });
        this._containerContents.append(this._labelText);

        this.allowSelect = args.allowSelect ?? true;
        this.allowDrop = args.allowDrop ?? true;
        this.allowDrag = args.allowDrag ?? true;

        if (args.text) {
            this.text = args.text;
        }

        if (args.selected) {
            this.selected = args.selected;
        }

        const dom = this._containerContents.dom;
        dom.addEventListener('focus', this._onContentFocus);
        dom.addEventListener('blur', this._onContentBlur);
        dom.addEventListener('keydown', this._onContentKeyDown);
        dom.addEventListener('dragstart', this._onContentDragStart);
        dom.addEventListener('mousedown', this._onContentMouseDown);
        dom.addEventListener('mouseover', this._onContentMouseOver);
        dom.addEventListener('click', this._onContentClick);
        dom.addEventListener('dblclick', this._onContentDblClick);
        dom.addEventListener('contextmenu', this._onContentContextMenu);
    }

    destroy() {
        if (this._destroyed) return;

        const dom = this._containerContents.dom;
        dom.removeEventListener('focus', this._onContentFocus);
        dom.removeEventListener('blur', this._onContentBlur);
        dom.removeEventListener('keydown', this._onContentKeyDown);
        dom.removeEventListener('dragstart', this._onContentDragStart);
        dom.removeEventListener('mousedown', this._onContentMouseDown);
        dom.removeEventListener('mouseover', this._onContentMouseOver);
        dom.removeEventListener('click', this._onContentClick);
        dom.removeEventListener('dblclick', this._onContentDblClick);
        dom.removeEventListener('contextmenu', this._onContentContextMenu);

        window.removeEventListener('mouseup', this._onContentMouseUp);

        super.destroy();
    }

    protected _onAppendChild(element: Element) {
        super._onAppendChild(element);

        if (element instanceof TreeViewItem) {
            this._numChildren++;
            if (this._parent !== this._treeView) {
                this.class.remove(CLASS_EMPTY);
            }

            if (this._treeView) {
                this._treeView._onAppendTreeViewItem(element);
            }
        }
    }

    protected _onRemoveChild(element: Element) {
        if (element instanceof TreeViewItem) {
            this._numChildren--;
            if (this._numChildren === 0) {
                this.class.add(CLASS_EMPTY);
            }

            if (this._treeView) {
                this._treeView._onRemoveTreeViewItem(element);
            }
        }

        super._onRemoveChild(element);
    }

    protected _onContentKeyDown = (evt: KeyboardEvent) => {
        const element = evt.target as HTMLElement;
        if (element.tagName === 'INPUT') return;

        if (!this.allowSelect) return;

        if (this._treeView) {
            this._treeView._onChildKeyDown(evt, this);
        }
    };

    protected _onContentMouseDown = (evt: MouseEvent) => {
        if (!this._treeView || !this._treeView.allowDrag || !this._allowDrag) return;

        this._treeView._updateModifierKeys(evt);
        evt.stopPropagation();
    };

    protected _onContentMouseUp = (evt: MouseEvent) => {
        evt.stopPropagation();
        evt.preventDefault();

        window.removeEventListener('mouseup', this._onContentMouseUp);
        if (this._treeView) {
            this._treeView._onChildDragEnd(evt, this);
        }
    };

    protected _onContentMouseOver = (evt: MouseEvent) => {
        evt.stopPropagation();

        if (this._treeView) {
            this._treeView._onChildDragOver(evt, this);
        }

        this.emit('hover', evt);
    };

    protected _onContentDragStart = (evt: DragEvent) => {
        evt.stopPropagation();
        evt.preventDefault();

        if (!this._treeView || !this._treeView.allowDrag) return;

        if (this.class.contains(CLASS_RENAME)) return;

        this._treeView._onChildDragStart(evt, this);

        window.addEventListener('mouseup', this._onContentMouseUp);
    };

    protected _onContentClick = (evt: MouseEvent) => {
        if (!this.allowSelect || evt.button !== 0) return;

        const element = evt.target as HTMLElement;
        if (element.tagName === 'INPUT') return;

        evt.stopPropagation();

        const rect = this._containerContents.dom.getBoundingClientRect();
        if (this._numChildren > 0 && evt.clientX - rect.left < 0) {
            this.open = !this.open;
            if (evt.altKey) {
                // apply to all children as well
                this._dfs((item: TreeViewItem) => {
                    item.open = this.open;
                });
            }
            this.focus();
        } else if (this._treeView) {
            this._treeView._onChildClick(evt, this);
        }
    };

    protected _dfs(fn: (item: TreeViewItem) => void) {
        fn(this);
        let child = this.firstChild;
        while (child) {
            child._dfs(fn);
            child = child.nextSibling;
        }
    }

    protected _onContentDblClick = (evt: MouseEvent) => {
        if (!this._treeView || !this._treeView.allowRenaming || evt.button !== 0) return;

        const element = evt.target as HTMLElement;
        if (element.tagName === 'INPUT') return;

        evt.stopPropagation();
        const rect = this._containerContents.dom.getBoundingClientRect();
        if (this.numChildren && evt.clientX - rect.left < 0) {
            return;
        }

        if (this.allowSelect) {
            this._treeView.deselect();
            this._treeView._onChildClick(evt, this);
        }

        this.rename();
    };

    protected _onContentContextMenu = (evt: MouseEvent) => {
        if (this._treeView && this._treeView._onContextMenu) {
            this._treeView._onContextMenu(evt, this);
        }
    };

    protected _onContentFocus = (evt: FocusEvent) => {
        this.emit('focus');
    };

    protected _onContentBlur = (evt: FocusEvent) => {
        this.emit('blur');
    };

    rename() {
        this.class.add(CLASS_RENAME);

        // show text input to enter new text
        const textInput = new TextInput({
            renderChanges: false,
            value: this.text,
            class: CLASS_FONT_REGULAR
        });

        textInput.on('blur', () => {
            textInput.destroy();
        });

        textInput.on('destroy', () => {
            this.class.remove(CLASS_RENAME);
            this.focus();
        });

        textInput.on('change', (value: string) => {
            value = value.trim();
            if (value) {
                this.text = value;
                textInput.destroy();
            }
        });

        textInput.on('disable', () => {
            // make sure text input is editable even if this
            // tree item is disabled
            textInput.input.removeAttribute('readonly');
        });

        this._containerContents.append(textInput);

        textInput.focus(true);
    }

    focus() {
        this._containerContents.dom.focus();
    }

    blur() {
        this._containerContents.dom.blur();
    }

    /**
     * Sets whether the item is selected.
     */
    set selected(value) {
        if (value === this.selected) {
            if (value) {
                this.focus();
            }

            return;
        }

        if (value) {
            this._containerContents.class.add(CLASS_SELECTED);
            this.emit('select', this);
            if (this._treeView) {
                this._treeView._onChildSelected(this);
            }

            this.focus();
        } else {
            this._containerContents.class.remove(CLASS_SELECTED);
            this.blur();
            this.emit('deselect', this);
            if (this._treeView) {
                this._treeView._onChildDeselected(this);
            }
        }
    }

    /**
     * Gets whether the item is selected.
     */
    get selected() {
        return this._containerContents.class.contains(CLASS_SELECTED);
    }

    /**
     * Sets the text shown by the TreeViewItem.
     */
    set text(value) {
        if (this._labelText.value !== value) {
            this._labelText.value = value;
            if (this._treeView) {
                this._treeView._onChildRename(this, value);
            }
        }
    }

    /**
     * Gets the text shown by the TreeViewItem.
     */
    get text() {
        return this._labelText.value;
    }

    /**
     * Gets the internal label that shows the text.
     */
    get textLabel() {
        return this._labelText;
    }

    /**
     * Gets the internal label that shows the icon.
     */
    get iconLabel() {
        return this._labelIcon;
    }

    /**
     * Sets whether the item is expanded and showing its children.
     */
    set open(value) {
        if (this.open === value) return;
        if (value) {
            if (!this.numChildren) return;

            this.class.add(CLASS_OPEN);
            this.emit('open', this);
        } else {
            this.class.remove(CLASS_OPEN);
            this.emit('close', this);
        }
    }

    /**
     * Gets whether the item is expanded and showing its children.
     */
    get open() {
        return this.class.contains(CLASS_OPEN) || this.parent === this._treeView;
    }

    /**
     * Sets whether the ancestors of the item are open or closed.
     */
    set parentsOpen(value) {
        let parent = this.parent;
        while (parent && parent instanceof TreeViewItem) {
            parent.open = value;
            parent = parent.parent;
        }
    }

    /**
     * Gets whether the ancestors of the item are open or closed.
     */
    get parentsOpen() {
        let parent = this.parent;
        while (parent && parent instanceof TreeViewItem) {
            if (!parent.open) return false;
            parent = parent.parent;
        }

        return true;
    }

    /**
     * Sets whether dropping is allowed on the tree item.
     */
    set allowDrop(value) {
        this._allowDrop = value;
    }

    /**
     * Gets whether dropping is allowed on the tree item.
     */
    get allowDrop() {
        return this._allowDrop;
    }

    /**
     * Sets whether this tree item can be dragged. Only considered if the parent {@link TreeView}
     * has {@link TreeView#allowDrag} set to `true`.
     */
    set allowDrag(value) {
        this._allowDrag = value;
    }

    /**
     * Gets whether this tree item can be dragged.
     */
    get allowDrag() {
        return this._allowDrag;
    }

    /**
     * Sets whether the item can be selected.
     */
    set allowSelect(value) {
        this._allowSelect = value;
    }

    /**
     * Gets whether the item can be selected.
     */
    get allowSelect() {
        return this._allowSelect;
    }

    /**
     * Sets the parent {@link TreeView}.
     */
    set treeView(value) {
        this._treeView = value;
    }

    /**
     * Gets the parent {@link TreeView}.
     */
    get treeView() {
        return this._treeView;
    }

    /**
     * Gets the number of direct children.
     */
    get numChildren() {
        return this._numChildren;
    }

    /**
     * Gets the first child item.
     */
    get firstChild() {
        if (this._numChildren) {
            for (const child of this.dom.childNodes) {
                if (child.ui instanceof TreeViewItem) {
                    return child.ui as TreeViewItem;
                }
            }
        }

        return null;
    }

    /**
     * Gets the last child item.
     */
    get lastChild() {
        if (this._numChildren) {
            for (let i = this.dom.childNodes.length - 1; i >= 0; i--) {
                if (this.dom.childNodes[i].ui instanceof TreeViewItem) {
                    return this.dom.childNodes[i].ui as TreeViewItem;
                }
            }
        }

        return null;
    }

    /**
     * Gets the first sibling item.
     */
    get nextSibling() {
        let sibling = this.dom.nextSibling;
        while (sibling && !(sibling.ui instanceof TreeViewItem)) {
            sibling = sibling.nextSibling;
        }

        return sibling && sibling.ui as TreeViewItem;
    }

    /**
     * Gets the last sibling item.
     */
    get previousSibling() {
        let sibling = this.dom.previousSibling;
        while (sibling && !(sibling.ui instanceof TreeViewItem)) {
            sibling = sibling.previousSibling;
        }

        return sibling && sibling.ui as TreeViewItem;
    }

    /**
     * Sets the icon shown before the text in the TreeViewItem.
     */
    set icon(value) {
        if (this._icon === value || !value.match(/^E[0-9]{0,4}$/)) return;
        this._icon = value;
        if (value) {
            // set data-icon attribute but first convert the value to a code point
            this._labelIcon.dom.setAttribute('data-icon', String.fromCodePoint(parseInt(value, 16)));
        } else {
            this._labelIcon.dom.removeAttribute('data-icon');
        }
    }

    /**
     * Gets the icon shown before the text in the TreeViewItem.
     */
    get icon() {
        return this._icon;
    }
}

export { TreeViewItem, TreeViewItemArgs };
