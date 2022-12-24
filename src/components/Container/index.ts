import Element, { ElementArgs, IFlexArgs, IParentArgs } from '../Element/index';
import * as pcuiClass from '../../class';

const RESIZE_HANDLE_SIZE = 4;

const VALID_RESIZABLE_VALUES = [
    null,
    'top',
    'right',
    'bottom',
    'left'
];

const CLASS_RESIZING = pcuiClass.RESIZABLE + '-resizing';
const CLASS_RESIZABLE_HANDLE = 'pcui-resizable-handle';
const CLASS_CONTAINER = 'pcui-container';

const CLASS_DRAGGED = CLASS_CONTAINER + '-dragged';
const CLASS_DRAGGED_CHILD = CLASS_DRAGGED + '-child';

export interface ContainerArgs extends ElementArgs, IParentArgs, IFlexArgs {
    /**
     * Sets whether the Element is resizable and where the resize handle is located. Can
     * be one of 'top', 'bottom', 'right', 'left'. Set to null to disable resizing.
     */
    resizable?: string,
    /**
     * Sets the minimum size the Element can take when resized in pixels.
     */
    resizeMin?: number,
    /**
     * Sets the maximum size the Element can take when resized in pixels.
     */
    resizeMax?: number,
    /**
     * Called when the container has been resized.
     */
    onResize?: () => void,
    /**
     * Sets whether the Element should be scrollable.
     */
    scrollable?: boolean,
    /**
     * Sets whether the Element supports the grid layout.
     */
    grid?: boolean,
    /**
     * Sets the Elements align items property.
     */
    alignItems?: string
}

/**
 * A container is the basic building block for Elements that are grouped together.
 * A container can contain any other element including other containers.
 */
class Container extends Element {
    static readonly defaultArgs: ContainerArgs = {
        ...Element.defaultArgs,
        resizable: null,
        dom: 'div'
    };

    /**
     * @event
     * @name append
     * @description Fired when a child Element gets added to the Container
     * @param {Element} element - The element that was added
     */
    public static readonly EVENT_APPEND = 'append';

    /**
     * @event
     * @name remove
     * @description Fired when a child Element gets removed from the Container
     * @param {Element} element - The element that was removed
     */
    public static readonly EVENT_REMOVE = 'remove';

    /**
     * @event
     * @name scroll
     * @description Fired when the container is scrolled.
     * @param {Event} evt - The native scroll event.
     */
    public static readonly EVENT_SCROLL = 'scroll';

    /**
     * @event
     * @name resize
     * @description Fired when the container gets resized using the resize handle.
     */
    public static readonly EVENT_RESIZE = 'resize';

    protected _domEventScroll: any;

    protected _scrollable: boolean;

    protected _flex: boolean;

    protected _grid: boolean;

    protected _domResizeHandle: any;

    protected _domEventResizeStart: any;

    protected _domEventResizeMove: any;

    protected _domEventResizeEnd: any;

    protected _domEventResizeTouchStart: any;

    protected _domEventResizeTouchMove: any;

    protected _domEventResizeTouchEnd: any;

    protected _resizeTouchId: any;

    protected _resizeData: any;

    protected _resizeHorizontally: boolean;

    protected _resizeMin: number;

    protected _resizeMax: number;

    protected _draggedStartIndex: number;

    protected _domContent: any;

    protected _resizable: string;

    protected _draggedHeight: any;

    constructor(args: ContainerArgs = Container.defaultArgs) {
        args = { ...Container.defaultArgs, ...args };
        super(args.dom, args);

        this.class.add(CLASS_CONTAINER);

        this._domEventScroll = this._onScroll.bind(this);
        this.domContent = this._dom;

        // scroll
        this._scrollable = false;
        if (args.scrollable) {
            this.scrollable = true;
        }

        // flex
        this._flex = false;
        this.flex = !!args.flex;

        // grid
        this._grid = false;
        let grid = !!args.grid;
        if (grid) {
            if (this.flex) {
                console.error('Invalid pcui.Container arguments: "grid" and "flex" cannot both be true.');
                grid = false;
            }
        }
        this.grid = grid;

        // resize related
        this._domResizeHandle = null;
        this._domEventResizeStart = this._onResizeStart.bind(this);
        this._domEventResizeMove = this._onResizeMove.bind(this);
        this._domEventResizeEnd = this._onResizeEnd.bind(this);
        this._domEventResizeTouchStart = this._onResizeTouchStart.bind(this);
        this._domEventResizeTouchMove = this._onResizeTouchMove.bind(this);
        this._domEventResizeTouchEnd = this._onResizeTouchEnd.bind(this);
        this._resizeTouchId = null;
        this._resizeData = null;
        this._resizeHorizontally = true;

        this.resizable = args.resizable;
        this._resizeMin = 100;
        this._resizeMax = 300;

        if (args.resizeMin !== undefined) {
            this.resizeMin = args.resizeMin;
        }
        if (args.resizeMax !== undefined) {
            this.resizeMax = args.resizeMax;
        }

        this._draggedStartIndex = -1;
    }

