import * as React from 'react';
import { EventHandle, Events, HandleEvent, Observer } from '@playcanvas/observer';

import { CLASS_DISABLED, CLASS_ERROR, CLASS_FLASH, CLASS_FONT_REGULAR, CLASS_HIDDEN, CLASS_READONLY } from '../../class';
import { BindingBase } from '../../binding';

const CLASS_ELEMENT = 'pcui-element';

// these are properties that are
// available as Element properties and
// can also be set through the Element constructor
const SIMPLE_CSS_PROPERTIES = [
    'flexDirection',
    'flexGrow',
    'flexBasis',
    'flexShrink',
    'flexWrap',
    'alignItems',
    'alignSelf',
    'justifyContent',
    'justifySelf'
];

// Stores Element types by name and default arguments
const elementRegistry: Map<string, any> = new Map();

interface IBindable {
    /**
     * Sets the value of the Element.
     */
    set value(values: any),
    /**
     * Gets the value of the Element.
     */
    get value(): any,
    /**
     * Sets multiple values on the Element. It is up to the Element to determine how to display them.
     */
    set values(values: Array<any>),
    /**
     * Gets multiple values on the Element.
     */
    get values(): Array<any>,
    /**
     * Sets whether the input should flash on changes.
     */
    set renderChanges(value: boolean),
    /**
     * Gets whether the input should flash on changes.
     */
    get renderChanges(): boolean,
}

interface IBindableArgs {
    /**
     * Sets the value of the Element.
     */
    value?: any,
    /**
     * Sets multiple values to the Element. It is up to the Element to determine how to display them.
     */
    values?: Array<any>,
    /**
     * If `true` each input will flash on changes.
     */
    renderChanges?: boolean
}

interface IPlaceholder {
    /**
     * Sets the placeholder text of the input.
     */
    set placeholder(value: string),
    /**
     * Gets the placeholder text of the input.
     */
    get placeholder(): string
}

interface IPlaceholderArgs {
    /**
     * Sets the placeholder label that appears on the right of the input.
     */
    placeholder?: string,
}

interface IFocusable {
    /**
     * Focus on the element. If the input contains text and select is provided, the text will be selected on focus.
     */
    focus(select?: boolean): void

    /**
     * Unfocus the element
     */
    blur(): void
}

interface IParentArgs {
    /**
     * The children of the current component.
     */
    children?: React.ReactNode
}

interface IFlexArgs {
    /**
     * Sets whether the element uses flex layout.
     */
    flex?: boolean,
    /**
     * Sets the element's `flexBasis` CSS property.
     */
    flexBasis?: string,
    /**
     * Sets the element's `flexDirection` CSS property.
     */
    flexDirection?: string,
    /**
     * Sets the element's `flexGrow` CSS property.
     */
    flexGrow?: string,
    /**
     * Sets the element's `flexShrink` CSS property.
     */
    flexShrink?: string,
    /**
     * Sets the element's `flexWrap` CSS property.
     */
    flexWrap?: string
}

/**
 * The arguments for the {@link Element} constructor.
 */
