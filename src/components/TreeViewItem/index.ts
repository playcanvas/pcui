import Label from '../Label/index';
import Container from '../Container/index';
import TextInput from '../TextInput/index';
import * as pcuiClass from '../../class';

const CLASS_ROOT = 'pcui-treeview-item';
const CLASS_ICON = CLASS_ROOT + '-icon';
const CLASS_TEXT = CLASS_ROOT + '-text';
const CLASS_SELECTED = CLASS_ROOT + '-selected';
const CLASS_OPEN = CLASS_ROOT + '-open';
const CLASS_CONTENTS = CLASS_ROOT + '-contents';
const CLASS_EMPTY = CLASS_ROOT + '-empty';
const CLASS_RENAME = CLASS_ROOT + '-rename';

namespace TreeViewItem {
    export interface Args extends Container.Args {
        /**
         * Whether the item is selected.
         */
        selected?: any;
        /**
         * Whether the item can be selected.
         */
        allowSelect?: boolean,
        /**
         * Whether the item is open meaning showing its children.
         */
        open?: boolean,
        /**
         * Whether this tree item can be dragged. Only considered if the parent treeview has allowDrag true.
         */
        allowDrag?: boolean,
        /**
         * Whether dropping is allowed on the tree item.
         */
        allowDrop?: boolean,
        /**
         * The text shown by the TreeViewItem.
         */
        text?: string,
        /**
         * The icon shown before the text in the TreeViewItem.
         */
        icon?: string,
        /**
         * Method to be called when the TreeViewItem is selected.
         */
        onSelect?: (deselect: () => void) => void,
        /**
         * Method to be called when the TreeViewItem is deselected.
         */
        onDeselect?: () => void
    }
}

/**
 * Represents a Tree View Item to be added to a pcui.TreeView.
 */
class TreeViewItem extends Container {

    static readonly defaultArgs: TreeViewItem.Args = {
        ...Container.defaultArgs,
        flex: true,
        icon: 'E360',
        allowSelect: true,
        allowDrop: true,
        allowDrag: true
    };

    /**
     * @event
     * @name select
     * @description Fired when we select the TreeViewItem.
     * @param {TreeViewItem} item - The item
     */
    public static readonly EVENT_SELECT = 'select';

    /**
     * @event
     * @name deselect
     * @description Fired when we deselect the TreeViewItem.
     * @param {TreeViewItem} item - The item
     */
    public static readonly EVENT_DESELECT = 'deselect';

    /**
     * @event
     * @name open
     * @description Fired when we open a TreeViewItem
     * @param {TreeViewItem} item - The item
     */
    public static readonly EVENT_OPEN = 'open';

    /**
     * @event
     * @name close
     * @description Fired when we close the TreeViewItem.
     * @param {TreeViewItem} item - The item
     */
    public static readonly EVENT_CLOSE = 'close';

    protected _containerContents: Container;
    protected _labelIcon: Label;
    protected _labelText: Label;
    protected _numChildren: number;
    protected _treeOrder: number;
    protected _domEvtFocus: any;
    protected _domEvtBlur: any;
    protected _domEvtKeyDown: any;
    protected _domEvtDragStart: any;
    protected _domEvtMouseDown: any;
    protected _domEvtMouseUp: any;
    protected _domEvtMouseOver: any;
    protected _domEvtClick: any;
    protected _domEvtDblClick: any;
    protected _domEvtContextMenu: any;
    protected _treeView: any;
    protected _allowDrag: any;
    protected _allowDrop: any;
    protected _allowSelect: any;
    protected _icon: any;

