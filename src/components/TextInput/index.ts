import Element, { IBindableArgs, IFocusable, IPlaceholder, IPlaceholderArgs } from '../Element';
import Input, { InputArgs } from '../Input';
import * as pcuiClass from '../../class';

const CLASS_TEXT_INPUT = 'pcui-text-input';

/**
 * The arguments for the {@link TextInput} constructor.
 */
export interface TextInputArgs extends InputArgs, IBindableArgs, IPlaceholderArgs {
    /**
     * Sets whether pressing Enter will blur (unfocus) the field. Defaults to `true`.
     */
    blurOnEnter?: boolean,
    /**
     * Sets whether pressing Escape will blur (unfocus) the field. Defaults to `true`.
     */
    blurOnEscape?: boolean,
    /**
     * Sets whether any key up event will cause a change event to be fired.
     */
    keyChange?: boolean,
    /**
     * A function that validates the value that is entered into the input and returns `true` if it is valid or `false` otherwise.
     * If `false` then the input will be set in an error state and the value will not propagate to the binding.
     */
    onValidate?: (value: string) => boolean,
    /**
     * The input element to associate this {@link TextInput} with. If not supplied one will be created instead.
     */
    input?: HTMLInputElement
}

/**
 * The TextInput is an input element of type text.
 */
class TextInput extends Input implements IFocusable, IPlaceholder {
    protected _domInput: HTMLInputElement;

    protected _suspendInputChangeEvt: boolean;

    protected _prevValue: any;

    protected _onValidate: any;

    protected _keyChange: boolean;

    protected _renderChanges: boolean;

    protected _blurOnEnter: boolean;

    protected _blurOnEscape: boolean;

    protected _onInputKeyDownEvt: (evt: KeyboardEvent) => void;

    protected _onInputChangeEvt: (evt: Event) => void;

    constructor(args: TextInputArgs = {}) {
        super(args.dom, args);

        this.class.add(CLASS_TEXT_INPUT);

        let input = args.input;
        if (!input) {
            input = document.createElement('input');
            input.type = 'text';
        }

        input.ui = this;
        input.tabIndex = 0;
        input.autocomplete = "off";

        this._onInputKeyDownEvt = this._onInputKeyDown.bind(this);
        this._onInputChangeEvt = this._onInputChange.bind(this);

        input.addEventListener('change', this._onInputChangeEvt);
        input.addEventListener('focus', this._onInputFocus);
        input.addEventListener('blur', this._onInputBlur);
        input.addEventListener('keydown', this._onInputKeyDownEvt);
        input.addEventListener('contextmenu', this._onInputCtxMenu, false);

        this.dom.appendChild(input);

        this._domInput = input;

        this._suspendInputChangeEvt = false;

        if (args.value !== undefined) {
            this.value = args.value;
        }
        this.placeholder = args.placeholder ?? null;
        this.renderChanges = args.renderChanges ?? false;
        this.blurOnEnter = args.blurOnEnter ?? true;
        this.blurOnEscape = args.blurOnEscape ?? true;
        this.keyChange = args.keyChange ?? false;
        this._prevValue = null;

        if (args.onValidate) {
            this.onValidate = args.onValidate;
        }

        this.on('change', () => {
            if (this.renderChanges) {
                this.flash();
            }
        });
        this.on('disable', this._updateInputReadOnly);
        this.on('enable', this._updateInputReadOnly);
        this.on('readOnly', this._updateInputReadOnly);

        this._updateInputReadOnly();
    }

