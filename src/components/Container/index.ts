import { CLASS_FLEX, CLASS_GRID, CLASS_RESIZABLE, CLASS_SCROLLABLE } from '../../class';
import Element, { ElementArgs, IFlexArgs, IParentArgs } from '../Element';

const RESIZE_HANDLE_SIZE = 4;

const VALID_RESIZABLE_VALUES = [
    null,
    'top',
    'right',
    'bottom',
    'left'
];

const CLASS_RESIZING = CLASS_RESIZABLE + '-resizing';
const CLASS_RESIZABLE_HANDLE = 'pcui-resizable-handle';
const CLASS_CONTAINER = 'pcui-container';

const CLASS_DRAGGED = CLASS_CONTAINER + '-dragged';
const CLASS_DRAGGED_CHILD = CLASS_DRAGGED + '-child';

/**
 * The arguments for the {@link Container} constructor.
 */
export interface ContainerArgs extends ElementArgs, IParentArgs, IFlexArgs {
    /**
     * Sets whether the {@link Container} is resizable and where the resize handle is located. Can
     * be one of 'top', 'bottom', 'right', 'left'. Defaults to `null` which disables resizing.
     */
    resizable?: string,
    /**
     * Sets the minimum size the {@link Container} can take when resized in pixels.
     */
    resizeMin?: number,
    /**
     * Sets the maximum size the {@link Container} can take when resized in pixels.
     */
    resizeMax?: number,
    /**
     * Called when the {@link Container} has been resized.
     */
    onResize?: () => void,
    /**
     * Sets whether the {@link Container} should be scrollable.
     */
    scrollable?: boolean,
    /**
     * Sets whether the {@link Container} supports the grid layout.
     */
    grid?: boolean,
    /**
     * Sets the {@link Container}'s align items property.
     */
    alignItems?: string
}

/**
 * A container is the basic building block for {@link Element}s that are grouped together. A
 * container can contain any other element including other containers.
 */
class Container extends Element {
    /**
     * Fired when a child Element gets added to the Container.
     *
     * @event
     * @example
     * ```ts
     * const container = new Container();
     * container.on('append', (element: Element) => {
     *     console.log('Element added to container:', element);
     * });
     * ```
     */
    public static readonly EVENT_APPEND = 'append';

    /**
     * Fired when a child Element gets removed from the Container.
     *
     * @event
     * @example
     * ```ts
     * const container = new Container();
     * container.on('remove', (element: Element) => {
     *     console.log('Element removed from container:', element);
     * });
     * ```
     */
    public static readonly EVENT_REMOVE = 'remove';

    /**
     * Fired when the container is scrolled. The native DOM scroll event is passed to the event handler.
     *
     * @event
     * @example
     * ```ts
     * const container = new Container();
     * container.on('scroll', (event: Event) => {
     *     console.log('Container scrolled:', event);
     * });
     * ```
     */
    public static readonly EVENT_SCROLL = 'scroll';

    /**
     * Fired when the container gets resized using the resize handle.
     *
     * @event
     * @example
     * ```ts
     * const container = new Container();
     * container.on('resize', () => {
     *     console.log('Container resized to:', container.width, container.height, 'px');
     * });
     * ```
     */
    public static readonly EVENT_RESIZE = 'resize';

    protected _scrollable = false;

    protected _flex = false;

    protected _grid = false;

    protected _domResizeHandle: HTMLDivElement = null;

    protected _resizePointerId: number = null;

    protected _resizeData: { x: number, y: number, width: number, height: number } = null;

    protected _resizeHorizontally = true;

    protected _resizeMin = 100;

    protected _resizeMax = 300;

    protected _draggedStartIndex = -1;

    protected _domContent: HTMLElement;

    protected _resizable: string;

    /**
     * Creates a new Container.
     *
     * @param args - The arguments.
     */
    constructor(args: Readonly<ContainerArgs> = {}) {
        super(args);

        this.class.add(CLASS_CONTAINER);

        this.domContent = this._dom;

        // scroll
        if (args.scrollable) {
            this.scrollable = true;
        }

        // flex
        this.flex = !!args.flex;

        // grid
        let grid = !!args.grid;
        if (grid) {
            if (this.flex) {
                console.error('Invalid Container arguments: "grid" and "flex" cannot both be true.');
                grid = false;
            }
        }
        this.grid = grid;

        // resize related
        this.resizable = args.resizable ?? null;

        if (args.resizeMin !== undefined) {
            this.resizeMin = args.resizeMin;
        }
        if (args.resizeMax !== undefined) {
            this.resizeMax = args.resizeMax;
        }
    }

