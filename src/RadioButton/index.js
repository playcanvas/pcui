import Element from '../Element';
import * as pcuiClass from '../class';

const CLASS_RADIO_BUTTON = 'pcui-radio-button';
const CLASS_RADIO_BUTTON_SELECTED = CLASS_RADIO_BUTTON + '-selected';

/**
 * @name RadioButton
 * @class
 * @classdesc A radio button element.
 * @property {boolean} renderChanges If true the input will flash when changed.
 * @augments Element
 * @mixes IBindable
 * @mixes IFocusable
 */
class RadioButton extends Element {
    /**
     * Creates a new pcui.RadioButton.
     *
     * @param {object} args - The arguments.
     */
    constructor(args) {
        args = Object.assign({
            tabIndex: 0
        }, args);

        super(args.dom ? args.dom : document.createElement('div'), args);

        this._text = args.text || '';

        this.class.add(CLASS_RADIO_BUTTON);
        this.class.add(pcuiClass.NOT_FLEXIBLE);

        this._domEventKeyDown = this._onKeyDown.bind(this);
        this._domEventFocus = this._onFocus.bind(this);
        this._domEventBlur = this._onBlur.bind(this);

        this.dom.addEventListener('keydown', this._domEventKeyDown);
        this.dom.addEventListener('focus', this._domEventFocus);
        this.dom.addEventListener('blur', this._domEventBlur);

        this._value = null;
        if (args.value !== undefined) {
            this.value = args.value;
        }

        this.renderChanges = args.renderChanges;
    }

    _onClick(evt) {
        if (this.enabled) {
            this.focus();
        }

        if (this.enabled && !this.readOnly) {
            this.value = !this.value;
        }

        return super._onClick(evt);
    }

    _onKeyDown(evt) {
        if (evt.keyCode === 27) {
            this.blur();
            return;
        }

        if (!this.enabled || this.readOnly) return;

        if (evt.keyCode === 32) {
            evt.stopPropagation();
            evt.preventDefault();
            this.value = !this.value;
        }
    }

    _onFocus() {
        this.emit('focus');
    }

    _onBlur() {
        this.emit('blur');
    }

    _updateValue(value) {
        this.class.remove(pcuiClass.MULTIPLE_VALUES);

        if (value === this.value) return false;

        this._value = value;

        if (value) {
            this.class.add(CLASS_RADIO_BUTTON_SELECTED);
        } else {
            this.class.remove(CLASS_RADIO_BUTTON_SELECTED);
        }

        if (this.renderChanges) {
            this.flash();
        }

        this.emit('change', value);

        return true;
    }

    focus() {
        this.dom.focus();
    }

    blur() {
        this.dom.blur();
    }

    destroy() {
        if (this._destroyed) return;

        this.dom.removeEventListener('keydown', this._domEventKeyDown);
        this.dom.removeEventListener('focus', this._domEventFocus);
        this.dom.removeEventListener('blur', this._domEventBlur);

        super.destroy();
    }

    set value(value) {
        const changed = this._updateValue(value);
        if (changed && this._binding) {
            this._binding.setValue(value);
        }
    }

    get value() {
        return this._value;
    }

    /* eslint accessor-pairs: 0 */
    set values(values) {
        let different = false;
        const value = values[0];
        for (let i = 1; i < values.length; i++) {
            if (values[i] !== value) {
                different = true;
                break;
            }
        }

        if (different) {
            this._updateValue(null);
            this.class.add(pcuiClass.MULTIPLE_VALUES);
        } else {
            this._updateValue(values[0]);
        }
    }
}

Element.register('boolean', RadioButton, { renderChanges: true });

export default RadioButton;