    /**
     * Creates a new TreeViewItem.
     */
    constructor(args: TreeViewItem.Args = TreeViewItem.defaultArgs) {
        args = { ...TreeViewItem.defaultArgs, ...args };
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

        this.icon = args.icon;

        this._labelText = new Label({
            class: CLASS_TEXT
        });
        this._containerContents.append(this._labelText);

        this.allowSelect = args.allowSelect;
        this.allowDrop = args.allowDrop;
        this.allowDrag = args.allowDrag;

        if (args.text) {
            this.text = args.text;
        }

        if (args.selected) {
            this.selected = args.selected;
        }

        this._numChildren = 0;

        // used the the parent treeview
        this._treeOrder = -1;

        this._domEvtFocus = this._onContentFocus.bind(this);
        this._domEvtBlur = this._onContentBlur.bind(this);
        this._domEvtKeyDown = this._onContentKeyDown.bind(this);
        this._domEvtDragStart = this._onContentDragStart.bind(this);
        this._domEvtMouseDown = this._onContentMouseDown.bind(this);
        this._domEvtMouseUp = this._onContentMouseUp.bind(this);
        this._domEvtMouseOver = this._onContentMouseOver.bind(this);
        this._domEvtClick = this._onContentClick.bind(this);
        this._domEvtDblClick = this._onContentDblClick.bind(this);
        this._domEvtContextMenu = this._onContentContextMenu.bind(this);

        this._containerContents.dom.addEventListener('focus', this._domEvtFocus);
        this._containerContents.dom.addEventListener('blur', this._domEvtBlur);
        this._containerContents.dom.addEventListener('keydown', this._domEvtKeyDown);
        this._containerContents.dom.addEventListener('dragstart', this._domEvtDragStart);
        this._containerContents.dom.addEventListener('mousedown', this._domEvtMouseDown);
        this._containerContents.dom.addEventListener('mouseover', this._domEvtMouseOver);
        this._containerContents.dom.addEventListener('click', this._domEvtClick);
        this._containerContents.dom.addEventListener('dblclick', this._domEvtDblClick);
        this._containerContents.dom.addEventListener('contextmenu', this._domEvtContextMenu);
    }

    protected _onAppendChild(element: any) {
        super._onAppendChild(element);

        if (!(element instanceof TreeViewItem)) return;

        this._numChildren++;
        if (this._parent !== this._treeView) this.classRemove(CLASS_EMPTY);

        if (this._treeView) {
            this._treeView._onAppendTreeViewItem(element);
        }
    }

    protected _onRemoveChild(element: any) {
        if (element instanceof TreeViewItem) {
            this._numChildren--;
            if (this._numChildren === 0) {
                this.classAdd(CLASS_EMPTY);
            }

            if (this._treeView) {
                this._treeView._onRemoveTreeViewItem(element);
            }
        }

        super._onRemoveChild(element);
    }

    protected _onContentKeyDown(evt: any) {
        if (evt.target.tagName.toLowerCase() === 'input') return;

        if (!this.allowSelect) return;

        if (this._treeView) {
            this._treeView._onChildKeyDown(evt, this);
        }
    }

    protected _onContentMouseDown(evt: any) {
        if (!this._treeView || !this._treeView.allowDrag || !this._allowDrag) return;

        this._treeView._updateModifierKeys(evt);
        evt.stopPropagation();
    }

    protected _onContentMouseUp(evt: any) {
        evt.stopPropagation();
        evt.preventDefault();

        window.removeEventListener('mouseup', this._domEvtMouseUp);
        if (this._treeView) {
            this._treeView._onChildDragEnd(evt, this);
        }
    }

    protected _onContentMouseOver(evt: any) {
        evt.stopPropagation();

        if (this._treeView) {
            this._treeView._onChildDragOver(evt, this);
        }

        // allow hover event
        super._onMouseOver(evt);
    }

    protected _onContentDragStart(evt: any) {
        evt.stopPropagation();
        evt.preventDefault();

        if (!this._treeView || !this._treeView.allowDrag) return;

        if (this.class.contains(CLASS_RENAME)) return;

        this._treeView._onChildDragStart(evt, this);

        window.addEventListener('mouseup', this._domEvtMouseUp);
    }