interface ElementArgs {
    /**
     * The HTMLElement to create this {@link Element} with. If not provided this Element will create one.
     */
    dom?: HTMLElement | string;
    /**
     * A binding to use with this {@link Element}.
     */
    binding?: BindingBase;
    /**
     * If provided and the {@link Element} is clickable, this function will be called each time the element is clicked.
     */
    onClick?: () => void,
    /**
     * If provided and the {@link Element} is changeable, this function will be called each time the element value is changed.
     */
    onChange?: (value: any) => void,
    /**
     * If provided and the {@link Element} is removable, this function will be called each time the element is removed.
     */
    onRemove?: () => void,
    /**
     * Sets the parent {@link Element}.
     */
    parent?: Element, // eslint-disable-line no-use-before-define
    /**
     * Links the observer attribute at the path location in the given observer to this {@link Element}.
     */
    link?: { observer: Array<Observer>|Observer, path: Array<string>|string },
    /**
     * The id attribute of this {@link Element}'s HTMLElement.
     */
    id?: string,
    /**
     * The class attribute of this {@link Element}'s HTMLElement.
     */
    class?: string | string[],
    /**
     * Sets whether this {@link Element} is at the root of the hierarchy.
     */
    isRoot?: boolean,
    /**
     * Sets whether it is possible to interact with this {@link Element} and its children.
     */
    enabled?: boolean,
    /**
     * Sets whether this {@link Element} is hidden. Defaults to `false`.
     */
    hidden?: boolean,
    /**
     * If `true`, this {@link Element} will ignore its parent's enabled value when determining whether this element is enabled. Defaults to `false`.
     */
    ignoreParent?: boolean,
    /**
     * Sets the initial width of the {@link Element}.
     */
    width?: number | null,
    /**
     * Sets the initial height of the {@link Element}.
     */
    height?: number | null,
    /**
     * Sets the tabIndex of the {@link Element}.
     */
    tabIndex?: number,
    /**
     * Sets whether the {@link Element} is in an error state.
     */
    error?: boolean,
    /**
     * Sets an initial value for Element.dom.style.
     */
    style?: string,
    /**
     * Whether this {@link Element} is read only or not. Defaults to `false`.
     */
    readOnly?: boolean
}

/**
 * The base class for all UI elements.
 */
class Element extends Events {
    /**
     * Fired when the Element gets enabled.
     *
     * @event
     * @example
     * ```ts
     * const element = new Element();
     * element.on('enable', () => {
     *     console.log('Element enabled');
     * });
     * ```
     */
    public static readonly EVENT_ENABLE = 'enable';

    /**
     * Fired when the Element gets disabled.
     *
     * @event
     * @example
     * ```ts
     * const element = new Element();
     * element.on('disable', () => {
     *     console.log('Element disabled');
     * });
     * ```
     */
    public static readonly EVENT_DISABLE = 'disable';

    /**
     * Fired when the Element gets hidden.
     *
     * @event
     * @example
     * ```ts
     * const element = new Element();
     * element.on('hide', () => {
     *     console.log('Element hidden');
     * });
     * ```
     */
    public static readonly EVENT_HIDE = 'hide';

    /**
     * Fired when the Element or any of its parent get hidden.
     *
     * @event
     * @example
     * ```ts
     * const element = new Element();
     * element.on('hideToRoot', () => {
     *     console.log('Element or one of its parents hidden');
     * });
     * ```
     */
    public static readonly EVENT_HIDE_TO_ROOT = 'hideToRoot';

    /**
     * Fired when the Element stops being hidden.
     *
     * @event
     * @example
     * ```ts
     * const element = new Element();
     * element.on('show', () => {
     *     console.log('Element shown');
     * });
     * ```
     */
    public static readonly EVENT_SHOW = 'show';

    /**
     * Fired when the Element and all of its parents become visible.
     *
     * @event
     * @example
     * ```ts
     * const element = new Element();
     * element.on('showToRoot', () => {
     *     console.log('Element and all of its parents shown');
     * });
     * ```
     */
    public static readonly EVENT_SHOW_TO_ROOT = 'showToRoot';

    /**
     * Fired when the readOnly property of an Element changes.
     *
     * @event
     * @example
     * ```ts
     * const element = new Element();
     * element.on('readOnly', (readOnly: boolean) => {
     *     console.log(`Element is now ${readOnly ? 'read only' : 'editable'}`);
     * });
     * ```
     */
    public static readonly EVENT_READ_ONLY = 'readOnly';

    /**
     * Fired when the Element's parent gets set.
     *
     * @event
     * @example
     * ```ts
     * const element = new Element();
     * element.on('parent', (parent: Element) => {
     *     console.log(`Element's parent is now ${parent}`);
     * });
     * ```
     */
    public static readonly EVENT_PARENT = 'parent';

