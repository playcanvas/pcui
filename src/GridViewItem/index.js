import Container from '../Container';
import Label from '../Label';
import BindingObserversToElement from '../BindingObserversToElement';
import './style.scss';
import RadioButton from '../RadioButton';

const CLASS_ROOT = 'pcui-gridview-item';
const CLASS_ROOT_RADIO = 'pcui-gridview-radio-container';
const CLASS_SELECTED = CLASS_ROOT + '-selected';
const CLASS_TEXT = CLASS_ROOT + '-text';
const CLASS_RADIO_BUTTON = CLASS_ROOT + 'radiobtn';

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
    /**
     * Creates new pcui.GridViewItem
     *
     * @param {object} args - The arguments
     * @param {string} [args.type] - The type of gridview item, can be null or 'radio'
     */
    constructor(args) {
        args = Object.assign({
            tabIndex: 0
        }, args);

        super(args);

        this.allowSelect = args.allowSelect !== undefined ? args.allowSelect : true;
        this._selected = false;

        if (args.type == 'radio') {
            this.class.add(CLASS_ROOT_RADIO);

            this._radioButton = new RadioButton({
                class: CLASS_RADIO_BUTTON,
                binding: new BindingObserversToElement()
            });

            this._radioButtonClickEvt = this._radioButtonClick.bind(this);

            // Remove radio button click event listener
            this._radioButton.dom.removeEventListener('click', this._radioButton._onClick);
            this._radioButton.dom.addEventListener('click', this._radioButtonClickEvt);

            this.append(this._radioButton);
        } else {
            this.class.add(CLASS_ROOT);
        }

        this._labelText = new Label({
            class: CLASS_TEXT,
            binding: new BindingObserversToElement()
        });

        this.append(this._labelText);

        this.text = args.text;
        this._type = args.type;

        this._domEvtFocus = this._onFocus.bind(this);
        this._domEvtBlur = this._onBlur.bind(this);

        this.dom.addEventListener('focus', this._domEvtFocus);
        this.dom.addEventListener('blur', this._domEvtBlur);
    }

    _radioButtonClick() {
        this._radioButton.value = this.selected;
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

    set allowSelect(value) {
        this._allowSelect = value;
    }

    get allowSelect() {
        return this._allowSelect;
    }

    set selected(value) {
        if (value) {
            this.focus();
        }

        if (this._selected === value) return;

        this._selected = value;

        if (value) {
            // Update radio button if it exists
            if (this._radioButton)
                this._radioButton.value = value;
            else
                this.classAdd(CLASS_SELECTED);

            this.emit('select', this);
        } else {
            // Update radio button if it exists
            if (this._radioButton)
                this._radioButton.value = false;
            else
                this.classRemove(CLASS_SELECTED);

            this.emit('deselect', this);
        }
    }

    get selected() {
        return this._selected;
    }

    set text(value) {
        this._labelText.text = value;
    }

    get text() {
        return this._labelText.text;
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
