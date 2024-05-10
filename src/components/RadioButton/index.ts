import { CLASS_MULTIPLE_VALUES, CLASS_NOT_FLEXIBLE } from '../../class';
import Element, { ElementArgs, IBindable, IBindableArgs, IFocusable } from '../Element';

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
    protected _value: boolean;

    protected _renderChanges: boolean;

    /**
     * Creates a new RadioButton.
     *
     * @param args - The arguments.
     */
    constructor(args: Readonly<RadioButtonArgs> = {}) {
        super({ tabIndex: 0, ...args });

        this.class.add(CLASS_RADIO_BUTTON);
        this.class.add(CLASS_NOT_FLEXIBLE);

        this.dom.addEventListener('keydown', this._onKeyDown);
        this.dom.addEventListener('focus', this._onFocus);
        this.dom.addEventListener('blur', this._onBlur);

        this.value = args.value;
        this._renderChanges = args.renderChanges;
    }

    destroy() {
        if (this._destroyed) return;

        this.dom.removeEventListener('keydown', this._onKeyDown);
        this.dom.removeEventListener('focus', this._onFocus);
        this.dom.removeEventListener('blur', this._onBlur);

        super.destroy();
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

    protected _onKeyDown = (evt: KeyboardEvent) => {
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
    };

    protected _onFocus = (evt: FocusEvent) => {
        this.emit('focus');
    };

    protected _onBlur = (evt: FocusEvent) => {
        this.emit('blur');
    };

    protected _updateValue(value: boolean) {
        this.class.remove(CLASS_MULTIPLE_VALUES);

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
    set values(values: boolean[]) {
        const different = values.some(v => v !== values[0]);

        if (different) {
            this._updateValue(null);
            this.class.add(CLASS_MULTIPLE_VALUES);
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
