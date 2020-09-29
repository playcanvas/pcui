import './style.scss';
import * as pcuiClass from '../../class';
import Container from '../Container';
import Label from '../Label';
import Button from '../Button';

const CLASS_PANEL = 'pcui-panel';
const CLASS_PANEL_HEADER = CLASS_PANEL + '-header';
const CLASS_PANEL_HEADER_TITLE = CLASS_PANEL_HEADER + '-title';
const CLASS_PANEL_CONTENT = CLASS_PANEL + '-content';
const CLASS_PANEL_HORIZONTAL = CLASS_PANEL + '-horizontal';
const CLASS_PANEL_SORTABLE_ICON = CLASS_PANEL + '-sortable-icon';
const CLASS_PANEL_REMOVE = CLASS_PANEL + '-remove';

// TODO: document panelType

/**
 * @event
 * @name Panel#collapse
 * @description Fired when the panel gets collapsed
 */

/**
 * @event
 * @name Panel#expand
 * @description Fired when the panel gets expanded
 */

/**
 * @name Panel
 * @classdesc The Panel is a pcui.Container that itself contains a header container and a content container. The
 * respective pcui.Container functions work using the content container. One can also append elements to the header of the Panel.
 * @property {boolean} flex Gets / sets whether the container supports flex layout. Defaults to false. Cannot co-exist with grid.
 * @property {boolean} grid Gets / sets whether the container supports grid layout. Defaults to false. Cannot co-exist with flex.
 * @property {boolean} collapsible Gets / sets whether the panel can be collapsed by clicking on its header or by setting collapsed to true. Defaults to false.
 * @property {boolean} sortable Gets / sets whether the panel can be reordered
 * @property {boolean} collapsed Gets / sets whether the panel is collapsed or expanded. Defaults to false.
 * @property {boolean} collapseHorizontally Gets / sets whether the panel collapses horizontally - this would be the case for side panels. Defaults to false.
 * @property {boolean} removable Gets / sets whether the panel can be removed
 * @property {number} headerSize The height of the header in pixels. Defaults to 32.
 * @property {string} headerText The header text of the panel. Defaults to the empty string.
 * @property {Container} header Gets the header conttainer.
 * @property {Container} content Gets the content conttainer.
 * @augments Container
 * @mixes pcui.IContainer
 * @mixes pcui.IFlex
 * @mixes pcui.IGrid
 * @mixes pcui.IScrollable
 * @mixes pcui.IResizable
 */
class Panel extends Container {
    /**
     * Creates a new Panel.
     *
     * @param {object} args - The arguments. Extends the pcui.Container constructor arguments. All settable properties can also be set through the constructor.
     */
    constructor(args) {
        if (!args) args = {};

        const panelArgs = Object.assign({}, args);
        panelArgs.flex = true;
        delete panelArgs.grid;
        delete panelArgs.flexDirection;
        delete panelArgs.scrollable;

        super(panelArgs);

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
        this.headerSize = args.headerSize !== undefined ? args.headerSize : 32;

        this._domEvtDragStart = this._onDragStart.bind(this);
        this._domEvtDragMove = this._onDragMove.bind(this);
        this._domEvtDragEnd = this._onDragEnd.bind(this);

        // collapse related
        this._reflowTimeout = null;
        this._widthBeforeCollapse = null;
        this._heightBeforeCollapse = null;

        this.collapsible = args.collapsible || false;
        this.collapsed = args.collapsed || false;
        this.collapseHorizontally = args.collapseHorizontally || false;

        this._iconSort = null;
        this.sortable = args.sortable || false;

        this._btnRemove = null;
        this.removable = args.removable || false;

        // set the contents container to be the content DOM element
        // from now on calling append functions on the panel will append themn
        // elements to the contents container
        this.domContent = this._containerContent.dom;

        // execute reflow now after all fields have been initialized
        this._suspendReflow = false;
        this._reflow();
    }

    _initializeHeader(args) {
        // header container
        this._containerHeader = new Container({
            flex: true,
            flexDirection: 'row',
            class: [CLASS_PANEL_HEADER, 'font-bold']
        });

        // header title
        this._labelTitle = new Label({
            text: args.headerText,
            class: [CLASS_PANEL_HEADER_TITLE, 'font-bold']
        });
        this._containerHeader.append(this._labelTitle);

        // use native click listener because the pcui.Element#click event is only fired
        // if the element is enabled. However we still want to catch header click events in order
        // to collapse them
        this._containerHeader.dom.addEventListener('click', this._onHeaderClick.bind(this));

        this.append(this._containerHeader);
    }