    /**
     * Appends an element to the container.
     *
     * @param {Element} element - The element to append.
     * @fires 'append'
     */
    append(element: any) {
        const dom = this._getDomFromElement(element);
        this._domContent.appendChild(dom);
        this._onAppendChild(element);
    }

    /**
     * Appends an element to the container before the specified reference element.
     *
     * @param {Element} element - The element to append.
     * @param {Element} referenceElement - The element before which the element will be appended.
     * @fires 'append'
     */
    appendBefore(element: any, referenceElement: any) {
        const dom = this._getDomFromElement(element);
        this._domContent.appendChild(dom);
        const referenceDom =  referenceElement && this._getDomFromElement(referenceElement);

        this._domContent.insertBefore(dom, referenceDom);

        this._onAppendChild(element);
    }

    /**
     * Appends an element to the container just after the specified reference element.
     *
     * @param {Element} element - The element to append.
     * @param {Element} referenceElement - The element after which the element will be appended.
     * @fires 'append'
     */
    appendAfter(element: any, referenceElement: any) {
        const dom = this._getDomFromElement(element);
        const referenceDom = referenceElement && this._getDomFromElement(referenceElement);

        const elementBefore = referenceDom ? referenceDom.nextSibling : null;
        if (elementBefore) {
            this._domContent.insertBefore(dom, elementBefore);
        } else {
            this._domContent.appendChild(dom);
        }

        this._onAppendChild(element);
    }

    /**
     * Inserts an element in the beginning of the container.
     *
     * @param {Element} element - The element to prepend.
     * @fires 'append'
     */
    prepend(element: any) {
        const dom = this._getDomFromElement(element);
        const first = this._domContent.firstChild;
        if (first) {
            this._domContent.insertBefore(dom, first);
        } else {
            this._domContent.appendChild(dom);
        }

        this._onAppendChild(element);
    }

    /**
     * Removes the specified child element from the container.
     *
     * @param element - The element to remove.
     * @fires 'remove'
     */
    remove(element: Element) {
        if (element.parent !== this) return;

        const dom = this._getDomFromElement(element);
        this._domContent.removeChild(dom);

        this._onRemoveChild(element);
    }

    /**
     * Moves the specified child at the specified index.
     *
     * @param element - The element to move.
     * @param index - The index to move the element to.
     */
    move(element: Element, index: number) {
        let idx = -1;
        for (let i = 0; i < this.dom.childNodes.length; i++) {
            if (this.dom.childNodes[i].ui === element) {
                idx = i;
                break;
            }
        }

        if (idx === -1) {
            this.appendBefore(element, this.dom.childNodes[index]);
        } else if (index !== idx) {
            this.remove(element);
            if (index < idx) {
                this.appendBefore(element, this.dom.childNodes[index]);
            } else {
                this.appendAfter(element, this.dom.childNodes[index - 1]);
            }
        }
    }

    /**
     * Clears all children from the container.
     *
     * @fires 'remove' for each child element.
     */
    clear() {
        let i = this._domContent.childNodes.length;
        while (i--) {
            const node = this._domContent.childNodes[i];
            if (node.ui && node.ui !== this) {
                node.ui.destroy();
            }
        }

        if (this._domResizeHandle) {
            this._domResizeHandle.removeEventListener('mousedown', this._domEventResizeStart);
            this._domResizeHandle.removeEventListener('touchstart', this._domEventResizeTouchStart, { passive: false });
            this._domResizeHandle = null;
        }

        this._domContent.innerHTML = '';

        if (this.resizable) {
            this._createResizeHandle();
            this._dom.appendChild(this._domResizeHandle);
        }
    }

    // Used for backwards compatibility with the legacy ui framework
    protected _getDomFromElement(element: any) {
        if (element.dom) {
            return element.dom;
        }

        if (element.element) {
            // console.log('Legacy ui.Element passed to pcui.Container', this.class, element.class);
            return element.element;
        }

        return element;
    }

    protected _onAppendChild(element: Element) {
        element.parent = this;
        this.emit('append', element);
    }

    protected _onRemoveChild(element: Element) {
        element.parent = null;
        this.emit('remove', element);
    }

