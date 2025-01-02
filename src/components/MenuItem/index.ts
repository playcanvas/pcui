import { Observer } from '@playcanvas/observer';

import { Container, ContainerArgs } from '../Container';
import { Element, IBindable } from '../Element';
import { Label } from '../Label';

const CLASS_MENU_ITEM = 'pcui-menu-item';
const CLASS_MENU_ITEM_CONTENT = `${CLASS_MENU_ITEM}-content`;
const CLASS_MENU_ITEM_CHILDREN = `${CLASS_MENU_ITEM}-children`;
const CLASS_MENU_ITEM_HAS_CHILDREN = `${CLASS_MENU_ITEM}-has-children`;

/**
 * The arguments for the {@link MenuItem} constructor.
 */
interface MenuItemArgs extends ContainerArgs {
    value?: any;
    /**
     * Whether the MenuItem has any child MenuItems.
     */
    hasChildren?: boolean;
    /**
     * Sets the text shown on the MenuItem.
     */
    text?: string;
    /**
     * Sets the CSS code for an icon for the MenuItem. e.g. 'E401' (notice we omit the '\\' character).
     */
    icon?: string;
    /**
     * Sets the parent Menu Element.
     */
    menu?: any;
    /**
     * Sets the function called when we select the MenuItem.
     */
    onSelect?: (evt?: MouseEvent) => void;
    /**
     * Sets the function that determines whether the MenuItem should be enabled when the Menu is shown.
     */
    onIsEnabled?: () => boolean;
    /**
     * Sets the function that determines whether the MenuItem should be visible when the Menu is shown.
     */
    onIsVisible?: () => boolean;
    /**
     * An array of MenuItem constructor data. If defined then child MenuItems will be created and added to the MenuItem.
     */
    items?: Array<MenuItemArgs>;
}

/**
 * The MenuItem is a selectable option that is appended to a {@link Menu}. A MenuItem can also
 * contain child MenuItems (by appending them to the MenuItem). This can be useful to show nested
 * Menus.
 */
class MenuItem extends Container implements IBindable {
    /**
     * The function called when the MenuItem is selected.
     */
    public onSelect: (evt?: MouseEvent) => void;

    /**
     * The function that determines whether the MenuItem should be enabled when the Menu is shown.
     */
    public onIsEnabled: () => boolean;

    /**
     * The function that determines whether the MenuItem should be visible when the Menu is shown.
     */
    public onIsVisible: () => boolean;

    protected _containerContent: Container;

    protected _numChildren = 0;

    protected _icon: string = null;

    protected _labelText: Label;

    protected _containerItems: Container;

    protected _menu: any = null;

    protected _renderChanges: boolean;

    /**
     * Creates a new MenuItem.
     *
     * @param args - The arguments.
     */
    constructor(args: Readonly<MenuItemArgs> = {}) {
        super(args);

        this.class.add(CLASS_MENU_ITEM);

        this._containerContent = new Container({
            class: CLASS_MENU_ITEM_CONTENT,
            flex: true,
            flexDirection: 'row'
        });
        this.append(this._containerContent);

        this._labelText = new Label();
        this._containerContent.append(this._labelText);

        this._containerItems = new Container({
            class: CLASS_MENU_ITEM_CHILDREN
        });
        this.append(this._containerItems);
        this.domContent = this._containerItems.dom;

        this.text = args.text ?? 'Untitled';

        this.dom.addEventListener('click', this._onClickMenuItem);

        if (args.value) {
            this.value = args.value;
        }
        if (args.icon) {
            this.icon = args.icon;
        }
        if (args.binding) {
            this.binding = args.binding;
        }

        this.onSelect = args.onSelect;
        this.onIsEnabled = args.onIsEnabled;
        this.onIsVisible = args.onIsVisible;

        if (args.items) {
            args.items.forEach((item) => {
                const menuItem = new MenuItem(item);
                this.append(menuItem);
            });
        }
    }

    destroy() {
        if (this.destroyed) return;

        this.dom.removeEventListener('click', this._onClickMenuItem);

        super.destroy();
    }

    protected _onAppendChild(element: Element) {
        super._onAppendChild(element);

        this._numChildren++;
        if (element instanceof MenuItem) {
            this.class.add(CLASS_MENU_ITEM_HAS_CHILDREN);
            element.menu = this.menu;
        }
    }

    protected _onRemoveChild(element: Element) {
        if (element instanceof MenuItem) {
            this._numChildren--;
            if (this._numChildren === 0) {
                this.class.remove(CLASS_MENU_ITEM_HAS_CHILDREN);
            }
            element.menu = null;
        }
        super._onRemoveChild(element);
    }

    protected _onClickMenuItem = (evt: MouseEvent) => {
        evt.preventDefault();
        evt.stopPropagation();
        if (this.enabled) {
            this.onSelect?.(evt);
            this.emit('select');

            if (this.menu) {
                this.menu.hidden = true;
            }
        }
    };

    link(observers: Observer|Observer[], paths: string|string[]) {
        super.link(observers, paths);
        this._labelText.link(observers, paths);
    }

    unlink() {
        super.unlink();
        this._labelText.unlink();
    }

    /**
     * Selects the MenuItem which also happens automatically when the user clicks on the MenuItem.
     */
    select() {
        if (!this.enabled) return;
        this.onSelect?.();
        this.emit('select');

        if (this.menu) {
            this.menu.hidden = true;
        }
    }

    /**
     * Sets the text shown on the MenuItem.
     */
    set text(value) {
        this._labelText.text = value;
    }

    /**
     * Gets the text shown on the MenuItem.
     */
    get text() {
        return this._labelText.text;
    }

    set value(value) {
        this.text = value;
    }

    get value() {
        return this.text;
    }

    /* eslint accessor-pairs: 0 */
    set values(values: string[]) {
        this._labelText.values = values;
    }

    /**
     * Sets the CSS code for an icon for the MenuItem. e.g. 'E401' (notice we omit the '\\' character).
     */
    set icon(value) {
        if (this._icon === value || !value.match(/^E\d{0,4}$/)) return;
        this._icon = value;
        if (value) {
            // set data-icon attribute but first convert the value to a code point
            this._labelText.dom.setAttribute('data-icon', String.fromCodePoint(parseInt(value, 16)));
        } else {
            this._labelText.dom.removeAttribute('data-icon');
        }
    }

    /**
     * Gets the CSS code for an icon for the MenuItem.
     */
    get icon() {
        return this._icon;
    }

    /**
     * Sets the binding for the MenuItem label.
     */
    set binding(value) {
        this._labelText.binding = value;
    }

    /**
     * Gets the binding for the MenuItem label.
     */
    get binding() {
        return this._labelText.binding;
    }

    /**
     * Sets the menu.
     */
    set menu(value) {
        this._menu = value;

        // set menu on child menu items
        if (!this._containerItems.destroyed) {
            for (const child of this._containerItems.dom.childNodes) {
                if (child.ui instanceof MenuItem) {
                    child.ui.menu = value;
                }
            }
        }
    }

    /**
     * Gets the menu.
     */
    get menu() {
        return this._menu;
    }

    /**
     * Returns whether the MenuItem has children.
     */
    get hasChildren() {
        return this._numChildren > 0;
    }

    set renderChanges(value) {
        this._renderChanges = value;
    }

    get renderChanges() {
        return this._renderChanges;
    }
}

export { MenuItem, MenuItemArgs };
