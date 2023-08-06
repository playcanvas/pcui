import * as pcuiClass from '../../class';
import Element from '../Element';
import Container, { ContainerArgs } from '../Container';
import Label from '../Label';
import Button from '../Button';

const CLASS_PANEL = 'pcui-panel';
const CLASS_PANEL_HEADER = CLASS_PANEL + '-header';
const CLASS_PANEL_HEADER_TITLE = CLASS_PANEL_HEADER + '-title';
const CLASS_PANEL_CONTENT = CLASS_PANEL + '-content';
const CLASS_PANEL_HORIZONTAL = CLASS_PANEL + '-horizontal';
const CLASS_PANEL_SORTABLE_ICON = CLASS_PANEL + '-sortable-icon';
const CLASS_PANEL_REMOVE = CLASS_PANEL + '-remove';

/**
 * The arguments for the {@link Panel} constructor.
 */
export interface PanelArgs extends ContainerArgs {
    /**
     * Sets whether the Element is collapsible.
     */
    collapsible?: boolean,
    /**
     * Sets whether the Element should be collapsed.
     */
    collapsed?: boolean,
    /**
     * Sets whether the panel can be reordered.
     */
    sortable?: boolean,
    /**
     * Sets whether the panel collapses horizontally - this would be the case for side panels. Defaults to `false`.
     */
    collapseHorizontally?: boolean,
    /**
     * Sets whether the panel can be removed.
     */
    removable?: boolean,
    /**
     * The height of the header in pixels. Defaults to 32.
     */
    headerSize?: number,
    /**
     * The header text of the panel. Defaults to the empty string.
     */
    headerText?: string,
    /**
     * Sets the panel type.
     */
    panelType?: 'normal',
    /**
     * A DOM element to use for the content container.
     */
    content?: HTMLElement
    /**
     * A DOM element to use for the header container.
     */
    header?: HTMLElement
}

/**
 * The Panel is a {@link Container} that itself contains a header container and a content
 * container. The respective Container functions work using the content container. One can also
 * append elements to the header of the Panel.
 */
class Panel extends Container {
    /**
     * Fired when the panel gets collapsed.
     *
     * @event
     * @example
     * ```ts
     * const panel = new Panel();
     * panel.on('collapse', () => {
     *     console.log('Panel collapsed');
     * });
     * ```
     */
    public static readonly EVENT_COLLAPSE = 'collapse';

    /**
     * Fired when the panel gets expanded.
     *
     * @event
     * @example
     * ```ts
     * const panel = new Panel();
     * panel.on('expand', () => {
     *     console.log('Panel expanded');
     * });
     * ```
     */
    public static readonly EVENT_EXPAND = 'expand';

    protected _suspendReflow: boolean;

    protected _reflowTimeout: number = null;

    protected _widthBeforeCollapse: string = null;

    protected _heightBeforeCollapse: string = null;

    protected _iconSort: Label = null;

    protected _btnRemove: Button = null;

    protected _containerContent: Container;

    protected _containerHeader: Container;

    protected _labelTitle: Label;

    protected _collapsible: boolean;

    protected _collapseHorizontally: boolean;

    protected _draggedChild: this;

    protected _collapsed: boolean;

    protected _sortable: boolean;

    protected _headerSize: number;

    protected _onDragEndEvt: (event: MouseEvent) => void;

    /**
     * Creates a new Panel.
     *
     * @param args - The arguments. Extends the Container constructor arguments. All settable
     * properties can also be set through the constructor.
     */
    constructor(args: Readonly<PanelArgs> = {}) {
        const containerArgs = { ...args, flex: true };
        delete containerArgs.grid;
        delete containerArgs.flexDirection;
        delete containerArgs.scrollable;

        super(containerArgs);

        this.class.add(CLASS_PANEL);

        if (args.panelType) {
            this.class.add(CLASS_PANEL + '-' + args.panelType);
        }

        // do not call reflow on every update while
        // we are initializing
        this._suspendReflow = true;

        // initialize header container
        this._initializeHeader(args);

        // initialize content container
        this._initializeContent(args);

        // header size
        this.headerSize = args.headerSize ?? 32;

        // collapse related
        this.collapsible = args.collapsible || false;
        this.collapsed = args.collapsed || false;
        this.collapseHorizontally = args.collapseHorizontally || false;

        this.sortable = args.sortable || false;
        this.removable = args.removable || !!args.onRemove || false;

        // Set the contents container to be the content DOM element. From now on, calling append
        // functions on the panel will append the elements to the contents container.
        this.domContent = this._containerContent.dom;

        // execute reflow now after all fields have been initialized
        this._suspendReflow = false;
        this._reflow();

        this._onDragEndEvt = this._onDragEnd.bind(this);
    }