    protected _onScroll(evt: Event) {
        this.emit('scroll', evt);
    }

    protected _createResizeHandle() {
        const handle = document.createElement('div');
        handle.classList.add(CLASS_RESIZABLE_HANDLE);
        handle.ui = this;

        handle.addEventListener('mousedown', this._domEventResizeStart);
        handle.addEventListener('touchstart', this._domEventResizeTouchStart, { passive: false });

        this._domResizeHandle = handle;
    }

    protected _onResizeStart(evt: MouseEvent) {
        evt.preventDefault();
        evt.stopPropagation();

        window.addEventListener('mousemove', this._domEventResizeMove);
        window.addEventListener('mouseup', this._domEventResizeEnd);

        this._resizeStart();
    }

    protected _onResizeMove(evt: MouseEvent) {
        evt.preventDefault();
        evt.stopPropagation();

        this._resizeMove(evt.clientX, evt.clientY);
    }

    protected _onResizeEnd(evt: MouseEvent) {
        evt.preventDefault();
        evt.stopPropagation();

        window.removeEventListener('mousemove', this._domEventResizeMove);
        window.removeEventListener('mouseup', this._domEventResizeEnd);

        this._resizeEnd();
    }

    protected _onResizeTouchStart(evt: TouchEvent) {
        evt.preventDefault();
        evt.stopPropagation();

        for (let i = 0; i < evt.changedTouches.length; i++) {
            const touch = evt.changedTouches[i];
            if (touch.target === this._domResizeHandle) {
                this._resizeTouchId = touch.identifier;
            }
        }

        window.addEventListener('touchmove', this._domEventResizeTouchMove);
        window.addEventListener('touchend', this._domEventResizeTouchEnd);

        this._resizeStart();
    }

    protected _onResizeTouchMove(evt: TouchEvent) {
        for (let i = 0; i < evt.changedTouches.length; i++) {
            const touch = evt.changedTouches[i];
            if (touch.identifier !== this._resizeTouchId) {
                continue;
            }

            evt.stopPropagation();
            evt.preventDefault();

            this._resizeMove(touch.clientX, touch.clientY);

            break;
        }
    }

    protected _onResizeTouchEnd(evt: TouchEvent) {
        for (let i = 0; i < evt.changedTouches.length; i++) {
            const touch = evt.changedTouches[i];
            if (touch.identifier === this._resizeTouchId) {
                continue;
            }

            this._resizeTouchId = null;

            evt.preventDefault();
            evt.stopPropagation();

            window.removeEventListener('touchmove', this._domEventResizeTouchMove);
            window.removeEventListener('touchend', this._domEventResizeTouchEnd);

            this._resizeEnd();

            break;
        }
    }

    protected _resizeStart() {
        this.class.add(CLASS_RESIZING);
    }

    protected _resizeMove(x: number, y: number) {
        // if we haven't initialized resizeData do so now
        if (!this._resizeData) {
            this._resizeData = {
                x: x,
                y: y,
                width: this.dom.clientWidth,
                height: this.dom.clientHeight
            };

            return;
        }

        if (this._resizeHorizontally) {
            // horizontal resizing
            let offsetX = this._resizeData.x - x;

            if (this._resizable === 'right') {
                offsetX = -offsetX;
            }

            this.width = RESIZE_HANDLE_SIZE + Math.max(this._resizeMin, Math.min(this._resizeMax, (this._resizeData.width + offsetX)));
        } else {
            // vertical resizing
            let offsetY = this._resizeData.y - y;

            if (this._resizable === 'bottom') {
                offsetY = -offsetY;
            }

            this.height = Math.max(this._resizeMin, Math.min(this._resizeMax, (this._resizeData.height + offsetY)));
        }

        this.emit('resize');
    }

    protected _resizeEnd() {
        this._resizeData = null;
        this.class.remove(CLASS_RESIZING);
    }

    /**
     * Resize the container.
     *
     * @param x - The number of pixels to resize the width.
     * @param y - The number of pixels to resize the height.
     */
    resize(x: number, y: number) {
        x = x || 0;
        y = y || 0;

        this._resizeStart();
        this._resizeMove(0, 0);
        this._resizeMove(-x + RESIZE_HANDLE_SIZE, -y);
        this._resizeEnd();
    }

    protected _getDraggedChildIndex(draggedChild: Element) {
        for (let i = 0; i < this.dom.childNodes.length; i++) {
            if (this.dom.childNodes[i].ui  === draggedChild) {
                return i;
            }
        }

        return -1;
    }

