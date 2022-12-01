import Element from '../Element/index';
import Input from '../Input/index';
import * as pcuiClass from '../../class';

const CLASS_BOOLEAN_INPUT = 'pcui-boolean-input';
const CLASS_BOOLEAN_INPUT_TICKED = CLASS_BOOLEAN_INPUT + '-ticked';
const CLASS_BOOLEAN_INPUT_TOGGLE = CLASS_BOOLEAN_INPUT + '-toggle';

namespace BooleanInput {
    export interface Args extends Element.Args, Element.IBindableArgs {
        /**
         * The type of checkbox. Currently can be null or 'toggle'.
         */
        type?: string
    }
}

/**
 * A checkbox element.
 */
class BooleanInput extends Input implements Element.IBindable, Element.IFocusable {

    static readonly defaultArgs: BooleanInput.Args = {
        ...Element.defaultArgs,
        renderChanges: false,
        value: false,
        tabIndex: 0,
        dom: document.createElement('div')
    };

    protected _domEventKeyDown: any;
    protected _domEventFocus: any;
    protected _domEventBlur: any;
    protected _value: any;

    constructor(args: BooleanInput.Args = BooleanInput.defaultArgs) {
        args = { ...BooleanInput.defaultArgs, ...args };
        super(args.dom, args);

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

    protected _onFocus() {
        this.emit('focus');
    }

    protected _onBlur() {
        this.emit('blur');
    }

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

    destroy() {
        if (this._destroyed) return;

        this.dom.removeEventListener('keydown', this._domEventKeyDown);
        this.dom.removeEventListener('focus', this._domEventFocus);
        this.dom.removeEventListener('blur', this._domEventBlur);

        super.destroy();
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
}

Element.register('boolean', BooleanInput, { renderChanges: true });

export default BooleanInput;
