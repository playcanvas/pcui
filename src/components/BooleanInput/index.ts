import Element, { ElementArgs, IBindable, IBindableArgs, IFocusable } from '../Element';
import * as pcuiClass from '../../class';

const CLASS_BOOLEAN_INPUT = 'pcui-boolean-input';
const CLASS_BOOLEAN_INPUT_TICKED = CLASS_BOOLEAN_INPUT + '-ticked';
const CLASS_BOOLEAN_INPUT_TOGGLE = CLASS_BOOLEAN_INPUT + '-toggle';

/**
 * The arguments for the {@link BooleanInput} constructor.
 */
export interface BooleanInputArgs extends ElementArgs, IBindableArgs {
    /**
     * Sets the tabIndex of the {@link BooleanInput}. Defaults to 0.
     */
    tabIndex?: number,
    /**
     * The type of checkbox. Currently can be `null` or 'toggle'.
     */
    type?: string
}

/**
 * A checkbox element.
 */
class BooleanInput extends Element implements IBindable, IFocusable {
    protected _value: boolean;

    protected _renderChanges: boolean;

    /**
     * Creates a new BooleanInput.
     *
     * @param args - The arguments.
     */
    constructor(args: Readonly<BooleanInputArgs> = {}) {
        super({ tabIndex: 0, ...args });

        if (args.type === 'toggle') {
            this.class.add(CLASS_BOOLEAN_INPUT_TOGGLE);
        } else {
            this.class.add(CLASS_BOOLEAN_INPUT);
        }
        this.class.add(pcuiClass.NOT_FLEXIBLE);

        this.dom.addEventListener('keydown', this._onKeyDown);
        this.dom.addEventListener('focus', this._onFocus);
        this.dom.addEventListener('blur', this._onBlur);

        this._value = null;
        if (args.value !== undefined) {
            this.value = args.value;
        }

        this.renderChanges = args.renderChanges ?? false;
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

    protected _onFocus = () => {
        this.emit('focus');
    };

    protected _onBlur = () => {
        this.emit('blur');
    };

    protected _updateValue(value: boolean) {
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

    set value(value: boolean) {
        const changed = this._updateValue(value);
        if (changed && this._binding) {
            this._binding.setValue(value);
        }
    }

    get value(): boolean {
        return this._value;
    }

    /* eslint accessor-pairs: 0 */
    set values(values: boolean[]) {
        const different = values.some(v => v !== values[0]);

        if (different) {
            this._updateValue(null);
            this.class.add(pcuiClass.MULTIPLE_VALUES);
        } else {
            this._updateValue(values[0]);
        }
    }

    set renderChanges(value: boolean) {
        this._renderChanges = value;
    }

    get renderChanges(): boolean {
        return this._renderChanges;
    }
}

Element.register('boolean', BooleanInput, { renderChanges: true });

export default BooleanInput;
