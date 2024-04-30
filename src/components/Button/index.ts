import Element, { ElementArgs } from '../Element';

const CLASS_BUTTON = 'pcui-button';

/**
 * The arguments for the {@link Button} constructor.
 */
export interface ButtonArgs extends ElementArgs {
    /**
     * If `true`, the {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML innerHTML} property will be
     * used to set the text. Otherwise, {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent textContent}
     * will be used instead. Defaults to `false`.
     */
    unsafe?: boolean;
    /**
     * Sets the text of the button. Defaults to ''.
     */
    text?: string,
    /**
     * The CSS code for an icon for the button. e.g. 'E401' (notice we omit the '\\' character). Defaults to ''.
     */
    icon?: string,
    /**
     * Sets the 'size' type of the button. Can be 'small' or `null`. Defaults to `null`.
     */
    size?: 'small'
}

/**
 * User input with click interaction.
 */
class Button extends Element {
    protected _unsafe: boolean;

    protected _text: string;

    protected _icon: string;

    protected _size: string | null;

    /**
     * Creates a new Button.
     *
     * @param args - The arguments.
     */
    constructor(args: Readonly<ButtonArgs> = {}) {
        super({ dom: 'button', ...args });

        this.class.add(CLASS_BUTTON);

        this._unsafe = args.unsafe;

        this.text = args.text;
        this.size = args.size;
        this.icon = args.icon;

        this.dom.addEventListener('keydown', this._onKeyDown);
    }

    destroy() {
        if (this._destroyed) return;

        this.dom.removeEventListener('keydown', this._onKeyDown);

        super.destroy();
    }

    protected _onKeyDown = (evt: KeyboardEvent) => {
        if (evt.key === 'Escape') {
            this.blur();
        } else if (evt.key === 'Enter') {
            this._onClick(evt);
        }
    };

    protected _onClick(evt: Event) {
        this.blur();
        if (this.readOnly) return;

        super._onClick(evt);
    }

    focus() {
        this.dom.focus();
    }

    blur() {
        this.dom.blur();
    }

    /**
     * Gets / sets the text of the button.
     */
    set text(value: string) {
        if (this._text === value) return;
        this._text = value;
        if (this._unsafe) {
            this.dom.innerHTML = value;
        } else {
            this.dom.textContent = value;
        }
    }

    get text(): string {
        return this._text;
    }

    /**
     * The CSS code for an icon for the button. e.g. 'E401' (notice we omit the '\\' character).
     */
    set icon(value: string) {
        if (this._icon === value || !value.match(/^E[0-9]{0,4}$/)) return;
        this._icon = value;
        if (value) {
            // set data-icon attribute but first convert the value to a code point
            this.dom.setAttribute('data-icon', String.fromCodePoint(parseInt(value, 16)));
        } else {
            this.dom.removeAttribute('data-icon');
        }
    }

    get icon(): string {
        return this._icon;
    }

    /**
     * Gets / sets the 'size' type of the button. Can be null or 'small'.
     */
    set size(value: string) {
        if (this._size === value) return;
        if (this._size) {
            this.class.remove('pcui-' + this._size);
            this._size = null;
        }

        this._size = value;

        if (this._size) {
            this.class.add('pcui-' + this._size);
        }
    }

    get size(): string {
        return this._size;
    }
}

Element.register('button', Button);

export default Button;
