import React from 'react';
import * as pcuiClass from '../../class';
import { Events, Observer } from '@playcanvas/observer';

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
const ELEMENT_REGISTRY: any = {};

export interface IBindable {
    /**
     * Gets / sets the value of the Element.
     */
    set value(values: any),
    get value(): any,
    /**
     * Gets / sets multiple values to the Element. It is up to the Element to determine how to display them.
     */
    set values(values: Array<any>),
    get values(): Array<any>,
    /**
     * Gets / sets whether the input should flash on changes.
     */
    set renderChanges(value: boolean),
    get renderChanges(): boolean,
}

export interface IBindableArgs {
    /**
     * Sets the value of the Element.
     */
    value?: any,
    /**
     * Sets multiple values to the Element. It is up to the Element to determine how to display them.
     */
    values?: Array<any>,
    /**
     * If true each input will flash on changes.
     */
    renderChanges?: boolean
}

export interface IPlaceholder {
    /**
     * Gets / sets the placeholder text of the input.
     */
    set placeholder(value: string),
    get placeholder(): string
}

export interface IPlaceholderArgs {
    /**
     * Sets the placeholder label that appears on the right of the input.
     */
    placeholder?: string,
}

export interface IFocusable {
    /**
     * Focus on the element. If the input contains text and select is provided, the text will be selected on focus.
     */
    focus(select?: boolean): void

    /**
     * Unfocus the element
     */
    blur(): void
}

export interface IParentArgs {
    /**
     * The children of the current component.
     */
    children?: React.ReactNode
}

export interface IFlexArgs {
    /**
     * Sets whether the Element supports flex layout.
     */
    flex?: boolean,
    /**
     * Sets whether the Element supports the flex shrink property.
     */
    flexShrink?: number,
    /**
     * Sets whether the Element supports the flex grow property.
     */
    flexGrow?: number,
    /**
     * Sets the Elements flex direction property.
     */
    flexDirection?: string,
}

export interface ElementArgs {
    /**
     * The HTMLElement to create this Element with. If not provided this Element will create one.
     */
    dom?: HTMLElement | string;
    /**
     * A binding to use with this Element.
     */
    binding?: BindingBase;
    /**
     * If provided and the element is clickable, this function will be called each time the element is clicked.
     */
    onClick?: () => void,
    /**
     * If provided and the element is changeable, this function will be called each time the element value is changed.
     */
    onChange?: (value: any) => void,
    /**
     * If provided and the element is removable, this function will be called each time the element is removed.
     */
    onRemove?: () => void,
    /**
     * Sets the parent Element.
     */
    parent?: any,
    /**
     * Links the observer attribute at the path location in the given observer to this Element.
     */
    link?: { observer: Array<Observer>|Observer, path: Array<string>|string },
    /**
     * The id attribute of this Element's HTMLElement.
     */
    id?: string,
    /**
     * The class attribute of this Element's HTMLElement.
     */
    class?: string | Array<string>,
    /**
     * Sets whether this Element is at the root of the hierarchy.
     */
    isRoot?: boolean,
    /**
     * Sets whether it is possible to interact with this Element and its children.
     */
    enabled?: boolean,
    /**
     * Sets whether this Element is hidden.
     */
    hidden?: boolean,
    /**
     * If true, this Element will ignore its parent's enabled value when determining whether this Element is enabled.
     */
    ignoreParent?: boolean,
    /**
     * Sets the initial width of the element.
     */
    width?: number | null,
    /**
     * Sets the initial height of the element.
     */
    height?: number | null,
    /**
     * Gets / sets the tabIndex of the Element.
     */
    tabIndex?: number,
    /**
     * Gets / sets whether the Element is in an error state.
     */
    error?: boolean,
    /**
     * Sets an initial value for Element.dom.style.
     */
    style?: string,
    /**
     * Whether this Element is read only or not.
     */
    readOnly?: boolean
}

// Declare an additional property on the HTMLElement interface that references the owner Element
declare global {
    interface Node {
        ui: Element;
    }
}

/**
 * The base class for all UI elements.
 */
class Element extends Events {
    public static defaultArgs: ElementArgs = {
        hidden: false,
        readOnly: false,
        ignoreParent: false
    };

    /**
     * @event
     * @name enable
     * @description Fired when the Element gets enabled
     */
    public static readonly EVENT_ENABLE = 'enable';