    protected _onContentClick(evt: any) {
        if (!this.allowSelect || evt.button !== 0) return;
        if (evt.target.tagName.toLowerCase() === 'input') return;

        evt.stopPropagation();

        const rect = this._containerContents.dom.getBoundingClientRect();
        if (this._numChildren > 0 && evt.clientX - rect.left < 0) {
            this.open = !this.open;
            if (evt.altKey) {
                // apply to all children as well
                this._dfs((node: any) => {
                    node.open = this.open;
                });
            }
            this.focus();
        } else if (this._treeView) {
            this._treeView._onChildClick(evt, this);
        }
    }

    protected _dfs(fn: any) {
        fn(this);
        let child = this.firstChild;
        while (child) {
            child._dfs(fn);
            child = child.nextSibling;
        }
    }

    protected _onContentDblClick(evt: any) {
        if (!this._treeView || !this._treeView.allowRenaming || evt.button !== 0) return;
        if (evt.target.tagName.toLowerCase() === 'input') return;

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
    }

    protected _onContentContextMenu(evt: any) {
        if (this._treeView && this._treeView._onContextMenu) {
            this._treeView._onContextMenu(evt, this);
        }
    }

    protected _onContentFocus(evt: any) {
        this.emit('focus');
    }

    protected _onContentBlur(evt: any) {
        this.emit('blur');
    }

