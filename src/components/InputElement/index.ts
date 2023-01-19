import Element, { ElementArgs, IBindable, IBindableArgs, IFocusable, IPlaceholder, IPlaceholderArgs } from '../Element';
import * as pcuiClass from '../../class';

const CLASS_INPUT_ELEMENT = 'pcui-input-element';

/**
 * The arguments for the {@link InputElement} constructor.
 */
export interface InputElementArgs extends ElementArgs, IBindableArgs, IPlaceholderArgs {
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
     * The input element to associate this {@link InputElement} with. If not supplied one will be created instead.
     */
    input?: HTMLInputElement
}

/**
 * The InputElement is an abstract class that manages an input DOM element. It is the superclass of
 * {@link TextInput} and {@link NumericInput}. It is not intended to be used directly.
 */
abstract class InputElement extends Element implements IBindable, IFocusable, IPlaceholder {
    protected _domInput: HTMLInputElement;

    protected _suspendInputChangeEvt: boolean;

    protected _prevValue: any;

    protected _keyChange: boolean;

    protected _renderChanges: boolean;

    protected _blurOnEnter: boolean;

    protected _blurOnEscape: boolean;

    protected _onInputKeyDownEvt: (evt: KeyboardEvent) => void;

    protected _onInputChangeEvt: (evt: Event) => void;

    constructor(args: InputElementArgs = {}) {
        super(args);

        this.class.add(CLASS_INPUT_ELEMENT);

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
        input.addEventListener('keydown', this._onInputKeyDownEvt);
        input.addEventListener('focus', this._onInputFocus);
        input.addEventListener('blur', this._onInputBlur);
        input.addEventListener('contextmenu', this._onInputCtxMenu, false);

        this.dom.appendChild(input);

        this._domInput = input;

        this._suspendInputChangeEvt = false;

        if (args.value !== undefined) {
            this._domInput.value = args.value;
        }
        this.placeholder = args.placeholder ?? '';
        this.renderChanges = args.renderChanges ?? false;
        this.blurOnEnter = args.blurOnEnter ?? true;
        this.blurOnEscape = args.blurOnEscape ?? true;
        this.keyChange = args.keyChange ?? false;
        this._prevValue = null;

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
        input.removeEventListener('keydown', this._onInputKeyDownEvt);
        input.removeEventListener('focus', this._onInputFocus);
        input.removeEventListener('blur', this._onInputBlur);
        input.removeEventListener('keyup', this._onInputKeyUp);
        input.removeEventListener('contextmenu', this._onInputCtxMenu);

        super.destroy();
    }

    protected _onInputFocus = (evt: FocusEvent) => {
        this.class.add(pcuiClass.FOCUS);
        this.emit('focus', evt);
        this._prevValue = this._domInput.value;
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

    protected _onInputChange(evt: Event) {}

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

    focus(select?: boolean) {
        this._domInput.focus();
        if (select) {
            this._domInput.select();
        }
    }

    blur() {
        this._domInput.blur();
    }

    set placeholder(value: string) {
        if (value) {
            this.dom.setAttribute('placeholder', value);
        } else {
            this.dom.removeAttribute('placeholder');
        }
    }

    get placeholder(): string {
        return this.dom.getAttribute('placeholder') ?? '';
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

    abstract set value(value: any);

    abstract get value(): any;

    abstract set values(value: Array<any>);

    abstract get values(): Array<any>;

    set renderChanges(value: boolean) {
        this._renderChanges = value;
    }

    get renderChanges(): boolean {
        return this._renderChanges;
    }
}

export default InputElement;