    /**
     * Fired when the mouse is clicked on the Element but only if the Element is enabled. The
     * native DOM MouseEvent is passed as a parameter to the event handler.
     *
     * @event
     * @example
     * ```ts
     * const element = new Element();
     * element.on('click', (evt: MouseEvent) => {
     *     console.log('Element clicked');
     * });
     * ```
     */
    public static readonly EVENT_CLICK = 'click';

    /**
     * Fired when the mouse starts hovering on the Element. The native DOM MouseEvent is passed as a
     * parameter to the event handler.
     *
     * @event
     * @example
     * ```ts
     * const element = new Element();
     * element.on('hover', (evt: MouseEvent) => {
     *     console.log('Element hovered');
     * });
     * ```
     */
    public static readonly EVENT_HOVER = 'hover';

    /**
     * Fired when the mouse stops hovering on the Element. The native DOM MouseEvent is passed as a
     * parameter to the event handler.
     *
     * @event
     * @example
     * ```ts
     * const element = new Element();
     * element.on('hoverend', (evt: MouseEvent) => {
     *     console.log('Element hover ended');
     * });
     * ```
     */
    public static readonly EVENT_HOVER_END = 'hoverend';

    /**
     * Fired after the element has been destroyed. Both the DOM element and the owner Element
     * instance are passed as parameters to the event handler.
     *
     * @event
     * @example
     * ```ts
     * const element = new Element();
     * element.on('destroy', (dom: HTMLElement, element: Element) => {
     *     console.log('Element destroyed');
     * });
     * ```
     */
    public static readonly EVENT_DESTROY = 'destroy';

    protected _destroyed = false;

    protected _parent: Element = null; // eslint-disable-line no-use-before-define

    protected _eventsParent: EventHandle[] = [];

    protected _dom: HTMLElement;

    protected _hiddenParents: boolean;

    protected _flashTimeout: number = null;

    protected _suppressChange = false;

    protected _binding: BindingBase;

    protected _ignoreParent: boolean;

    protected _enabled: boolean;

    protected _readOnly: boolean;

    protected _hidden: boolean;

    protected _hasError: boolean;

    protected _domContent: HTMLElement;

    protected _onClickEvt: () => void;

    /**
     * Creates a new Element.
     *
     * @param args - The arguments.
     */
    constructor(args: Readonly<ElementArgs> = {}) {
        super();

        if (typeof args.dom === 'string') {
            this._dom = document.createElement(args.dom);
        } else if (args.dom instanceof Node) {
            this._dom = args.dom;
        } else {
            this._dom = document.createElement('div');
        }

        if (args.id !== undefined) {
            this._dom.id = args.id;
        }

        // add ui reference
        this._dom.ui = this;

        this._onClickEvt = this._onClick.bind(this);

        // add event listeners
        this._dom.addEventListener('click', this._onClickEvt);
        this._dom.addEventListener('mouseover', this._onMouseOver);
        this._dom.addEventListener('mouseout', this._onMouseOut);

        // add css classes
        this._dom.classList.add(CLASS_ELEMENT, CLASS_FONT_REGULAR);

        // add user classes
        if (args.class) {
            const classes = Array.isArray(args.class) ? args.class : [args.class];
            for (const cls of classes) {
                this._dom.classList.add(cls);
            }
        }

        this.enabled = args.enabled !== undefined ? args.enabled : true;
        this._hiddenParents = !args.isRoot;
        this.hidden = args.hidden ?? false;
        this.readOnly = args.readOnly ?? false;
        this.ignoreParent = args.ignoreParent ?? false;

        if (args.width !== undefined) {
            this.width = args.width;
        }
        if (args.height !== undefined) {
            this.height = args.height;
        }
        if (args.tabIndex !== undefined) {
            this.tabIndex = args.tabIndex;
        }

        // copy CSS properties from args
        for (const key in args) {
            // @ts-ignore
            if (args[key] === undefined) continue;
            if (SIMPLE_CSS_PROPERTIES.indexOf(key) !== -1) {
                // @ts-ignore
                this[key] = args[key];
            }
        }

        // set the binding object
        if (args.binding) {
            this.binding = args.binding;
        }
    }