    destroy() {
        if (this._destroyed) return;

        if (this._reflowTimeout) {
            cancelAnimationFrame(this._reflowTimeout);
            this._reflowTimeout = null;
        }

        window.removeEventListener('mouseup', this._onDragEndEvt);
        window.removeEventListener('mouseleave', this._onDragEndEvt);
        window.removeEventListener('mousemove', this._onDragMove);

        super.destroy();
    }

    protected _initializeHeader(args: PanelArgs) {
        // header container
        this._containerHeader = new Container({
            flex: true,
            flexDirection: 'row',
            class: [CLASS_PANEL_HEADER, pcuiClass.FONT_BOLD]
        });

        // header title
        this._labelTitle = new Label({
            text: args.headerText,
            class: [CLASS_PANEL_HEADER_TITLE, pcuiClass.FONT_BOLD]
        });
        this._containerHeader.append(this._labelTitle);

        // use native click listener because the Element#click event is only fired if the element
        // is enabled. However we still want to catch header click events in order to collapse them
        this._containerHeader.dom.addEventListener('click', this._onHeaderClick);

        this.append(this._containerHeader);
    }

    protected _onHeaderClick = (evt: MouseEvent) => {
        if (!this._collapsible) return;
        if (evt.target !== this.header.dom && evt.target !== this._labelTitle.dom) return;

        // toggle collapsed
        this.collapsed = !this.collapsed;
    };

    protected _onClickRemove(evt: MouseEvent) {
        evt.preventDefault();
        evt.stopPropagation();

        this.emit('click:remove');
    }

    protected _initializeContent(args: PanelArgs) {
        // containers container
        this._containerContent = new Container({
            class: CLASS_PANEL_CONTENT,
            grid: args.grid,
            flex: args.flex,
            flexDirection: args.flexDirection,
            scrollable: args.scrollable,
            dom: args.content
        });

        this.append(this._containerContent);
    }

    // Collapses or expands the panel as needed
    protected _reflow() {
        if (this._suspendReflow) {
            return;
        }

        if (this._reflowTimeout) {
            cancelAnimationFrame(this._reflowTimeout);
            this._reflowTimeout = null;
        }

        if (this.hidden || !this.collapsible) return;

        if (this.collapsed && this.collapseHorizontally) {
            this._containerHeader.style.top = -this.headerSize + 'px';
        } else {
            this._containerHeader.style.top = '';
        }

        // we rely on the content width / height and we have to
        // wait for 1 frame before we can get the final values back
        this._reflowTimeout = requestAnimationFrame(() => {
            this._reflowTimeout = null;

            if (this.collapsed) {
                // remember size before collapse
                if (!this._widthBeforeCollapse) {
                    this._widthBeforeCollapse = this.style.width;
                }
                if (!this._heightBeforeCollapse) {
                    this._heightBeforeCollapse = this.style.height;
                }

                if (this._collapseHorizontally) {
                    this.height = '';
                    this.width = this.headerSize;
                } else {
                    this.height = this.headerSize;
                }

                // add collapsed class after getting the width and height
                // because if we add it before then because of overflow:hidden
                // we might get inaccurate width/heights.
                this.class.add(pcuiClass.COLLAPSED);
            } else {
                // remove collapsed class first and the restore width and height
                // (opposite order of collapsing)
                this.class.remove(pcuiClass.COLLAPSED);

                if (this._collapseHorizontally) {
                    this.height = '';
                    if (this._widthBeforeCollapse !== null) {
                        this.width = this._widthBeforeCollapse;
                    }
                } else {
                    if (this._heightBeforeCollapse !== null) {
                        this.height = this._heightBeforeCollapse;
                    }
                }

                // reset before collapse vars
                this._widthBeforeCollapse = null;
                this._heightBeforeCollapse = null;
            }
        });
    }