    /**
     * @event
     * @name disable
     * @description Fired when the Element gets disabled
     */
    public static readonly EVENT_DISABLE = 'disable';

    /**
     * @event
     * @name hide
     * @description Fired when the Element gets hidden
     */
    public static readonly EVENT_HIDE = 'hide';

    /**
     * @event
     * @name hideToRoot
     * @description Fired when the Element or any of its parent get hidden
     */
    public static readonly EVENT_HIDE_TO_ROOT = 'hideToRoot';

    /**
     * @event
     * @name show
     * @description Fired when the Element stops being hidden
     */
    public static readonly EVENT_SHOW = 'show';

    /**
     * @event
     * @name showToRoot
     * @description Fired when the Element and all of its parents become visible
     */
    public static readonly EVENT_SHOW_TO_ROOT = 'showToRoot';

    /**
     * @event
     * @name readOnly
     * @param {boolean} readOnly - Whether the Element is now read only
     * @description Fired when the readOnly property of an Element changes
     */
    public static readonly EVENT_READ_ONLY = 'readOnly';

    /**
     * @event
     * @name parent
     * @description Fired when the Element's parent gets set
     * @param {Element} parent - The new parent
     */
    public static readonly EVENT_PARENT = 'parent';

    /**
     * @event
     * @name click
     * @description Fired when the mouse is clicked on the Element but only if the Element is enabled.
     * @param {Event} evt - The native mouse event.
     */
    public static readonly EVENT_CLICK = 'click';

    /**
     * @event
     * @name hover
     * @description Fired when the mouse starts hovering on the Element
     * @param {Event} evt - The native mouse event.
     */
    public static readonly EVENT_HOVER = 'hover';

    /**
     * @event
     * @name hoverend
     * @description Fired when the mouse stops hovering on the Element
     * @param {Event} evt - The native mouse event.
     */
    public static readonly EVENT_HOVER_END = 'hoverend';

    /**
     * @event
     * @name destroy
     * @description Fired after the element has been destroyed.
     * @param {HTMLElement} dom - The DOM element
     * @param {Element} element - The element
     */
    public static readonly EVENT_DESTROY = 'destroy';

    protected _destroyed: boolean;

    protected _parent: any;

    protected _domEventClick: any;

    protected _domEventMouseOver: any;

    protected _domEventMouseOut: any;

    protected _eventsParent: any[];

    protected _dom: HTMLElement;

    protected _class: any[];

    protected _hiddenParents: boolean;

    protected _flashTimeout: number;

    protected _suppressChange: boolean;

    protected _binding: any;

    protected _ignoreParent: boolean;

    protected _enabled: boolean;

    protected _readOnly: boolean;

    protected _hidden: boolean;

    protected _hasError: boolean;

    protected _domContent: any;

    constructor(dom: HTMLElement | string, args: ElementArgs = Element.defaultArgs) {
        args = { ...Element.defaultArgs, ...args };
        super();

        this._destroyed = false;
        this._parent = null;

        this._domEventClick = this._onClick.bind(this);
        this._domEventMouseOver = this._onMouseOver.bind(this);
        this._domEventMouseOut = this._onMouseOut.bind(this);
        this._eventsParent = [];

        if (typeof dom === 'string') {
            this._dom = document.createElement(dom);
        } else if (dom instanceof HTMLElement) {
            this._dom = dom;
        } else if (typeof args.dom === 'string') {
            this._dom = document.createElement(args.dom);
        } else if (args.dom instanceof HTMLElement) {
            this._dom = args.dom;
        } else {
            this._dom = document.createElement('div');
        }

        if (args.id !== undefined) {
            this._dom.id = args.id;
        }

        // add ui reference
        this._dom.ui = this;

        // add event listeners
        this._dom.addEventListener('click', this._domEventClick);
        this._dom.addEventListener('mouseover', this._domEventMouseOver);
        this._dom.addEventListener('mouseout', this._domEventMouseOut);

        // add element class
        this._dom.classList.add(CLASS_ELEMENT);

        // add font regular class
        this._dom.classList.add(pcuiClass.FONT_REGULAR);

        this._class = [];
        // add user classes
        if (args.class) {
            if (Array.isArray(args.class)) {
                for (let i = 0; i < args.class.length; i++) {
                    this._dom.classList.add(args.class[i]);
                    this._class.push(args.class[i]);
                }
            } else {
                this._dom.classList.add(args.class);
                this._class.push(args.class);
            }
        }

        this.enabled = args.enabled !== undefined ? args.enabled : true;
        this._hiddenParents = !args.isRoot;
        this.hidden = args.hidden;
        this.readOnly = args.readOnly;
        this.ignoreParent = args.ignoreParent;

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

        this._flashTimeout = null;

        this._suppressChange = false;
    }