    /**
     * Destroys the Element and its events.
     */
    destroy() {
        if (this._destroyed) return;

        this._destroyed = true;

        if (this.binding) {
            this.binding = null;
        } else {
            this.unlink();
        }

        if (this.parent) {
            const parent = this.parent;

            for (const event of this._eventsParent) {
                event.unbind();
            }
            this._eventsParent.length = 0;

            // remove element from parent
            // check if parent has been destroyed already
            // because we do not want to be emitting events
            // on a destroyed parent after it's been destroyed
            // as it is easy to lead to null exceptions
            // @ts-ignore
            if (parent.remove && !parent._destroyed) {
                // @ts-ignore
                parent.remove(this);
            }

            // set parent to null and remove from
            // parent dom just in case parent.remove above
            // didn't work because of an override or other condition
            this._parent = null;

            // Do not manually call removeChild for elements whose parent has already been destroyed.
            // For example when we destroy a TreeViewItem that has many child nodes, that will trigger every child Element to call dom.parentElement.removeChild(dom).
            // But we don't need to remove all these DOM elements from their parents since the root DOM element is destroyed anyway.
            // This has a big impact on destroy speed in certain cases.
            if (!parent._destroyed && this._dom && this._dom.parentElement) {
                this._dom.parentElement.removeChild(this._dom);
            }
        }

        const dom = this._dom;
        if (dom) {
            // remove event listeners
            dom.removeEventListener('click', this._onClickEvt);
            dom.removeEventListener('mouseover', this._onMouseOver);
            dom.removeEventListener('mouseout', this._onMouseOut);

            // remove ui reference
            delete dom.ui;

            this._dom = null;
        }

        if (this._flashTimeout) {
            window.clearTimeout(this._flashTimeout);
        }

        this.emit('destroy', dom, this);

        this.unbind();
    }

    /**
     * Links the specified observers and paths to the Element's data binding.
     *
     * @param observers - An array of observers or a single observer.
     * @param paths - A path for the observer(s) or an array of paths that maps to each separate observer.
     */
    link(observers: Observer|Observer[], paths: string|string[]) {
        if (this._binding) {
            this._binding.link(observers, paths);
        }
    }

    /**
     * Unlinks the Element from its observers.
     */
    unlink() {
        if (this._binding) {
            this._binding.unlink();
        }
    }

    /**
     * Triggers a flash animation on the Element.
     */
    flash() {
        if (this._flashTimeout) return;

        this.class.add(CLASS_FLASH);
        this._flashTimeout = window.setTimeout(() => {
            this._flashTimeout = null;
            this.class.remove(CLASS_FLASH);
        }, 200);
    }

    protected _onClick(evt: Event) {
        if (this.enabled) {
            this.emit('click', evt);
        }
    }

    protected _onMouseOver = (evt: MouseEvent) => {
        this.emit('hover', evt);
    };

    protected _onMouseOut = (evt: MouseEvent) => {
        this.emit('hoverend', evt);
    };

    protected _onHiddenToRootChange(hiddenToRoot: boolean) {
        this.emit(hiddenToRoot ? 'hideToRoot' : 'showToRoot');
    }

    protected _onEnabledChange(enabled: boolean) {
        if (enabled) {
            this.class.remove(CLASS_DISABLED);
        } else {
            this.class.add(CLASS_DISABLED);
        }

        this.emit(enabled ? 'enable' : 'disable');
    }

    protected _onParentDestroy() {
        this.destroy();
    }

    protected _onParentDisable() {
        if (this._ignoreParent) return;
        if (this._enabled) {
            this._onEnabledChange(false);
        }
    }

    protected _onParentEnable() {
        if (this._ignoreParent) return;
        if (this._enabled) {
            this._onEnabledChange(true);
        }
    }

    protected _onParentShowToRoot() {
        const oldHiddenToRoot = this.hiddenToRoot;
        this._hiddenParents = false;
        if (oldHiddenToRoot !== this.hiddenToRoot) {
            this._onHiddenToRootChange(this.hiddenToRoot);
        }
    }

