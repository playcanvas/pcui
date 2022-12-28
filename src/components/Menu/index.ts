import Element from '../Element/index';
import Container, { ContainerArgs } from '../Container';
import { IFocusable } from '../Element';
import MenuItem, { MenuItemArgs } from '../MenuItem';

const CLASS_MENU = 'pcui-menu';
const CLASS_MENU_ITEMS = CLASS_MENU + '-items';

/**
 * The arguments for the {@link Menu} constructor.
 */
export interface MenuArgs extends ContainerArgs {
    /**
     * An array of {@link MenuItemArgs}. If these are passed then new MenuItems will be created
     * and appended to the menu. Defaults to an empty array.
     */
    items: MenuItemArgs[];
}

/**
 * A Menu is a list of {@link MenuItem}s which can contain child MenuItems. Useful to show context
 * menus and nested menus. Note that a Menu must be appended to the root Element and then
 * positioned accordingly.
 */
class Menu extends Container implements IFocusable {
    static readonly defaultArgs: MenuArgs = {
        ...Container.defaultArgs,
        hidden: true,
        tabIndex: 1,
        items: []
    };

    protected _containerMenuItems: Container;

    constructor(args: MenuArgs = Menu.defaultArgs) {
        args = { ...Menu.defaultArgs, ...args };
        super(args);

        this.class.add(CLASS_MENU);

        this._containerMenuItems = new Container({
            class: CLASS_MENU_ITEMS,
            flex: true,
            flexDirection: 'column'
        });
        this.append(this._containerMenuItems);

        this.domContent = this._containerMenuItems.dom;

        this.on('click', this._onClickMenu);
        this.on('show', this._onShowMenu);
        this.dom.addEventListener('contextmenu', this._onClickMenu);
        this.dom.addEventListener('keydown', this._onKeyDown);

        if (args.items) {
            args.items.forEach((item: MenuItemArgs) => {
                const menuItem = new MenuItem(item);
                this.append(menuItem);
            });
        }
    }

    destroy() {
        if (this.destroyed) return;

        this.dom.removeEventListener('keydown', this._onKeyDown);
        this.dom.removeEventListener('contextmenu', this._onClickMenu);
        this.dom.removeEventListener('focus', this._onFocus);
        this.dom.removeEventListener('blur', this._onBlur);

        super.destroy();
    }

    protected _onAppendChild(element: Element) {
        if (element instanceof MenuItem) {
            element.menu = this;
        }
    }

    protected _onRemoveChild(element: Element) {
        if (element instanceof MenuItem) {
            element.menu = null;
        }
    }

    protected _onClickMenu = (evt: MouseEvent) => {
        if (!this._containerMenuItems.dom.contains(evt.target as Node)) {
            this.hidden = true;
        }
    };

    protected _onFocus = (evt: FocusEvent) => {
        this.emit('focus');
    };

    protected _onBlur = (evt: FocusEvent) => {
        this.emit('blur');
    };

    protected _filterMenuItems(item: MenuItem) {
        if (!(item instanceof MenuItem)) return;

        if (item.onIsEnabled) {
            item.enabled = item.onIsEnabled();
        }
        if (item.onIsVisible) {
            item.hidden = !item.onIsVisible();
        }

        // @ts-ignore
        item._containerItems.dom.childNodes.forEach((child) => {
            this._filterMenuItems(child.ui as MenuItem);
        });
    }

    protected _onShowMenu = () => {
        this.focus();

        // filter child menu items
        this._containerMenuItems.dom.childNodes.forEach((child) => {
            this._filterMenuItems(child.ui as MenuItem);
        });
    };

    protected _onKeyDown = (evt: KeyboardEvent) => {
        if (this.hidden) return;

        if (evt.key === 'Escape') {
            this.hidden = true;
        }
    };

    protected _limitSubmenuAtScreenEdges(item: MenuItem) {
        if (!(item instanceof MenuItem) || !item.hasChildren) return;

        // @ts-ignore
        const containerItems = item._containerItems;

        containerItems.style.top = '';
        containerItems.style.left = '';
        containerItems.style.right = '';

        const rect = containerItems.dom.getBoundingClientRect();
        // limit to bottom / top of screen
        if (rect.bottom > window.innerHeight) {
            containerItems.style.top = -(rect.bottom - window.innerHeight) + 'px';
        }
        if (rect.right > window.innerWidth) {
            containerItems.style.left = 'auto';
            containerItems.style.right = '100%';
        }

        containerItems.dom.childNodes.forEach((child) => {
            this._limitSubmenuAtScreenEdges(child.ui as MenuItem);
        });
    }

    focus() {
        this.dom.focus();
    }

    blur() {
        this.dom.blur();
    }

    /**
     * Positions the menu at the specified coordinates.
     *
     * @param x - The x coordinate.
     * @param y - The y coordinate.
     */
    position(x: number, y: number) {
        const rect = this._containerMenuItems.dom.getBoundingClientRect();

        let left = (x || 0);
        let top = (y || 0);

        // limit to bottom / top of screen
        if (top + rect.height > window.innerHeight) {
            top = window.innerHeight - rect.height;
        } else if (top < 0) {
            top = 0;
        }
        if (left + rect.width > window.innerWidth) {
            left = window.innerWidth - rect.width;
        } else if (left < 0) {
            left = 0;
        }

        this._containerMenuItems.style.left = left + 'px';
        this._containerMenuItems.style.top = top + 'px';

        this._containerMenuItems.dom.childNodes.forEach((child) => {
            this._limitSubmenuAtScreenEdges(child.ui as MenuItem);
        });
    }

    /**
     * Remove all the current menu items from the menu.
     */
    clear() {
        this._containerMenuItems.clear();
    }
}

export default Menu;
