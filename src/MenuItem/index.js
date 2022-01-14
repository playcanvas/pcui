import Container from '../Container';
import Label from '../Label';

import './style.scss';

const CLASS_MENU_ITEM = 'pcui-menu-item';
const CLASS_MENU_ITEM_CONTENT = CLASS_MENU_ITEM + '-content';
const CLASS_MENU_ITEM_CHILDREN = CLASS_MENU_ITEM + '-children';
const CLASS_MENU_ITEM_HAS_CHILDREN = CLASS_MENU_ITEM + '-has-children';

/**
 * @name MenuItem
 * @class
 * @classdesc The MenuItem is a selectable option that is appended to a Menu.
 * A MenuItem can also contain child MenuItems (by appending them to the MenuItem). This
 * can be useful to show nested Menus.
 * @augments Container
 * @mixes IBindable
 *
 * @property {boolean} hasChildren - Whether the MenuItem has any child MenuItems.
 * @property {string} text - Gets / sets the text shown on the MenuItem.
 * @property {string} icon - Gets / sets the CSS code for an icon for the MenuItem. e.g. E401 (notice we omit the '\' character).
 * @property {Menu} menu Gets / sets the parent Menu Element.
 * @property {Function} onSelect Gets / sets the function called when we select the MenuItem.
 * @property {Function} onIsEnabled Gets / sets the function that determines whether the MenuItem should be enabled when the Menu is shown.
 * @property {Function} onIsVisible Gets / sets the function that determines whether the MenuItem should be visible when the Menu is shown.
 */
class MenuItem extends Container {
    /**
     * Creates new MenuItem.
     *
     * @param {object} args - The arguments. Extends the pcui.Container constructor arguments. All settable properties can also be set through the constructor.
     * @param {object[]} args.items - An array of MenuItem constructor data. If defined then child MenuItems will be created and added to the MenuItem.
     */
    constructor(args) {
        if (!args) args = {};

        super(args);

        this.class.add(CLASS_MENU_ITEM);

        this._containerContent = new Container({
            class: CLASS_MENU_ITEM_CONTENT,
            flex: true,
            flexDirection: 'row'
        });
        this.append(this._containerContent);

        this._numChildren = 0;

        this._icon = null;

        this._labelText = new Label();
        this._containerContent.append(this._labelText);

        this._containerItems = new Container({
            class: CLASS_MENU_ITEM_CHILDREN
        });
        this.append(this._containerItems);
        this.domContent = this._containerItems.dom;

        this.text = args.text || 'Untitled';

        this._domEvtMenuItemClick = this._onClickMenuItem.bind(this);
        this.dom.addEventListener('click', this._domEvtMenuItemClick);

        if (args.value) {
            this.value = args.value;
        }
        if (args.icon) {
            this.icon = args.icon;
        }
        if (args.binding) {
            this.binding = args.binding;
        }

        this.onIsEnabled = args.onIsEnabled;
        this.onSelect = args.onSelect;
        this.onIsVisible = args.onIsVisible;

        this._menu = null;

        if (args.items) {
            args.items.forEach((item) => {
                const menuItem = new MenuItem(item);
                this.append(menuItem);
            });
        }
    }

    _onAppendChild(element) {
        super._onAppendChild(element);

        this._numChildren++;
        if (element instanceof MenuItem) {
            this.class.add(CLASS_MENU_ITEM_HAS_CHILDREN);
            element.menu = this.menu;
        }
    }

    _onRemoveChild(element) {
        if (element instanceof MenuItem) {
            this._numChildren--;
            if (this._numChildren === 0) {
                this.class.remove(CLASS_MENU_ITEM_HAS_CHILDREN);
            }
            element.menu = null;
        }
        super._onRemoveChild(element);
    }

    _onClickMenuItem(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if (!this.disabled) {
            this.select();
        }
    }

    link(observers, paths) {
        super.link(observers, paths);
        this._labelText.link(observers, paths);
    }

    unlink() {
        super.unlink();
        this._labelText.unlink();
    }

    /**
     * Selects the MenuItem which also happens automatically
     * when the user clicks on the MenuItem.
     */
    select() {
        if (!this.enabled) return;
        if (this._onSelect) {
            this._onSelect();
        }
        this.emit('select');

        if (this.menu) {
            this.menu.hidden = true;
        }
    }

    destroy() {
        if (this.destroyed) return;

        this.dom.removeEventListener('click', this._domEvtMenuItemClick);

        super.destroy();
    }

    get text() {
        return this._labelText.text;
    }

    set text(value) {
        this._labelText.text = value;
    }

    get value() {
        return this.text;
    }

    set value(value) {
        this.text = value;
    }

    /* eslint accessor-pairs: 0 */
    set values(values) {
        this._labelText.values = values;
    }

    get icon() {
        return this._icon;
    }

    set icon(value) {
        if (this._icon === value || !value.match(/^E[0-9]{0,4}$/)) return;
        this._icon = value;
        if (value) {
            // set data-icon attribute but first convert the value to a code point
            this._labelText.dom.setAttribute('data-icon', String.fromCodePoint(parseInt(value, 16)));
        } else {
            this._labelText.dom.removeAttribute('data-icon');
        }
    }

    get binding() {
        return this._labelText.binding;
    }

    set binding(value) {
        this._labelText.binding = value;
    }

    get menu() {
        return this._menu;
    }

    set menu(value) {
        this._menu = value;

        // set menu on child menu items
        if (!this._containerItems.destroyed) {
            this._containerItems.dom.childNodes.forEach((child) => {
                if (child.ui instanceof MenuItem) {
                    child.ui.menu = value;
                }
            });
        }
    }

    get onSelect() {
        return this._onSelect;
    }

    set onSelect(value) {
        this._onSelect = value;
    }

    get onIsEnabled() {
        return this._onIsEnabled;
    }

    set onIsEnabled(value) {
        this._onIsEnabled = value;
    }

    get onIsVisible() {
        return this._onIsVisible;
    }

    set onIsVisible(value) {
        this._onIsVisible = value;
    }

    get hasChildren() {
        return this._numChildren > 0;
    }
}

export default MenuItem;