    protected _onChildDragStart(evt: MouseEvent, childPanel: Element) {
        this.class.add(CLASS_DRAGGED_CHILD);

        this._draggedStartIndex = this._getDraggedChildIndex(childPanel);

        childPanel.class.add(CLASS_DRAGGED);

        this._draggedHeight = childPanel.height;

        this.emit('child:dragstart', childPanel, this._draggedStartIndex);
    }

    protected _onChildDragMove(evt: MouseEvent, childPanel: Element) {
        const rect = this.dom.getBoundingClientRect();

        const dragOut = (evt.clientX < rect.left || evt.clientX > rect.right || evt.clientY < rect.top || evt.clientY > rect.bottom);

        const childPanelIndex = this._getDraggedChildIndex(childPanel);

        if (dragOut) {
            childPanel.class.remove(CLASS_DRAGGED);
            if (this._draggedStartIndex !== childPanelIndex) {
                this.remove(childPanel);
                if (this._draggedStartIndex < childPanelIndex) {
                    this.appendBefore(childPanel, this.dom.childNodes[this._draggedStartIndex]);
                } else {
                    this.appendAfter(childPanel, this.dom.childNodes[this._draggedStartIndex - 1]);
                }
            }

            return;
        }

        childPanel.class.add(CLASS_DRAGGED);

        const y = evt.clientY - rect.top;
        let ind = null;

        // hovered script
        for (let i = 0; i < this.dom.childNodes.length; i++) {
            const otherPanel = this.dom.childNodes[i].ui as any;
            const otherTop = otherPanel.dom.offsetTop;
            if (i < childPanelIndex) {
                if (y <= otherTop + otherPanel.header.height) {
                    ind = i;
                    break;
                }
            } else if (i > childPanelIndex) {
                if (y + (childPanel.height as number) >= otherTop + otherPanel.height) {
                    ind = i;
                    break;
                }
            }
        }

        if (ind !== null && childPanelIndex !== ind) {
            this.remove(childPanel);
            if (ind < childPanelIndex) {
                this.appendBefore(childPanel, this.dom.childNodes[ind]);
            } else {
                this.appendAfter(childPanel, this.dom.childNodes[ind - 1]);
            }
        }
    }

    protected _onChildDragEnd(evt: MouseEvent, childPanel: Element) {
        this.class.remove(CLASS_DRAGGED_CHILD);

        childPanel.class.remove(CLASS_DRAGGED);

        const index = this._getDraggedChildIndex(childPanel);

        this.emit('child:dragend', childPanel, index, this._draggedStartIndex);

        this._draggedStartIndex = -1;
    }

    /**
     * Iterate over each child element using the supplied function. To early out of the iteration,
     * return false from the function.
     *
     * @param fn - The function to call for each child element.
     */
    forEachChild(fn: (child: Element, index: number) => void | false) {
        for (let i = 0; i < this.dom.childNodes.length; i++) {
            const node = this.dom.childNodes[i].ui;
            if (node) {
                const result = fn(node, i);
                if (result === false) {
                    // early out
                    break;
                }
            }
        }
    }

    /**
     * If the current node contains a root, recursively append its children to this node
     * and return it. Otherwise return the current node. Also add each child to the parent
     * under its keyed name.
     *
     * @param {object} node - The current element in the dom structure which must be recursively
     * traversed and appended to its parent
     *
     * @param node.root
     * @param node.children
     * @returns {Element} - The recursively appended element node
     *
     */
    protected _buildDomNode(node: { [x: string]: any; root?: any; children?: any; }) {
        const keys = Object.keys(node);
        let rootNode: { append: (arg0: any) => void; };
        if (keys.includes('root')) {
            rootNode = this._buildDomNode(node.root);
            node.children.forEach((childNode: any) => {
                const childNodeElement = this._buildDomNode(childNode);
                if (childNodeElement !== null) {
                    rootNode.append(childNodeElement);
                }
            });
        } else {
            rootNode = node[keys[0]];
            // @ts-ignore
            this[`_${keys[0]}`] = rootNode;
        }
        return rootNode;
    }

    /**
     * Takes an array of pcui elements, each of which can contain their own child elements, and
     * appends them to this container. These child elements are traversed recursively using
     * _buildDomNode.
     *
     * @param {Array} dom - An array of child pcui elements to append to this container.
     *
     * @example
     * buildDom([
     *     {
     *         child1: pcui.Label()
     *     },
     *     {
     *         root: {
     *             container1: pcui.Container()
     *         },
     *         children: [
     *             {
     *                 child2: pcui.Label()
     *             },
     *             {
     *                 child3: pcui.Label()
     *             }
     *         ]
     *     }
     * ]);
     */
    buildDom(dom: any[]) {
        dom.forEach((node: any) => {
            const builtNode = this._buildDomNode(node);
            this.append(builtNode);
        });
    }