    _onHeaderClick(evt) {
        if (!this._collapsible) return;
        if (evt.target !== this.header.dom && evt.target !== this._labelTitle.dom) return;

        // toggle collapsed
        this.collapsed = !this.collapsed;
    }

    _onClickRemove(evt) {
        evt.preventDefault();
        evt.stopPropagation();

        this.emit('click:remove');
    }

    _initializeContent(args) {
        // containers container
        this._containerContent = new Container({
            class: CLASS_PANEL_CONTENT,
            grid: args.grid,
            flex: args.flex,
            flexDirection: args.flexDirection,
            scrollable: args.scrollable,
            dom: args.container
        });

        this.append(this._containerContent);
    }

    // Collapses or expands the panel as needed
    _reflow() {
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
                // we might get innacurate width/heights.
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

    _onDragStart(evt) {
        if (this.disabled || this.readOnly) return;

        evt.stopPropagation();
        evt.preventDefault();

        window.addEventListener('mouseup', this._domEvtDragEnd);
        window.addEventListener('mouseleave', this._domEvtDragEnd);
        window.addEventListener('mousemove', this._domEvtDragMove);

        this.emit('dragstart');
        if (this.parent && this.parent._onChildDragStart) {
            this.parent._onChildDragStart(evt, this);
        }
    }

    _onDragMove(evt) {
        this.emit('dragmove');
        if (this.parent && this.parent._onChildDragStart) {
            this.parent._onChildDragMove(evt, this);
        }
    }

    _onDragEnd(evt) {
        window.removeEventListener('mouseup', this._domEvtDragEnd);
        window.removeEventListener('mouseleave', this._domEvtDragEnd);
        window.removeEventListener('mousemove', this._domEvtDragMove);

        if (this._draggedChild === this) {
            this._draggedChild = null;
        }

        this.emit('dragend');
        if (this.parent && this.parent._onChildDragStart) {
            this.parent._onChildDragEnd(evt, this);
        }
    }


    destroy() {
        if (this._destroyed) return;
        if (this._reflowTimeout) {
            cancelAnimationFrame(this._reflowTimeout);
            this._reflowTimeout = null;
        }

        window.removeEventListener('mouseup', this._domEvtDragEnd);
        window.removeEventListener('mouseleave', this._domEvtDragEnd);
        window.removeEventListener('mousemove', this._domEvtDragMove);

        super.destroy();
    }

    get collapsible() {
        return this._collapsible;
    }

    set collapsible(value) {
        if (value === this._collapsible) return;

        this._collapsible = value;

        if (value) {
            this.classAdd(pcuiClass.COLLAPSIBLE);
        } else {
            this.classRemove(pcuiClass.COLLAPSIBLE);
        }

        this._reflow();

        if (this.collapsed) {
            this.emit(value ? 'collapse' : 'expand');
        }

    }

    get collapsed() {
        return this._collapsed;
    }

    set collapsed(value) {
        if (this._collapsed === value) return;

        this._collapsed = value;

        this._reflow();

        if (this.collapsible) {
            this.emit(value ? 'collapse' : 'expand');
        }
    }

    get sortable() {
        return this._sortable;
    }

    set sortable(value) {
        if (this._sortable === value) return;

        this._sortable = value;

        if (value) {
            this._iconSort = new Label({
                class: CLASS_PANEL_SORTABLE_ICON
            });

            this._iconSort.dom.addEventListener('mousedown', this._domEvtDragStart);

            this.header.prepend(this._iconSort);
        } else if (this._iconSort) {
            this._iconSort.destroy();
            this._iconSort = null;
        }
    }

    get removable() {
        return !!this._btnRemove;
    }

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

    get collapseHorizontally() {
        return this._collapseHorizontally;
    }

    set collapseHorizontally(value) {
        if (this._collapseHorizontally === value) return;

        this._collapseHorizontally = value;
        if (value) {
            this.classAdd(CLASS_PANEL_HORIZONTAL);
        } else {
            this.classRemove(CLASS_PANEL_HORIZONTAL);
        }

        this._reflow();
    }

    get content() {
        return this._containerContent;
    }

    get header() {
        return this._containerHeader;
    }

    get headerText() {
        return this._labelTitle.text;
    }

    set headerText(value) {
        this._labelTitle.text = value;
    }

    get headerSize() {
        return this._headerSize;
    }

    set headerSize(value) {
        this._headerSize = value;
        const style = this._containerHeader.dom.style;
        style.height = Math.max(0, value) + 'px';
        style.lineHeight = style.height;
        this._reflow();
    }
}

export { Panel };
export default Panel;