    protected _onParentHideToRoot() {
        const oldHiddenToRoot = this.hiddenToRoot;
        this._hiddenParents = true;
        if (oldHiddenToRoot !== this.hiddenToRoot) {
            this._onHiddenToRootChange(this.hiddenToRoot);
        }
    }

    protected _onReadOnlyChange(readOnly: boolean) {
        if (readOnly) {
            this.class.add(CLASS_READONLY);
        } else {
            this.class.remove(CLASS_READONLY);
        }

        this.emit('readOnly', readOnly);
    }

    protected _onParentReadOnlyChange(readOnly: boolean) {
        if (this._ignoreParent) return;
        if (readOnly) {
            if (!this._readOnly) {
                this._onReadOnlyChange(true);
            }
        } else {
            if (!this._readOnly) {
                this._onReadOnlyChange(false);
            }
        }
    }

    unbind(name?: string, fn?: HandleEvent): Events {
        return super.unbind(name, fn);
    }

    /**
     * @param type - The type we want to reference this Element by.
     * @param cls - The actual class of the Element.
     * @param defaultArguments - Default arguments when creating this type.
     */
    static register<Type>(type: string, cls: new () => Type, defaultArguments?: any) {
        elementRegistry.set(type, { cls, defaultArguments });
    }

    /**
     * @param type - The type we want to unregister.
     */
    static unregister(type: string) {
        elementRegistry.delete(type);
    }

    /**
     * Creates a new Element of the desired type.
     *
     * @param type - The type of the Element (registered by Element#register).
     * @param args - Arguments for the Element.
     * @returns The new Element or undefined if type is not found.
     */
    static create(type: string, args: ElementArgs): any {
        const entry = elementRegistry.get(type);
        if (!entry) {
            console.error('Invalid type passed to Element.create:', type);
            return undefined;
        }

        const cls = entry.cls;
        const clsArgs = { ...entry.defaultArguments, ...args };

        return new cls(clsArgs);
    }


    /**
     * Sets whether the Element or its parent chain is enabled or not. Defaults to `true`.
     */
    set enabled(value: boolean) {
        if (this._enabled === value) return;

        // remember if enabled in hierarchy
        const enabled = this.enabled;

        this._enabled = value;

        // only fire event if hierarchy state changed
        if (enabled !== value) {
            this._onEnabledChange(value);
        }
    }

    /**
     * Gets whether the Element or its parent chain is enabled or not.
     */
    get enabled(): boolean {
        if (this._ignoreParent) return this._enabled;
        return this._enabled && (!this._parent || this._parent.enabled);
    }

    /**
     * Sets whether the Element will ignore parent events & variable states.
     */
    set ignoreParent(value) {
        this._ignoreParent = value;
        this._onEnabledChange(this.enabled);
        this._onReadOnlyChange(this.readOnly);
    }

    /**
     * Gets whether the Element will ignore parent events & variable states.
     */
    get ignoreParent() {
        return this._ignoreParent;
    }

    /**
     * Gets the root DOM node for this Element.
     */
    get dom(): HTMLElement {
        return this._dom;
    }

