import { CLASS_MULTIPLE_VALUES } from '../../class';
import Element, { IBindableArgs, IPlaceholderArgs } from '../Element';
import InputElement, { InputElementArgs } from '../InputElement';

const CLASS_TEXT_INPUT = 'pcui-text-input';

/**
 * The arguments for the {@link TextInput} constructor.
 */
export interface TextInputArgs extends InputElementArgs, IBindableArgs, IPlaceholderArgs {
    /**
     * A function that validates the value that is entered into the input and returns `true` if it
     * is valid or `false` otherwise. If `false` then the input will be set in an error state and
     * the value will not propagate to the binding.
     */
    onValidate?: (value: string) => boolean,
}

/**
 * The TextInput is an input element of type text.
 */
class TextInput extends InputElement {
    protected _onValidate: (value: string) => boolean;

    /**
     * Creates a new TextInput.
     *
     * @param args - The arguments.
     */
    constructor(args: Readonly<TextInputArgs> = {}) {
        super(args);

        this.class.add(CLASS_TEXT_INPUT);

        if (args.onValidate) {
            this.onValidate = args.onValidate;
        }
    }

    protected _onInputChange(evt: Event) {
        if (this._suspendInputChangeEvt) return;

        if (this._onValidate) {
            const error = !this._onValidate(this.value);
            this.error = error;
            if (error) {
                return;
            }
        } else {
            this.error = false;
        }

        this.emit('change', this.value);

        if (this._binding) {
            this._binding.setValue(this.value);
        }
    }

    protected _updateValue(value: string | Array<string>) {
        this.class.remove(CLASS_MULTIPLE_VALUES);

        if (value && typeof (value) === 'object') {
            if (Array.isArray(value)) {
                let isObject = false;
                for (let i = 0; i < value.length; i++) {
                    if (value[i] && typeof value[i] === 'object') {
                        isObject = true;
                        break;
                    }
                }

                value = isObject ? '[Not available]' : value.map((val) => {
                    return val === null ? 'null' : val;
                }).join(',');
            } else {
                value = '[Not available]';
            }
        }

        if (value === this.value) return false;

        this._suspendInputChangeEvt = true;
        this._domInput.value = (value === null || value === undefined) ? '' : String(value);
        this._suspendInputChangeEvt = false;

        this.emit('change', value);

        return true;
    }

    set value(value: string | Array<string>) {
        const changed = this._updateValue(value);

        if (changed) {
            // reset error
            this.error = false;
        }

        if (changed && this._binding) {
            this._binding.setValue(value);
        }
    }

    get value(): string {
        return this._domInput.value;
    }

    /* eslint accessor-pairs: 0 */
    set values(values: Array<string>) {
        const different = values.some(v => v !== values[0]);

        if (different) {
            this._updateValue(null);
            this.class.add(CLASS_MULTIPLE_VALUES);
        } else {
            this._updateValue(values[0]);
        }
    }

    /**
     * Gets / sets the validate method for the input.
     */
    set onValidate(value) {
        this._onValidate = value;
    }

    get onValidate() {
        return this._onValidate;
    }
}

Element.register('string', TextInput, { renderChanges: true });

export default TextInput;