    destroy() {
        if (this._destroyed) return;

        const input = this._domInput;
        input.removeEventListener('change', this._onInputChangeEvt);
        input.removeEventListener('focus', this._onInputFocus);
        input.removeEventListener('blur', this._onInputBlur);
        input.removeEventListener('keydown', this._onInputKeyDownEvt);
        input.removeEventListener('keyup', this._onInputKeyUp);
        input.removeEventListener('contextmenu', this._onInputCtxMenu);

        this._domInput = null;

        super.destroy();
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

    protected _onInputFocus = (evt: FocusEvent) => {
        this.class.add(pcuiClass.FOCUS);
        this.emit('focus', evt);
        this._prevValue = this.value;
    };

    protected _onInputBlur = (evt: FocusEvent) => {
        this.class.remove(pcuiClass.FOCUS);
        this.emit('blur', evt);
    };

    protected _onInputKeyDown(evt: KeyboardEvent) {
        if (evt.key === 'Enter' && this.blurOnEnter) {
            // do not fire input change event on blur
            // if keyChange is true (because a change event)
            // will have already been fired before for the current
            // value
            this._suspendInputChangeEvt = this.keyChange;
            this._domInput.blur();
            this._suspendInputChangeEvt = false;
        } else if (evt.key === 'Escape') {
            this._suspendInputChangeEvt = true;
            const prev = this._domInput.value;
            this._domInput.value = this._prevValue;
            this._suspendInputChangeEvt = false;

            // manually fire change event
            if (this.keyChange && prev !== this._prevValue) {
                this._onInputChange(evt);
            }

            if (this.blurOnEscape) {
                this._domInput.blur();
            }
        }

        this.emit('keydown', evt);
    }

    protected _onInputKeyUp = (evt: KeyboardEvent) => {
        if (evt.key !== 'Escape') {
            this._onInputChange(evt);
        }

        this.emit('keyup', evt);
    };

    protected _onInputCtxMenu = (evt: MouseEvent) => {
        this._domInput.select();
    };

    protected _updateInputReadOnly = () => {
        const readOnly = !this.enabled || this.readOnly;
        if (readOnly) {
            this._domInput.setAttribute('readonly', 'true');
        } else {
            this._domInput.removeAttribute('readonly');
        }
    };

    protected _updateValue(value: string | number | Array<string | number>) {
        this.class.remove(pcuiClass.MULTIPLE_VALUES);

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

    focus(select?: boolean) {
        this._domInput.focus();
        if (select) {
            this._domInput.select();
        }
    }

    blur() {
        this._domInput.blur();
    }

    set value(value: string | number | Array<string | number>) {
        const changed = this._updateValue(value);

        if (changed) {
            // reset error
            this.error = false;
        }

        if (changed && this._binding) {
            this._binding.setValue(value);
        }
    }

    get value(): string | number {
        return this._domInput.value;
    }

    /* eslint accessor-pairs: 0 */
    set values(values: Array<string | number>) {
        const different = values.some(v => v !== values[0]);

        if (different) {
            this._updateValue(null);
            this.class.add(pcuiClass.MULTIPLE_VALUES);
        } else {
            this._updateValue(values[0]);
        }
    }

    set placeholder(value) {
        if (value) {
            this.dom.setAttribute('placeholder', value);
        } else {
            this.dom.removeAttribute('placeholder');
        }
    }

    get placeholder() {
        return this.dom.getAttribute('placeholder');
    }


    /**
     * Gets / sets the method to call when keyup is called on the input DOM element.
     */
    set keyChange(value) {
        if (this._keyChange === value) return;

        this._keyChange = value;
        if (value) {
            this._domInput.addEventListener('keyup', this._onInputKeyUp);
        } else {
            this._domInput.removeEventListener('keyup', this._onInputKeyUp);
        }
    }

    get keyChange() {
        return this._keyChange;
    }

    /**
     * Gets the input DOM element.
     */
    get input() {
        return this._domInput;
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

    /**
     * Gets / sets whether the input should blur when the enter key is pressed.
     */
    set blurOnEnter(value: boolean) {
        this._blurOnEnter = value;
    }

    get blurOnEnter(): boolean {
        return this._blurOnEnter;
    }

    /**
     * Gets / sets whether the input should blur when the escape key is pressed.
     */
    set blurOnEscape(value: boolean) {
        this._blurOnEnter = value;
    }

    get blurOnEscape(): boolean {
        return this._blurOnEnter;
    }
}

Element.register('string', TextInput, { renderChanges: true });

export default TextInput;