    /**
     * Sets the parent Element.
     */
    set parent(value: Element) {
        if (value === this._parent) return;

        const oldEnabled = this.enabled;
        const oldReadonly = this.readOnly;
        const oldHiddenToRoot = this.hiddenToRoot;

        if (this._parent) {
            for (let i = 0; i < this._eventsParent.length; i++) {
                this._eventsParent[i].unbind();
            }
            this._eventsParent.length = 0;
        }

        this._parent = value;

        if (this._parent) {
            this._eventsParent.push(this._parent.once('destroy', this._onParentDestroy.bind(this)));
            this._eventsParent.push(this._parent.on('disable', this._onParentDisable.bind(this)));
            this._eventsParent.push(this._parent.on('enable', this._onParentEnable.bind(this)));
            this._eventsParent.push(this._parent.on('readOnly', this._onParentReadOnlyChange.bind(this)));
            this._eventsParent.push(this._parent.on('showToRoot', this._onParentShowToRoot.bind(this)));
            this._eventsParent.push(this._parent.on('hideToRoot', this._onParentHideToRoot.bind(this)));

            this._hiddenParents = this._parent.hiddenToRoot;
        } else {
            this._hiddenParents = true;
        }

        this.emit('parent', this._parent);

        const newEnabled = this.enabled;
        if (newEnabled !== oldEnabled) {
            this._onEnabledChange(newEnabled);
        }

        const newReadonly = this.readOnly;
        if (newReadonly !== oldReadonly) {
            this._onReadOnlyChange(newReadonly);
        }

        const hiddenToRoot = this.hiddenToRoot;
        if (hiddenToRoot !== oldHiddenToRoot) {
            this._onHiddenToRootChange(hiddenToRoot);
        }
    }

    /**
     * Gets the parent Element.
     */
    get parent(): Element {
        return this._parent;
    }

    /**
     * Sets whether the Element is hidden.
     */
    set hidden(value: boolean) {
        if (value === this._hidden) return;

        const oldHiddenToRoot = this.hiddenToRoot;

        this._hidden = value;

        if (value) {
            this.class.add(CLASS_HIDDEN);
        } else {
            this.class.remove(CLASS_HIDDEN);
        }

        this.emit(value ? 'hide' : 'show');

        if (this.hiddenToRoot !== oldHiddenToRoot) {
            this._onHiddenToRootChange(this.hiddenToRoot);
        }
    }

    /**
     * Gets whether the Element is hidden.
     */
    get hidden(): boolean {
        return this._hidden;
    }


    /**
     * Gets whether the Element is hidden all the way up to the root. If the Element itself or any of its parents are hidden then this is true.
     */
    get hiddenToRoot(): boolean {
        return this._hidden || this._hiddenParents;
    }


    /**
     * Sets whether the Element is read only.
     */
    set readOnly(value: boolean) {
        if (this._readOnly === value) return;
        this._readOnly = value;

        this._onReadOnlyChange(value);
    }

    /**
     * Gets whether the Element is read only.
     */
    get readOnly(): boolean {
        if (this._ignoreParent) return this._readOnly;
        return this._readOnly || !!(this._parent && this._parent.readOnly);
    }


    /**
     * Sets whether the Element is in an error state.
     */
    set error(value: boolean) {
        if (this._hasError === value) return;
        this._hasError = value;
        if (value) {
            this.class.add(CLASS_ERROR);
        } else {
            this.class.remove(CLASS_ERROR);
        }
    }

    /**
     * Gets whether the Element is in an error state.
     */
    get error(): boolean {
        return this._hasError;
    }

    /**
     * Shortcut to Element.dom.style.
     */
    get style(): CSSStyleDeclaration {
        return this._dom.style;
    }

    /**
     * Get the `DOMTokenList` of the underlying DOM element. This is essentially a shortcut to
     * `element.dom.classList`.
     */
    get class(): DOMTokenList {
        return this._dom.classList;
    }

    /**
     * Sets the width of the Element in pixels. Can also be an empty string to remove it.
     */
    set width(value: number | string) {
        this.style.width = typeof value === 'number' ? `${value}px` : value;
    }

    /**
     * Gets the width of the Element in pixels.
     */
    get width(): number {
        return this._dom.clientWidth;
    }

    /**
     * Sets the height of the Element in pixels. Can also be an empty string to remove it.
     */
    set height(value: number | string) {
        this.style.height = typeof value === 'number' ? `${value}px` : value;
    }

    /**
     * Gets the height of the Element in pixels.
     */
    get height(): number {
        return this._dom.clientHeight;
    }


    /**
     * Sets the tabIndex of the Element.
     */
    set tabIndex(value: number) {
        this._dom.tabIndex = value;
    }

    /**
     * Gets the tabIndex of the Element.
     */
    get tabIndex(): number {
        return this._dom.tabIndex;
    }