    rename() {
        this.classAdd(CLASS_RENAME);

        // show text input to enter new text
        const textInput = new TextInput({
            renderChanges: false,
            value: this.text,
            class: pcuiClass.FONT_REGULAR
        });

        // @ts-ignore
        textInput.on('blur', () => {
            textInput.destroy();
        });

        // @ts-ignore
        textInput.on('destroy', () => {
            this.classRemove(CLASS_RENAME);
            this.focus();
        });

        // @ts-ignore
        textInput.on('change', (value: any) => {
            value = value.trim();
            if (value) {
                this.text = value;
                textInput.destroy();
            }
        });

        // @ts-ignore
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

    destroy() {
        if (this._destroyed) return;

        this._containerContents.dom.removeEventListener('focus', this._domEvtFocus);
        this._containerContents.dom.removeEventListener('blur', this._domEvtBlur);
        this._containerContents.dom.removeEventListener('keydown', this._domEvtKeyDown);
        this._containerContents.dom.removeEventListener('mousedown', this._domEvtMouseDown);
        this._containerContents.dom.removeEventListener('dragstart', this._domEvtDragStart);
        this._containerContents.dom.removeEventListener('mouseover', this._domEvtMouseOver);
        this._containerContents.dom.removeEventListener('click', this._domEvtClick);
        this._containerContents.dom.removeEventListener('dblclick', this._domEvtDblClick);
        this._containerContents.dom.removeEventListener('contextmenu', this._domEvtContextMenu);

        window.removeEventListener('mouseup', this._domEvtMouseUp);

        super.destroy();
    }

    /**
     * Whether the item is selected.
     * 
     * @type {boolean}
     */
    set selected(value) {
        if (value === this.selected) {
            if (value) {
                this.focus();
            }

            return;
        }

        if (value) {
            this._containerContents.classAdd(CLASS_SELECTED);
            this.emit('select', this);
            if (this._treeView) {
                this._treeView._onChildSelected(this);
            }

            this.focus();
        } else {
            this._containerContents.classRemove(CLASS_SELECTED);
            this.blur();
            this.emit('deselect', this);
            if (this._treeView) {
                this._treeView._onChildDeselected(this);
            }
        }
    }

    get selected() {
        return this._containerContents.class.contains(CLASS_SELECTED);
    }

    /**
     * The text shown by the TreeViewItem.
     * 
     * @type {string}
     */
    set text(value) {
        if (this._labelText.value !== value) {
            this._labelText.value = value;
            if (this._treeView) {
                this._treeView._onChildRename(this, value);
            }
        }
    }

    get text() {
        return this._labelText.value;
    }

    /**
     * Gets the internal label that shows the text.
     * 
     * @type {Label}
     */
    get textLabel() {
        return this._labelText;
    }

    /**
     * Gets the internal label that shows the icon.
     * 
     * @type {Label}
     */
    get iconLabel() {
        return this._labelIcon;
    }

    /**
     * Whether the item is open meaning showing its children.
     * 
     * @type {boolean}
     */
    set open(value) {
        if (this.open === value) return;
        if (value) {
            if (!this.numChildren) return;

            this.classAdd(CLASS_OPEN);
            this.emit('open', this);
        } else {
            this.classRemove(CLASS_OPEN);
            this.emit('close', this);
        }
    }

    get open() {
        return this.class.contains(CLASS_OPEN) || this.parent === this._treeView;
    }

    /**
     * Whether the parents of the item are open or closed.
     * 
     * @type {boolean}
     */
    set parentsOpen(value) {
        let parent = this.parent;
        while (parent && parent instanceof TreeViewItem) {
            parent.open = value;
            parent = parent.parent;
        }
    }

    get parentsOpen() {
        let parent = this.parent;
        while (parent && parent instanceof TreeViewItem) {
            if (!parent.open) return false;
            parent = parent.parent;
        }

        return true;
    }

    /**
     * Whether dropping is allowed on the tree item.
     * 
     * @type {boolean}
     */
    set allowDrop(value) {
        this._allowDrop = value;
    }

    get allowDrop() {
        return this._allowDrop;
    }

    /**
     * Whether this tree item can be dragged. Only considered if the parent treeview has allowDrag true.
     * 
     * @type {boolean}
     */
    set allowDrag(value) {
        this._allowDrag = value;
    }

    get allowDrag() {
        return this._allowDrag;
    }

    /**
     * Whether the item can be selected.
     * 
     * @type {boolean}
     */
    set allowSelect(value) {
        this._allowSelect = value;
    }

    get allowSelect() {
        return this._allowSelect;
    }

    /**
     * Gets / sets the parent TreeView.
     * 
     * @type {TreeView}
     */
    set treeView(value) {
        this._treeView = value;
    }

    get treeView() {
        return this._treeView;
    }

    /**
     * number of direct children.
     * 
     * @type {number}
     */
    get numChildren() {
        return this._numChildren;
    }

    /**
     * Gets the first child item.
     * 
     * @type {TreeViewItem}
     */
    get firstChild() {
        if (this._numChildren) {
            for (let i = 0; i < this.dom.childNodes.length; i++) {
                //@ts-ignore
                if (this.dom.childNodes[i].ui instanceof TreeViewItem) {
                    //@ts-ignore
                    return this.dom.childNodes[i].ui;
                }
            }
        }

        return null;
    }

    /**
     * Gets the last child item.
     * 
     * @type {TreeViewItem}
     */
    get lastChild() {
        if (this._numChildren) {
            for (let i = this.dom.childNodes.length - 1; i >= 0; i--) {
                // @ts-ignore
                if (this.dom.childNodes[i].ui instanceof TreeViewItem) {
                    //@ts-ignore
                    return this.dom.childNodes[i].ui;
                }
            }
        }

        return null;
    }

    /**
     * Gets the first sibling item.
     * 
     * @type {TreeViewItem}
     */
    get nextSibling() {
        let sibling = this.dom.nextSibling;
        //@ts-ignore
        while (sibling && !(sibling.ui instanceof TreeViewItem)) {
            sibling = sibling.nextSibling;
        }

        //@ts-ignore
        return sibling && sibling.ui;
    }

    /**
     * Gets the last sibling item.
     * 
     * @type {TreeViewItem}
     */
    get previousSibling() {
        let sibling = this.dom.previousSibling;
        //@ts-ignore
        while (sibling && !(sibling.ui instanceof TreeViewItem)) {
            sibling = sibling.previousSibling;
        }

        //@ts-ignore
        return sibling && sibling.ui;
    }

    /**
     * The icon shown before the text in the TreeViewItem.
     * 
     * @type {string}
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

    get icon() {
        return this._icon;
    }
}

export default TreeViewItem;
