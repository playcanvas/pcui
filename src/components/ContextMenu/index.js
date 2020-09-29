import './style.scss';
import Label from '../Label';
import Container from '../Container';

const CLASS_ContextMenu = 'pcui-contextmenu';
const CLASS_ContextMenu_active = CLASS_ContextMenu + '-active';
const CLASS_ContextMenu_parent = CLASS_ContextMenu + '-parent';
const CLASS_ContextMenu_child = CLASS_ContextMenu + '-child';
const CLASS_ContextMenu_parent_active = CLASS_ContextMenu_parent + '-active';

/**
 * @name ContextMenu
 * @classdesc Represents a context menu.
 */
class ContextMenu {
    /**
     * Creates a new ContextMenu.
     *
     * @param {object} args - The arguments. Extends the pcui.Container constructor arguments. All settable properties can also be set through the constructor.
     */
    constructor(args) {
        if (!args) args = {};

        this._menu = new Container({ dom: args.dom });
        this._menu.class.add(CLASS_ContextMenu);

        var removeMenu = () => {
            this._menu.class.remove(CLASS_ContextMenu_active);
            document.removeEventListener('click', removeMenu);
        };
        args.dom && args.dom.parentElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this._menu.class.add(CLASS_ContextMenu_active);
            var maxMenuHeight = args.items.length * 27.0;
            var maxMenuWidth = 150.0;
            var left = e.clientX;
            var top = e.clientY;
            if (maxMenuHeight + top > window.innerHeight) {
                var topDiff = (maxMenuHeight + top) - window.innerHeight;
                top -= topDiff;
            }
            if (maxMenuWidth + left > window.innerWidth) {
                var leftDiff = (maxMenuWidth + left) - window.innerWidth;
                left -= leftDiff;
            }
            args.dom.setAttribute("style", `left: ${left}px; top: ${top}px`);
            document.addEventListener('click', removeMenu);
        });

        if (!args.items) return;

        args.items.forEach((menuItem, i) => {
            var menuItemElement = new Container();
            menuItemElement.dom.setAttribute("style", `top: ${i * 27.0}px`);
            if (menuItem.onClick) {
                menuItemElement.on('click', (e) => {
                    e.stopPropagation(); removeMenu(); menuItem.onClick();
                });
            }
            var menuItemLabel = new Label({ text: menuItem.text });
            menuItemElement.append(menuItemLabel);
            this._menu.dom.append(menuItemElement.dom);
            if (menuItem.items) {
                menuItem.items.forEach((childItem, j) => {
                    var childMenuItemElement = new Container({ class: CLASS_ContextMenu_child });
                    childMenuItemElement.dom.setAttribute("style", `top: ${j * 27.0}px; left: 150px;`);
                    childMenuItemElement.on('click', (e) => {
                        e.stopPropagation(); removeMenu(); childItem.onClick();
                    });
                    var childMenuItemLabel = new Label({ text: childItem.text });
                    childMenuItemElement.append(childMenuItemLabel);
                    menuItemElement.append(childMenuItemElement);
                });
                menuItemElement.class.add(CLASS_ContextMenu_parent);
            }
            menuItemElement.dom.addEventListener('mouseover', (e) => {
                // if (!e.fromElement.classList.contains('pcui-contextmenu-parent')) return;
                this._menu.forEachChild(node => node.class.remove(CLASS_ContextMenu_parent_active));
                menuItemElement.class.add(CLASS_ContextMenu_parent_active);

                var maxMenuHeight = menuItem.items ? menuItem.items.length * 27.0 : 0.0;
                var maxMenuWidth = 150.0;
                var left = e.clientX + maxMenuWidth > window.innerWidth ? - maxMenuWidth + 2.0 : maxMenuWidth;
                var top = 0;
                if (e.clientY + maxMenuHeight > window.innerHeight) {
                    top = - maxMenuHeight + 27.0;
                }
                menuItemElement.forEachChild((node, j) => {
                    if (j === 0) return;
                    node.dom.setAttribute("style", `top: ${top + (j - 1) * 27.0}px; left: ${left}px;`);
                });
            });
        });
    }
}

export {
    ContextMenu
};
export default ContextMenu;
