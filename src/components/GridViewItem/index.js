import Container from '../Container';
import Label from '../Label';
import { BindingObserversToElement } from '../../binding';
import './style.scss';

const CLASS_ROOT = 'pcui-gridview-item';
const CLASS_SELECTED = CLASS_ROOT + '-selected';
const CLASS_TEXT = CLASS_ROOT + '-text';

/**
 * @name GridViewItem
 * @augments Container
 * @mixes IFocusable
 * @class
 * @classdesc Represents a grid view item used in GridView.
 * @property {boolean} allowSelect - If true allow selecting the item. Defaults to true.
 * @property {boolean} selected - Whether the item is selected.
 * @property {string} text - The text of the item.
 * @property {GridViewItem} previousSibling - Returns the previous visible sibling grid view item.
 * @property {GridViewItem} nextSibling - Returns the next visible sibling grid view item.
 */
class GridViewItem extends Container {
    constructor(args) {
        args = Object.assign({
            tabIndex: 0
        }, args);

        super(args);

        this.class.add(CLASS_ROOT);

        this.allowSelect = args.allowSelect !== undefined ? args.allowSelect : true;
        this._selected = false;

        this._labelText = new Label({
            class: CLASS_TEXT,
            binding: new BindingObserversToElement()
        });
        this.append(this._labelText);

        this.text = args.text;

        this._domEvtFocus = this._onFocus.bind(this);
        this._domEvtBlur = this._onBlur.bind(this);

        this.dom.addEventListener('focus', this._domEvtFocus);
        this.dom.addEventListener('blur', this._domEvtBlur);
    }

    _onFocus() {
        this.emit('focus');
    }

    _onBlur() {
        this.emit('blur');
    }

    focus() {
        this.dom.focus();
    }

    blur() {
        this.dom.blur();
    }

    link(observers, paths) {
        this._labelText.link(observers, paths);
    }

    unlink() {
        this._labelText.unlink();
    }

    destroy() {
        if (this._destroyed) return;

        this.dom.removeEventListener('focus', this._domEvtFocus);
        this.dom.removeEventListener('blur', this._domEvtBlur);

        super.destroy();
    }

    get allowSelect() {
        return this._allowSelect;
    }

    set allowSelect(value) {
        this._allowSelect = value;
    }

    get selected() {
        return this._selected;
    }

    set selected(value) {
        if (value) {
            this.focus();
        }

        if (this._selected === value) return;

        this._selected = value;

        if (value) {
            this.classAdd(CLASS_SELECTED);
            this.emit('select', this);
        } else {
            this.classRemove(CLASS_SELECTED);
            this.emit('deselect', this);
        }
    }

    get text() {
        return this._labelText.text;
    }

    set text(value) {
        this._labelText.text = value;
    }

    get nextSibling() {
        let sibling = this.dom.nextSibling;
        while (sibling) {
            if (sibling.ui instanceof GridViewItem && !sibling.ui.hidden) {
                return sibling.ui;
            }

            sibling = sibling.nextSibling;
        }

        return null;
    }

    get previousSibling() {
        let sibling = this.dom.previousSibling;
        while (sibling) {
            if (sibling.ui instanceof GridViewItem && !sibling.ui.hidden) {
                return sibling.ui;
            }

            sibling = sibling.previousSibling;
        }

        return null;
    }
}

export default GridViewItem;
