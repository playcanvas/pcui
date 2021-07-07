import './style.scss';
import './toggle-style.scss';
import Element, { ElementArgs } from '../Element';
import * as pcuiClass from '../../class';

const CLASS_BOOLEAN_INPUT = 'pcui-boolean-input';
const CLASS_BOOLEAN_INPUT_TICKED = CLASS_BOOLEAN_INPUT + '-ticked';
const CLASS_BOOLEAN_INPUT_TOGGLE = CLASS_BOOLEAN_INPUT + '-toggle';

/**
 * @name BooleanInputArgs
 * @class
 * @classdesc The class for all BooleanInput arguments extending ElementArgs.
 * @property {string} [type] - The type of checkbox currently can be null or 'toggle'.
 * @property {boolean} [renderChanges] If true the input will flash when changed.
 * @property {boolean} [value] Either true/false.
 */
export class BooleanInputArgs extends ElementArgs {
}

/**
 * @name BooleanInput
 * @class
 * @classdesc A checkbox element.
 * @property {boolean} renderChanges If true the input will flash when changed.
 * @augments Element
 * @mixes IBindable
 * @mixes IFocusable
 * @param {BooleanInputArgs} [args] - The arguments.
 */
class BooleanInput extends Element {
    /**
     * Creates a new pcui.BooleanInput.
     *
     * @param {BooleanInputArgs} [args] - The arguments.
     */
    constructor(args) {
        args = Object.assign({
            tabIndex: 0
        }, args);

        super(args.dom ? args.dom : document.createElement('div'), args);

        if (args.type === 'toggle') {
            this.class.add(CLASS_BOOLEAN_INPUT_TOGGLE);
        } else {
            this.class.add(CLASS_BOOLEAN_INPUT);
        }
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
            this.class.add(CLASS_BOOLEAN_INPUT_TICKED);
        } else {
            this.class.remove(CLASS_BOOLEAN_INPUT_TICKED);
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

    get value() {
        return this._value;
    }

    set value(value) {
        const changed = this._updateValue(value);
        if (changed && this._binding) {
            this._binding.setValue(value);
        }
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

Element.register('boolean', BooleanInput, { renderChanges: true });

export default BooleanInput;
