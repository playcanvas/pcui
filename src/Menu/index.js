import Container from '../Container';
import MenuItem from '../MenuItem';

const CLASS_MENU = 'pcui-menu';
const CLASS_MENU_ITEMS = CLASS_MENU + '-items';

/**
 * @name Menu
 * @class
 * @classdesc A Menu is a list of MenuItems which can contain child MenuItems. Useful
 * to show context menus and nested menus. Note that a Menu must be appended to the root Element
 * and then positioned accordingly.
 * @augments Container
 * @mixes IFocusable
 */
class Menu extends Container {
    /**
     * Creates a new Menu.
     *
     * @param {object} args - The arguments. Extends the pcui.Container constructor arguments. All settable properties can also be set through the constructor.
     * @param {object[]} args.items - An optional array of MenuItem data. If these are passed then new MenuItems will be created and appended to the menu.
     */
    constructor(args) {
        if (!args) args = {};

        if (args.hidden === undefined) {
            args.hidden = true;
        }

        if (args.tabIndex === undefined) {
            args.tabIndex = 1;
        }

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
            args.items.forEach((item) => {
                const menuItem = new MenuItem(item);
                this.append(menuItem);
            });
        }
    }

    _onAppendChild(element) {
        if (element instanceof MenuItem) {
            element.menu = this;
        }
    }

    _onRemoveChild(element) {
        if (element instanceof MenuItem) {
            element.menu = null;
        }
    }

    _onClickMenu(evt) {
        if (!this._containerMenuItems.dom.contains(evt.target)) {
            this.hidden = true;
        }
    }

    _onFocus(evt) {
        this.emit('focus');
    }

    _onBlur(evt) {
        this.emit('blur');
    }

    _onShowMenu() {
        this.focus();

        // filter child menu items
        this._containerMenuItems.dom.childNodes.forEach((child) => {
            this._filterMenuItems(child.ui);
        });
    }

    _filterMenuItems(item) {
        if (!(item instanceof MenuItem)) return;

        if (item.onIsEnabled) {
            item.enabled = item.onIsEnabled();
        }
        if (item.onIsVisible) {
            item.hidden = !item.onIsVisible();
        }

        item._containerItems.dom.childNodes.forEach((child) => {
            this._filterMenuItems(child.ui);
        });
    }

    _onKeyDown(evt) {
        if (this.hidden) return;

        // hide on esc
        if (evt.keyCode === 27) {
            this.hidden = true;
        }
    }

    _limitSubmenuAtScreenEdges(item) {
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
    position(x, y) {
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