    protected _onDragStart = (evt: MouseEvent) => {
        if (!this.enabled || this.readOnly) return;

        evt.stopPropagation();
        evt.preventDefault();

        window.addEventListener('mouseup', this._onDragEndEvt);
        window.addEventListener('mouseleave', this._onDragEndEvt);
        window.addEventListener('mousemove', this._onDragMove);

        this.emit('dragstart');
        // @ts-ignore accessing protected methods
        if (this.parent && this.parent._onChildDragStart) {
            // @ts-ignore accessing protected methods
            this.parent._onChildDragStart(evt, this);
        }
    };

    protected _onDragMove = (evt: MouseEvent) => {
        this.emit('dragmove');
        // @ts-ignore accessing protected methods
        if (this.parent && this.parent._onChildDragStart) {
            // @ts-ignore accessing protected methods
            this.parent._onChildDragMove(evt, this);
        }
    };

    protected _onDragEnd(evt: MouseEvent) {
        window.removeEventListener('mouseup', this._onDragEndEvt);
        window.removeEventListener('mouseleave', this._onDragEndEvt);
        window.removeEventListener('mousemove', this._onDragMove);

        if (this._draggedChild === this) {
            this._draggedChild = null;
        }

        this.emit('dragend');
        // @ts-ignore accessing protected methods
        if (this.parent && this.parent._onChildDragStart) {
            // @ts-ignore accessing protected methods
            this.parent._onChildDragEnd(evt, this);
        }
    }

    /**
     * Gets / sets whether the Element is collapsible.
     */
    set collapsible(value) {
        if (value === this._collapsible) return;

        this._collapsible = value;

        if (value) {
            this.class.add(pcuiClass.COLLAPSIBLE);
        } else {
            this.class.remove(pcuiClass.COLLAPSIBLE);
        }

        this._reflow();

        if (this.collapsed) {
            this.emit(value ? 'collapse' : 'expand');
        }

    }

    get collapsible() {
        return this._collapsible;
    }

    /**
     * Gets / sets whether the Element should be collapsed.
     */
    set collapsed(value) {
        if (this._collapsed === value) return;

        this._collapsed = value;

        this._reflow();

        if (this.collapsible) {
            this.emit(value ? 'collapse' : 'expand');
        }
    }

    get collapsed() {
        return this._collapsed;
    }

    /**
     * Gets / sets whether the panel can be reordered.
     */
    set sortable(value) {
        if (this._sortable === value) return;

        this._sortable = value;

        if (value) {
            this._iconSort = new Label({
                class: CLASS_PANEL_SORTABLE_ICON
            });

            this._iconSort.dom.addEventListener('mousedown', this._onDragStart);

            this.header.prepend(this._iconSort);
        } else if (this._iconSort) {
            this._iconSort.destroy();
            this._iconSort = null;
        }
    }

    get sortable() {
        return this._sortable;
    }

    /**
     * Gets / sets whether the panel can be removed
     */
    set removable(value) {
        if (this.removable === value) return;

        if (value) {
            this._btnRemove = new Button({
                icon: 'E289',
                class: CLASS_PANEL_REMOVE
            });
            this._btnRemove.on('click', this._onClickRemove.bind(this));
            this.header.append(this._btnRemove);
        } else {
            this._btnRemove.destroy();
            this._btnRemove = null;
        }
    }

    get removable() {
        return !!this._btnRemove;
    }

    /**
     * Gets / sets whether the panel collapses horizontally - this would be the case for side panels. Defaults to `false`.
     */
    set collapseHorizontally(value) {
        if (this._collapseHorizontally === value) return;

        this._collapseHorizontally = value;
        if (value) {
            this.class.add(CLASS_PANEL_HORIZONTAL);
        } else {
            this.class.remove(CLASS_PANEL_HORIZONTAL);
        }

        this._reflow();
    }

    get collapseHorizontally() {
        return this._collapseHorizontally;
    }

    /**
     * Gets the content container.
     */
    get content(): Container {
        return this._containerContent;
    }

    /**
     * Gets the header container.
     */
    get header(): Container {
        return this._containerHeader;
    }

    /**
     * The header text of the panel. Defaults to the empty string.
     */
    set headerText(value) {
        this._labelTitle.text = value;
    }

    get headerText() {
        return this._labelTitle.text;
    }

    /**
     * The height of the header in pixels. Defaults to 32.
     */
    set headerSize(value) {
        this._headerSize = value;
        const style = this._containerHeader.dom.style;
        style.height = Math.max(0, value) + 'px';
        style.lineHeight = style.height;
        this._reflow();
    }

    get headerSize() {
        return this._headerSize;
    }
}

Element.register('panel', Panel);

export default Panel;
