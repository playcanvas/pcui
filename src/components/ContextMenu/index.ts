import Element from '../Element/index';
import Label from '../Label';
import Container from '../Container';

const CLASS_ContextMenu = 'pcui-contextmenu';
const CLASS_ContextMenu_active = CLASS_ContextMenu + '-active';
const CLASS_ContextMenu_parent = CLASS_ContextMenu + '-parent';
const CLASS_ContextMenu_child = CLASS_ContextMenu + '-child';
const CLASS_ContextMenu_parent_active = CLASS_ContextMenu_parent + '-active';

export interface ContextMenuArgs {
    /**
     * The array of items used to populate the array. Example item: \{ 'text': 'Hello World', 'onClick': () => console.log('Hello World') \}.
     */
    items?: any;
    /**
     * The dom element to attach this context menu to.
     */
    dom?: HTMLElement,
    /**
     * The dom element that will trigger the context menu to open when right clicked. If undefined args.dom will be used.
     */
    triggerElement?: HTMLElement
}

/**
 * Represents a context menu. LEGACY: This is a legacy component and will be removed in the future. Use Menu instead.
 */
class ContextMenu {
    static readonly defaultArgs: ContextMenuArgs = {};

    protected _menu: Container;

    protected _contextMenuEvent: void;

    protected _args: ContextMenuArgs;

    constructor(args: ContextMenuArgs = ContextMenu.defaultArgs) {
        args = { ...ContextMenu.defaultArgs, ...args };
        this._menu = new Container({ dom: args.dom });
        // @ts-ignore
        this._menu.contextMenu = this;
        this._args = args;
        this._menu.class.add(CLASS_ContextMenu);
        var menu = this._menu;

        var removeMenu = () => {
            this._menu.class.remove(CLASS_ContextMenu_active);
            document.removeEventListener('click', removeMenu);
        };

        var triggerElement = args.triggerElement || args.dom.parentElement;
        if (triggerElement) {
            this._contextMenuEvent = triggerElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                menu.class.add(CLASS_ContextMenu_active);
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
                menu.dom.setAttribute("style", `left: ${left}px; top: ${top}px`);
                document.addEventListener('click', removeMenu);
            });

            var mouseLeaveTimeout: any;
            menu.dom.addEventListener('mouseleave', () => {
                mouseLeaveTimeout = setTimeout(() => {
                    removeMenu();
                }, 500);
            });
            menu.dom.addEventListener('mouseenter', () => {
                if (mouseLeaveTimeout) {
                    clearTimeout(mouseLeaveTimeout);

                }
            });
        }

        if (!args.items) return;

        args.items.forEach((menuItem: any, i: number) => {
            var menuItemElement = new Container();
            menuItemElement.dom.setAttribute("style", `top: ${i * 27.0}px`);
            if (menuItem.onClick) {
                menuItemElement.on('click', (e) => {
                    e.stopPropagation();
                    removeMenu();
                    menuItem.onClick(e);
                });
            }
            var menuItemLabel = new Label({ text: menuItem.text });
            menuItemElement.append(menuItemLabel);
            this._menu.dom.append(menuItemElement.dom);
            if (menuItem.items) {
                menuItem.items.forEach((childItem: any, j: number) => {
                    var childMenuItemElement = new Container({ class: CLASS_ContextMenu_child });
                    childMenuItemElement.dom.setAttribute("style", `top: ${j * 27.0}px; left: 150px;`);
                    childMenuItemElement.on('click', (e) => {
                        e.stopPropagation();
                        removeMenu();
                        childItem.onClick(e);
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
                var left = e.clientX + maxMenuWidth > window.innerWidth ? -maxMenuWidth + 2.0 : maxMenuWidth;
                var top = 0;
                if (e.clientY + maxMenuHeight > window.innerHeight) {
                    top = -maxMenuHeight + 27.0;
                }
                menuItemElement.forEachChild((node, j) => {
                    if (j === 0) return;
                    node.dom.setAttribute("style", `top: ${top + (j - 1) * 27.0}px; left: ${left}px;`);
                });
            });
        });
    }
}

Element.register('contextmenu', ContextMenu);

export default ContextMenu;
