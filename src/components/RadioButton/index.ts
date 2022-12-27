import Element, { ElementArgs, IBindable, IBindableArgs, IFocusable } from '../Element/index';
import * as pcuiClass from '../../class';

const CLASS_RADIO_BUTTON = 'pcui-radio-button';
const CLASS_RADIO_BUTTON_SELECTED = CLASS_RADIO_BUTTON + '-selected';

/**
 * The arguments for the {@link RadioButton} constructor.
 */
export interface RadioButtonArgs extends ElementArgs, IBindableArgs {}

/**
 * A radio button element.
 */
class RadioButton extends Element implements IBindable, IFocusable {
    static readonly defaultArgs: RadioButtonArgs = {
        ...Element.defaultArgs,
        value: null,
        tabIndex: 0
    };

    protected _domEventKeyDown: any;

    protected _domEventFocus: any;

    protected _domEventBlur: any;

    protected _value: boolean;

    protected _renderChanges: boolean;

    constructor(args: RadioButtonArgs = RadioButton.defaultArgs) {
        args = { ...RadioButton.defaultArgs, ...args };
        super(args.dom, args);

        this.class.add(CLASS_RADIO_BUTTON);
        this.class.add(pcuiClass.NOT_FLEXIBLE);

        this._domEventKeyDown = this._onKeyDown.bind(this);
        this._domEventFocus = this._onFocus.bind(this);
        this._domEventBlur = this._onBlur.bind(this);

        this.dom.addEventListener('keydown', this._domEventKeyDown);
        this.dom.addEventListener('focus', this._domEventFocus);
        this.dom.addEventListener('blur', this._domEventBlur);

        this.value = args.value;
        this._renderChanges = args.renderChanges;
    }

    protected _onClick(evt: MouseEvent) {
        if (this.enabled) {
            this.focus();
        }

        if (this.enabled && !this.readOnly) {
            this.value = !this.value;
        }

        return super._onClick(evt);
    }

    protected _onKeyDown(evt: KeyboardEvent) {
        if (evt.key === 'Escape') {
            this.blur();
            return;
        }

        if (!this.enabled || this.readOnly) return;

        if (evt.key === ' ') {
            evt.stopPropagation();
            evt.preventDefault();
            this.value = !this.value;
        }
    }

    protected _onFocus(evt: FocusEvent) {
        this.emit('focus');
    }

    protected _onBlur(evt: FocusEvent) {
        this.emit('blur');
    }

    protected _updateValue(value: boolean) {
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
    set values(values: Array<boolean>) {
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

    set renderChanges(renderChanges) {
        this._renderChanges = renderChanges;
    }

    get renderChanges() {
        return this._renderChanges;
    }
}

Element.register('radio', RadioButton, { renderChanges: true });

export default RadioButton;
