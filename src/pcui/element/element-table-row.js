import Container from './element-container';

const CLASS_ROW = 'pcui-table-row';
const CLASS_SELECTED_ROW = CLASS_ROW + '-selected';

/**
 * @name TableRow
 * @class
 * @classdesc Represents the row of a pcui.Table
 * @augments Container
 * @mixes IFocusable
 * @property {boolean} selected Whether the row is selected
 * @property {TableRow} previousSibling Returns the previous visible sibling row
 * @property {TableRow} nextSibling Returns the next visible sibling row
 */
class TableRow extends Container {
    /**
     * Creates new TableRow.
     *
     * @param {object} [args] - The arguments
     * @param {boolean} [args.header] - If true then this is a header row
     */
    constructor(args) {
        args = Object.assign({
            tabIndex: args && args.header ? -1 : 0,
            dom: document.createElement('tr')
        }, args);

        super(args);

        this.class.add(CLASS_ROW);

        if (args.header) {
            this._header = true;
        }

        this._selected = false;

        if (!this._header) {
            this._domEvtFocus = this._onFocus.bind(this);
            this._domEvtBlur = this._onBlur.bind(this);

            this.dom.addEventListener('focus', this._domEvtFocus);
            this.dom.addEventListener('blur', this._domEvtBlur);
        }
    }

    _onFocus() {
        this.emit('focus', this);
    }

    _onBlur() {
        this.emit('blur', this);
    }

    focus() {
        if (this._header) return;
        this.dom.focus();
    }

    blur() {
        if (this._header) return;
        this.dom.blur();
    }

    destroy() {
        if (this._destroyed) return;

        if (this._domEvtFocus) {
            this.dom.removeEventListener('focus', this._domEvtFocus);
        }
        if (this._domEvtBlur) {
            this.dom.removeEventListener('blur', this._domEvtBlur);
        }

        super.destroy();
    }

    get selected() {
        return this._selected;
    }

    set selected(value) {
        if (this._header) return;

        if (value) {
            this.focus();
        }

        if (this.selected === value) return;

        this._selected = value;

        if (value) {
            this.classAdd(CLASS_SELECTED_ROW);
            this.emit('select', this);
        } else {
            this.classRemove(CLASS_SELECTED_ROW);
            this.emit('deselect', this);
        }
    }

    get nextSibling() {
        let next = this.dom.nextSibling;
        while (next) {
            if (next.ui instanceof TableRow && !next.ui.hidden) {
                return next.ui;
            }

            next = next.nextSibling;
        }

        return null;
    }

    get previousSibling() {
        let prev = this.dom.previousSibling;
        while (prev) {
            if (prev.ui instanceof TableRow && !prev.ui.hidden) {
                return prev.ui;
            }

            prev = prev.previousSibling;
        }

        return null;
    }
}

export default TableRow;
