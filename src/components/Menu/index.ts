import Container from '../Container';
import Element from '../Element';
import MenuItem from '../MenuItem';

const CLASS_MENU = 'pcui-menu';
const CLASS_MENU_ITEMS = CLASS_MENU + '-items';

namespace Menu {
    export interface Args extends Container.Args {
        /**
         * An optional array of MenuItem data. If these are passed then new MenuItems will be created and appended to the menu.
         */
        items: any;
    }
}

/**
 * A Menu is a list of MenuItems which can contain child MenuItems. Useful
 * to show context menus and nested menus. Note that a Menu must be appended to the root Element
 * and then positioned accordingly.
 */
class Menu extends Container implements Element.IFocusable {
    static readonly defaultArgs: Menu.Args = {
        ...Container.defaultArgs,
        hidden: true,
        tabIndex: 1,
        items: []
    };

    protected _containerMenuItems: Container;

    protected _domEvtContextMenu: any;

    protected _domEvtKeyDown: any;

    protected _domEvtFocus: any;

    protected _domEvtBlur: any;

    constructor(args: Menu.Args = Menu.defaultArgs) {
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

        this._domEvtContextMenu = this._onClickMenu.bind(this);
        this._domEvtKeyDown = this._onKeyDown.bind(this);
        this._domEvtFocus = this._onFocus.bind(this);
        this._domEvtBlur = this._onBlur.bind(this);

        this.on('click', this._onClickMenu.bind(this));
        this.on('show', this._onShowMenu.bind(this));
        this.dom.addEventListener('contextmenu', this._domEvtContextMenu);
        this.dom.addEventListener('keydown', this._domEvtKeyDown);

        if (args.items) {
            args.items.forEach((item: any) => {
                const menuItem = new MenuItem(item);
                this.append(menuItem);
            });
        }
    }

    protected _onAppendChild(element: any) {
        if (element instanceof MenuItem) {
            element.menu = this;
        }
    }

    protected _onRemoveChild(element: { menu: any; }) {
        if (element instanceof MenuItem) {
            element.menu = null;
        }
    }

    protected _onClickMenu(evt: MouseEvent) {
        if (!this._containerMenuItems.dom.contains(evt.target as Node)) {
            this.hidden = true;
        }
    }

    protected _onFocus(evt: FocusEvent) {
        this.emit('focus');
    }

    protected _onBlur(evt: FocusEvent) {
        this.emit('blur');
    }

    protected _onShowMenu() {
        this.focus();

        // filter child menu items
        this._containerMenuItems.dom.childNodes.forEach((child) => {
            // @ts-ignore
            this._filterMenuItems(child.ui);
        });
    }

    protected _filterMenuItems(item: { onIsEnabled: () => any; enabled: any; onIsVisible: () => any; hidden: boolean; _containerItems: { dom: { childNodes: any[]; }; }; }) {
        if (!(item instanceof MenuItem)) return;

        if (item.onIsEnabled) {
            item.enabled = item.onIsEnabled();
        }
        if (item.onIsVisible) {
            item.hidden = !item.onIsVisible();
        }

        item._containerItems.dom.childNodes.forEach((child) => {
            // @ts-ignore
            this._filterMenuItems(child.ui);
        });
    }

    protected _onKeyDown(evt: KeyboardEvent) {
        if (this.hidden) return;

        // hide on esc
        if (evt.keyCode === 27) {
            this.hidden = true;
        }
    }

    protected _limitSubmenuAtScreenEdges(item: { hasChildren: any; _containerItems: { style: { top: string; left: string; right: string; }; dom: { getBoundingClientRect: () => any; childNodes: any[]; }; }; }) {
        if (!(item instanceof MenuItem) || !item.hasChildren) return;

        item._containerItems.style.top = '';
        item._containerItems.style.left = '';
        item._containerItems.style.right = '';

        const rect = item._containerItems.dom.getBoundingClientRect();
        // limit to bottom / top of screen
        if (rect.bottom > window.innerHeight) {
            item._containerItems.style.top = -(rect.bottom - window.innerHeight) + 'px';
        }
        if (rect.right > window.innerWidth) {
            item._containerItems.style.left = 'auto';
            item._containerItems.style.right = '100%';
        }

        item._containerItems.dom.childNodes.forEach((child) => {
            // @ts-ignore
            this._limitSubmenuAtScreenEdges(child.ui);
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
     * @param {number} x - The x coordinate.
     * @param {number} y - The y coordinate.
     */
    position(x: any, y: any) {
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
            // @ts-ignore
            this._limitSubmenuAtScreenEdges(child.ui);
        });
    }

    destroy() {
        if (this.destroyed) return;

        this.dom.removeEventListener('keydown', this._domEvtKeyDown);
        this.dom.removeEventListener('contextmenu', this._domEvtContextMenu);
        this.dom.removeEventListener('focus', this._domEvtFocus);
        this.dom.removeEventListener('blur', this._domEvtBlur);

        super.destroy();
    }
}

export default Menu;