    /**
     * Links the specified observers and paths to the Element's data binding.
     *
     * @param observers - An array of observers or a single observer.
     * @param paths - A path for the observer(s) or an array of paths that maps to each separate observer.
     */
    link(observers: Array<Observer>|Observer, paths: Array<string>|string) {
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

        this.classAdd(pcuiClass.FLASH);
        this._flashTimeout = window.setTimeout(() => {
            this._flashTimeout = null;
            this.classRemove(pcuiClass.FLASH);
        }, 200);
    }

    protected _onClick(evt: Event) {
        if (this.enabled) {
            this.emit('click', evt);
        }
    }

    protected _onMouseOver(evt: MouseEvent) {
        this.emit('hover', evt);
    }

    protected _onMouseOut(evt: MouseEvent) {
        this.emit('hoverend', evt);
    }

    protected _onHiddenToRootChange(hiddenToRoot: boolean) {
        if (hiddenToRoot) {
            this.emit('hideToRoot');
        } else {
            this.emit('showToRoot');
        }
    }

    protected _onEnabledChange(enabled: boolean) {
        if (enabled) {
            this.classRemove(pcuiClass.DISABLED);
        } else {
            this.classAdd(pcuiClass.DISABLED);
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
            this.classAdd(pcuiClass.READONLY);
        } else {
            this.classRemove(pcuiClass.READONLY);
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

    /**
     * Adds the specified class to the DOM element but checks if the classList contains it first.
     *
     * @param cls - The class to add.
     */
    classAdd(cls: string) {
        const classList = this._dom.classList;
        if (!classList.contains(cls)) {
            classList.add(cls);
        }
    }

    /**
     * Removes the specified class from the DOM element but checks if the classList contains it first.
     *
     * @param cls - The class to remove.
     */
    classRemove(cls: string) {
        const classList = this._dom.classList;
        if (classList.contains(cls)) {
            classList.remove(cls);
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
            const parent = (this.parent as any);

            for (let i = 0; i < this._eventsParent.length; i++) {
                this._eventsParent[i].unbind();
            }
            this._eventsParent.length = 0;


            // remove element from parent
            // check if parent has been destroyed already
            // because we do not want to be emitting events
            // on a destroyed parent after it's been destroyed
            // as it is easy to lead to null exceptions
            if (parent.remove && !parent._destroyed) {
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
            dom.removeEventListener('click', this._domEventClick);
            dom.removeEventListener('mouseover', this._domEventMouseOver);
            dom.removeEventListener('mouseout', this._domEventMouseOut);

            // remove ui reference
            delete dom.ui;

            this._dom = null;
        }

        this._domEventClick = null;
        this._domEventMouseOver = null;
        this._domEventMouseOut = null;

        if (this._flashTimeout) {
            window.clearTimeout(this._flashTimeout);
        }

        this.emit('destroy', dom, this);

        this.unbind();
    }

    unbind(name?: string, fn?: any): Events {
        return super.unbind(name, fn);
    }

    /**
     * @param type - The type we want to reference this Element by.
     * @param cls - The actual class of the Element.
     * @param defaultArguments - Default arguments when creating this type.
     */
    static register(type: string, cls: any, defaultArguments?: Object) {
        ELEMENT_REGISTRY[type] = { cls, defaultArguments };
    }

    /**
     * @param type - The type we want to unregister.
     */
    static unregister(type: string) {
        delete ELEMENT_REGISTRY[type];
    }

    /**
     * Creates a new Element of the desired type. Returns undefined if type not found.
     *
     * @param type - The type of the Element (registered by pcui.Element#register).
     * @param args - Arguments for the Element.
     */
    static create(type: string, args: ElementArgs): any {
        const entry = ELEMENT_REGISTRY[type];
        if (!entry) {
            console.error('Invalid type passed to pcui.Element#create', type);
            return;
        }

        const cls = entry.cls;
        const clsArgs = {};

        if (entry.defaultArguments) {
            Object.assign(clsArgs, entry.defaultArguments);
        }
        if (args) {
            Object.assign(clsArgs, args);
        }

        return new cls(clsArgs);
    }


    /**
     * Gets / sets whether the Element or its parent chain is enabled or not. Defaults to true.
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

    get enabled(): boolean {
        if (this._ignoreParent) return this._enabled;
        return this._enabled && (!this._parent || this._parent.enabled);
    }

    /**
     * Gets / sets whether the Element will ignore parent events & variable states.
     */
    set ignoreParent(value) {
        this._ignoreParent = value;
        this._onEnabledChange(this.enabled);
        this._onReadOnlyChange(this.readOnly);
    }

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
     * Gets / sets the parent Element.
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

    get parent(): Element {
        return this._parent;
    }

    /**
     * Gets / sets whether the Element is hidden.
     */
    set hidden(value: boolean) {
        if (value === this._hidden) return;

        const oldHiddenToRoot = this.hiddenToRoot;

        this._hidden = value;

        if (value) {
            this.classAdd(pcuiClass.HIDDEN);
        } else {
            this.classRemove(pcuiClass.HIDDEN);
        }

        this.emit(value ? 'hide' : 'show');

        if (this.hiddenToRoot !== oldHiddenToRoot) {
            this._onHiddenToRootChange(this.hiddenToRoot);
        }
    }

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
     * Gets / sets whether the Element is read only.
     */
    set readOnly(value: boolean) {
        if (this._readOnly === value) return;
        this._readOnly = value;

        this._onReadOnlyChange(value);
    }

    get readOnly(): boolean {
        if (this._ignoreParent) return this._readOnly;
        return this._readOnly || !!(this._parent && this._parent.readOnly);
    }


    /**
     * Gets / sets whether the Element is in an error state.
     */
    set error(value: boolean) {
        if (this._hasError === value) return;
        this._hasError = value;
        if (value) {
            this.classAdd(pcuiClass.ERROR);
        } else {
            this.classRemove(pcuiClass.ERROR);
        }
    }

    get error(): boolean {
        return this._hasError;
    }

    /**
     * Shortcut to pcui.Element.dom.style.
     */
    get style(): CSSStyleDeclaration {
        return this._dom.style;
    }

    /**
     * Shortcut to pcui.Element.dom.classList.
     */
    set class(value: any) {
        if (!Array.isArray(value)) {
            value = [value];
        }
        value.forEach((cls: string) => {
            this.classAdd(cls);
        });
        this._class.forEach((cls) => {
            if (!value.includes(cls)) {
                this.classRemove(cls);
            }
        });
        this._class = value;
    }

    get class(): DOMTokenList {
        return this._dom.classList;
    }


    /**
     * Gets / sets the width of the Element in pixels. Can also be an empty string to remove it.
     */
    set width(value: number | string) {
        if (typeof value === 'number') {
            value = String(value) + 'px';
        }
        this.style.width = value;
    }

    get width() {
        return this._dom.clientWidth;
    }

    /**
     * Gets / sets the height of the Element in pixels. Can also be an empty string to remove it.
     */
    set height(value: number | string) {
        if (typeof value === 'number') {
            value = String(value) + 'px';
        }
        this.style.height = value;
    }

    get height() {
        return this._dom.clientHeight;
    }


    /**
     * Gets / sets the tabIndex of the Element.
     */
    set tabIndex(value: number) {
        this._dom.tabIndex = value;
    }

    get tabIndex(): number {
        return this._dom.tabIndex;
    }

    /**
     * Gets / sets the Binding object for the element.
     */
    set binding(value: any) {
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
            this._binding.element = this;
            if (prevObservers && prevPaths) {
                this.link(prevObservers, prevPaths);
            }
        }
    }

    get binding(): any {
        return this._binding;
    }

    get destroyed(): boolean {
        return this._destroyed;
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

// utility function to expose a CSS property
// via an Element.prototype property
function exposeCssProperty(name: string) {
    Object.defineProperty(Element.prototype, name, {
        get: function () {
            return this.style[name];
        },
        set: function (value) {
            this.style[name] = value;
        }
    });
}

// expose rest of CSS properties
SIMPLE_CSS_PROPERTIES.forEach(exposeCssProperty);

export default Element;