    destroy() {
        if (this._destroyed) return;
        this.domContent = null;

        if (this._domResizeHandle) {
            this._domResizeHandle.removeEventListener('mousedown', this._domEventResizeStart);
            window.removeEventListener('mousemove', this._domEventResizeMove);
            window.removeEventListener('mouseup', this._domEventResizeEnd);

            this._domResizeHandle.removeEventListener('touchstart', this._domEventResizeTouchStart);
            window.removeEventListener('touchmove', this._domEventResizeTouchMove);
            window.removeEventListener('touchend', this._domEventResizeTouchEnd);
        }

        this._domResizeHandle = null;
        this._domEventResizeStart = null;
        this._domEventResizeMove = null;
        this._domEventResizeEnd = null;
        this._domEventResizeTouchStart = null;
        this._domEventResizeTouchMove = null;
        this._domEventResizeTouchEnd = null;
        this._domEventScroll = null;

        super.destroy();
    }

    /**
     * Gets / sets whether the Element supports flex layout.
     */
    set flex(value: boolean) {
        if (value === this._flex) return;

        this._flex = value;

        if (value) {
            this.classAdd(pcuiClass.FLEX);
        } else {
            this.classRemove(pcuiClass.FLEX);
        }
    }

    get flex(): boolean {
        return this._flex;
    }

    /**
     * Gets / sets whether the Element supports the grid layout.
     */
    set grid(value: boolean) {
        if (value === this._grid) return;

        this._grid = value;

        if (value) {
            this.classAdd(pcuiClass.GRID);
        } else {
            this.classRemove(pcuiClass.GRID);
        }
    }

    get grid(): boolean {
        return this._grid;
    }

    /**
     * Gets /sets whether the Element should be scrollable.
     */
    set scrollable(value: boolean) {
        if (this._scrollable === value) return;

        this._scrollable = value;

        if (value) {
            this.classAdd(pcuiClass.SCROLLABLE);
        } else {
            this.classRemove(pcuiClass.SCROLLABLE);
        }

    }

    get scrollable(): boolean {
        return this._scrollable;
    }

    /**
     * Gets / sets whether the Element is resizable and where the resize handle is located. Can
     * be one of 'top', 'bottom', 'right', 'left'. Set to null to disable resizing.
     */
    set resizable(value: string) {
        if (value === this._resizable) return;

        if (VALID_RESIZABLE_VALUES.indexOf(value) === -1) {
            console.error('Invalid resizable value: must be one of ' + VALID_RESIZABLE_VALUES.join(','));
            return;
        }

        // remove old class
        if (this._resizable) {
            this.classRemove(`${pcuiClass.RESIZABLE}-${this._resizable}`);
        }

        this._resizable = value;
        this._resizeHorizontally = (value === 'right' || value === 'left');

        if (value) {
            // add resize class and create / append resize handle
            this.classAdd(pcuiClass.RESIZABLE);
            this.classAdd(`${pcuiClass.RESIZABLE}-${value}`);

            if (!this._domResizeHandle) {
                this._createResizeHandle();
            }
            this._dom.appendChild(this._domResizeHandle);
        } else {
            // remove resize class and resize handle
            this.classRemove(pcuiClass.RESIZABLE);
            if (this._domResizeHandle) {
                this._dom.removeChild(this._domResizeHandle);
            }
        }
    }

    get resizable(): string {
        return this._resizable;
    }

    /**
     * Gets / sets the minimum size the Element can take when resized in pixels.
     */
    set resizeMin(value: number) {
        this._resizeMin = Math.max(0, Math.min(value, this._resizeMax));
    }

    get resizeMin(): number {
        return this._resizeMin;
    }

    /**
     * Gets / sets the maximum size the Element can take when resized in pixels.
     */
    set resizeMax(value: number) {
        this._resizeMax = Math.max(this._resizeMin, value);
    }

    get resizeMax(): number {
        return this._resizeMax;
    }

    /**
     * The internal dom element used as a the container of all children.
     * Can be overridden by derived classes.
     */
    set domContent(value: HTMLElement) {
        if (this._domContent === value) return;

        if (this._domContent) {
            this._domContent.removeEventListener('scroll', this._domEventScroll);
        }

        this._domContent = value;

        if (this._domContent) {
            this._domContent.addEventListener('scroll', this._domEventScroll);
        }
    }

    get domContent(): HTMLElement {
        return this._domContent;
    }
}

Element.register('container', Container);

export default Container;
