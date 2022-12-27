import * as pcuiClass from '../../class';
import Element, { ElementArgs, IBindableArgs, IFlexArgs, IPlaceholder, IPlaceholderArgs } from '../Element/index';
import Input from '../Input/index';

const CLASS_LABEL = 'pcui-label';

/**
 * The arguments for the {@link Label} constructor.
 */
export interface LabelArgs extends ElementArgs, IBindableArgs, IPlaceholderArgs, IFlexArgs {
    /**
     * Sets the text of the Label. Defaults to ''.
     */
    text?: string | number,
    /**
     * If `true`, the {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML innerHTML} property will be
     * used to set the text. Otherwise, {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent textContent}
     * will be used instead. Defaults to `false`.
     */
    unsafe?: boolean,
    /**
     * If `true` then use the text of the label as the native HTML tooltip. Defaults to `false`.
     */
    nativeTooltip?: boolean,
    /**
     * If `true` then the label can be clicked to select text. Defaults to `false`.
     */
    allowTextSelection?: boolean
}

/**
 * The Label is a simple span element that displays some text.
 */
class Label extends Input implements IPlaceholder {
    static readonly defaultArgs: LabelArgs = {
        ...Element.defaultArgs,
        value: '',
        text: '',
        unsafe: false,
        nativeTooltip: false,
        allowTextSelection: false,
        renderChanges: false,
        placeholder: null,
        dom: 'span'
    };

    protected _unsafe: boolean;

    protected _text: string;

    _optionValue: any;

    constructor(args: LabelArgs = Label.defaultArgs) {
        args = { ...Label.defaultArgs, ...args };
        super(args.dom, args);

        this.class.add(CLASS_LABEL);

        this._unsafe = args.unsafe;
        this.text = args.text || args.value;

        if (args.allowTextSelection) {
            this.class.add(pcuiClass.DEFAULT_MOUSEDOWN);
        }

        if (args.nativeTooltip) {
            this.dom.title = this.text;
        }
        this.placeholder = args.placeholder;

        this.renderChanges = args.renderChanges;

        this.on('change', () => {
            if (this.renderChanges) {
                this.flash();
            }
        });
    }

    protected _updateText(value: string) {
        this.class.remove(pcuiClass.MULTIPLE_VALUES);

        if (this._text === value) return false;

        this._text = value;

        if (this._unsafe) {
            this._dom.innerHTML = value;
        } else {
            this._dom.textContent = value;
        }

        this.emit('change', value);

        return true;
    }

    /**
     * Gets / sets the text of the Label.
     */
    set text(value: string) {
        if (value === undefined || value === null) {
            value = '';
        }

        const changed = this._updateText(value);

        if (changed && this._binding) {
            this._binding.setValue(value);
        }
    }

    get text(): string {
        return this._text;
    }

    set value(value: string) {
        this.text = value;
    }

    get value(): string {
        return this.text;
    }

    /* eslint accessor-pairs: 0 */
    set values(values: Array<string>) {
        let different = false;
        const value = values[0];
        for (let i = 1; i < values.length; i++) {
            if (values[i] !== value) {
                different = true;
                break;
            }
        }

        if (different) {
            this._updateText('');
            this.class.add(pcuiClass.MULTIPLE_VALUES);
        } else {
            this._updateText(values[0]);
        }
    }

    set placeholder(value: string) {
        if (value) {
            this.dom.setAttribute('placeholder', value);
        } else {
            this.dom.removeAttribute('placeholder');
        }
    }

    get placeholder(): string {
        return this.dom.getAttribute('placeholder');
    }
}

Element.register('label', Label);

export default Label;