    /**
     * Sets the Binding object for the element.
     */
    set binding(value: BindingBase) {
        if (this._binding === value) return;

        let prevObservers;
        let prevPaths;

        if (this._binding) {
            prevObservers = this._binding.observers;
            prevPaths = this._binding.paths;

            this.unlink();
            this._binding.element = null;
            this._binding = null;
        }

        this._binding = value;

        if (this._binding) {
            // @ts-ignore
            this._binding.element = this;
            if (prevObservers && prevPaths) {
                this.link(prevObservers, prevPaths);
            }
        }
    }

    /**
     * Gets the Binding object for the element.
     */
    get binding(): BindingBase {
        return this._binding;
    }

    get destroyed(): boolean {
        return this._destroyed;
    }

    // CSS proxy accessors

    /**
     * Sets the flex-direction CSS property.
     */
    set flexDirection(value) {
        this.style.flexDirection = value;
    }

    /**
     * Gets the flex-direction CSS property.
     */
    get flexDirection() {
        return this.style.flexDirection;
    }

    /**
     * Sets the flex-grow CSS property.
     */
    set flexGrow(value) {
        this.style.flexGrow = value;
    }

    /**
     * Gets the flex-grow CSS property.
     */
    get flexGrow() {
        return this.style.flexGrow;
    }

    /**
     * Sets the flex-basis CSS property.
     */
    set flexBasis(value) {
        this.style.flexBasis = value;
    }

    /**
     * Gets the flex-basis CSS property.
     */
    get flexBasis() {
        return this.style.flexBasis;
    }

    /**
     * Sets the flex-shrink CSS property.
     */
    set flexShrink(value) {
        this.style.flexShrink = value;
    }

    /**
     * Gets the flex-shrink CSS property.
     */
    get flexShrink() {
        return this.style.flexShrink;
    }

    /**
     * Sets the flex-wrap CSS property.
     */
    set flexWrap(value) {
        this.style.flexWrap = value;
    }

    /**
     * Gets the flex-wrap CSS property.
     */
    get flexWrap() {
        return this.style.flexWrap;
    }

    /**
     * Sets the align-items CSS property.
     */
    set alignItems(value) {
        this.style.alignItems = value;
    }

    /**
     * Gets the align-items CSS property.
     */
    get alignItems() {
        return this.style.alignItems;
    }

    /**
     * Sets the align-self CSS property.
     */
    set alignSelf(value) {
        this.style.alignSelf = value;
    }

    /**
     * Gets the align-self CSS property.
     */
    get alignSelf() {
        return this.style.alignSelf;
    }

    /**
     * Sets the justify-content CSS property.
     */
    set justifyContent(value) {
        this.style.justifyContent = value;
    }

    /**
     * Gets the justify-content CSS property.
     */
    get justifyContent() {
        return this.style.justifyContent;
    }

    /**
     * Sets the justify-self CSS property.
     */
    set justifySelf(value) {
        this.style.justifySelf = value;
    }

    /**
     * Gets the justify-self CSS property.
     */
    get justifySelf() {
        return this.style.justifySelf;
    }

    /*  Backwards Compatibility */
    // we should remove those after we migrate

    /** @ignore */
    set disabled(value: boolean) {
        this.enabled = !value;
    }

    /** @ignore */
    get disabled(): boolean {
        return !this.enabled;
    }

    /** @ignore */
    set element(value: HTMLElement) {
        this._dom = value;
    }

    /** @ignore */
    get element(): HTMLElement {
        return this.dom;
    }

    /** @ignore */
    set innerElement(value: HTMLElement) {
        this._domContent = value;
    }

    /** @ignore */
    get innerElement(): HTMLElement {
        return this._domContent;
    }
}

// Declare an additional property on the base Node interface that references the owner Element
declare global {
    interface Node {
        ui: Element;
    }
}

export { Element, ElementArgs, IBindable, IBindableArgs, IPlaceholder, IPlaceholderArgs, IFocusable, IParentArgs, IFlexArgs };