    destroy() {
        if (this._destroyed) return;
        this.domContent = null;

        if (this._domResizeHandle) {
            this._domResizeHandle.removeEventListener('pointerdown', this._onResizeStart);
            this._domResizeHandle.removeEventListener('pointermove', this._onResizeMove);
            this._domResizeHandle.removeEventListener('pointerup', this._onResizeEnd);
        }

        super.destroy();
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
        const idx = Array.prototype.indexOf.call(this.dom.childNodes, element.dom);

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
            this._domResizeHandle.removeEventListener('pointerdown', this._onResizeStart);
            this._domResizeHandle.removeEventListener('pointermove', this._onResizeMove);
            this._domResizeHandle.removeEventListener('pointerup', this._onResizeEnd);
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
            // console.log('Legacy ui.Element passed to Container', this.class, element.class);
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

    protected _onScroll = (evt: Event) => {
        this.emit('scroll', evt);
    };

    protected _createResizeHandle() {
        const handle = document.createElement('div');
        handle.classList.add(CLASS_RESIZABLE_HANDLE);
        handle.ui = this;

        handle.addEventListener('pointerdown', this._onResizeStart);
        handle.addEventListener('pointermove', this._onResizeMove);
        handle.addEventListener('pointerup', this._onResizeEnd);

        this._domResizeHandle = handle;
    }

    protected _onResizeStart = (evt: PointerEvent) => {
        if (this._resizePointerId !== null) return;

        evt.preventDefault();
        evt.stopPropagation();

        this._domResizeHandle.setPointerCapture(evt.pointerId);
        this._resizePointerId = evt.pointerId;

        this._resizeStart();
    };

    protected _onResizeMove = (evt: PointerEvent) => {
        if (this._resizePointerId !== evt.pointerId) return;

        evt.preventDefault();
        evt.stopPropagation();

        this._resizeMove(evt.clientX, evt.clientY);
    };

    protected _onResizeEnd = (evt: PointerEvent) => {
        if (this._resizePointerId !== evt.pointerId) return;

        evt.preventDefault();
        evt.stopPropagation();

        this._resizeEnd();

        this._domResizeHandle.releasePointerCapture(evt.pointerId);
        this._resizePointerId = null;
    };

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
                if (y + childPanel.height >= otherTop + otherPanel.height) {
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
     * return `false` from the function.
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
     * @param node - The current element in the dom structure which must be recursively
     * traversed and appended to its parent.
     * @param node.root - The root node of the dom structure.
     * @param node.children - The children of the root node.
     * @returns The recursively appended element node.
     */
    protected _buildDomNode(node: { [x: string]: any; root?: any; children?: any; }): Container {
        const keys = Object.keys(node);
        let rootNode: Container;
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
     * @param dom - An array of child pcui elements to append to this container.
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

    /**
     * Sets whether the Element supports flex layout.
     */
    set flex(value: boolean) {
        if (value === this._flex) return;

        this._flex = value;

        if (value) {
            this.class.add(CLASS_FLEX);
        } else {
            this.class.remove(CLASS_FLEX);
        }
    }

    /**
     * Gets whether the Element supports flex layout.
     */
    get flex(): boolean {
        return this._flex;
    }

    /**
     * Sets whether the Element supports the grid layout.
     */
    set grid(value: boolean) {
        if (value === this._grid) return;

        this._grid = value;

        if (value) {
            this.class.add(CLASS_GRID);
        } else {
            this.class.remove(CLASS_GRID);
        }
    }

    /**
     * Gets whether the Element supports the grid layout.
     */
    get grid(): boolean {
        return this._grid;
    }

    /**
     * Sets whether the Element should be scrollable.
     */
    set scrollable(value: boolean) {
        if (this._scrollable === value) return;

        this._scrollable = value;

        if (value) {
            this.class.add(CLASS_SCROLLABLE);
        } else {
            this.class.remove(CLASS_SCROLLABLE);
        }

    }

    /**
     * Gets whether the Element should be scrollable.
     */
    get scrollable(): boolean {
        return this._scrollable;
    }

    /**
     * Sets whether the Element is resizable and where the resize handle is located. Can be one of
     * 'top', 'bottom', 'right', 'left'. Set to null to disable resizing.
     */
    set resizable(value: string) {
        if (value === this._resizable) return;

        if (VALID_RESIZABLE_VALUES.indexOf(value) === -1) {
            console.error('Invalid resizable value: must be one of ' + VALID_RESIZABLE_VALUES.join(','));
            return;
        }

        // remove old class
        if (this._resizable) {
            this.class.remove(`${CLASS_RESIZABLE}-${this._resizable}`);
        }

        this._resizable = value;
        this._resizeHorizontally = (value === 'right' || value === 'left');

        if (value) {
            // add resize class and create / append resize handle
            this.class.add(CLASS_RESIZABLE);
            this.class.add(`${CLASS_RESIZABLE}-${value}`);

            if (!this._domResizeHandle) {
                this._createResizeHandle();
            }
            this._dom.appendChild(this._domResizeHandle);
        } else {
            // remove resize class and resize handle
            this.class.remove(CLASS_RESIZABLE);
            if (this._domResizeHandle) {
                this._dom.removeChild(this._domResizeHandle);
            }
        }
    }

    /**
     * Gets whether the Element is resizable and where the resize handle is located.
     */
    get resizable(): string {
        return this._resizable;
    }

    /**
     * Sets the minimum size the Element can take when resized in pixels.
     */
    set resizeMin(value: number) {
        this._resizeMin = Math.max(0, Math.min(value, this._resizeMax));
    }

    /**
     * Gets the minimum size the Element can take when resized in pixels.
     */
    get resizeMin(): number {
        return this._resizeMin;
    }

    /**
     * Sets the maximum size the Element can take when resized in pixels.
     */
    set resizeMax(value: number) {
        this._resizeMax = Math.max(this._resizeMin, value);
    }

    /**
     * Gets the maximum size the Element can take when resized in pixels.
     */
    get resizeMax(): number {
        return this._resizeMax;
    }

    /**
     * Sets the internal DOM element used as a the container of all children. Can be overridden by
     * derived classes.
     */
    set domContent(value: HTMLElement) {
        if (this._domContent === value) return;

        if (this._domContent) {
            this._domContent.removeEventListener('scroll', this._onScroll);
        }

        this._domContent = value;

        if (this._domContent) {
            this._domContent.addEventListener('scroll', this._onScroll);
        }
    }

    /**
     * Gets the internal DOM element used as a the container of all children.
     */
    get domContent(): HTMLElement {
        return this._domContent;
    }
}

Element.register('container', Container);

export default Container;
