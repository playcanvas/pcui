import Element from '../Element/index';

const CLASS_BUTTON = 'pcui-button';

namespace Button {
    export interface Args extends Element.Args {
        /**
         * If unsafe is true, text will be set on the dom's innerHTML rather than textContent.
         */
        unsafe?: boolean;
        /**
         * Sets the text of the button.
         */
        text?: string,
        /**
         * The CSS code for an icon for the button. e.g. E401 (notice we omit the '\' character).
         */
        icon?: string,
        /**
         * Gets / sets the 'size' type of the button. Can be 'small'.
         */
        size?: 'small'
    }
}

/**
 * User input with click interaction.
 */
class Button extends Element {
    static readonly defaultArgs: Button.Args = {
        ...Element.defaultArgs,
        text: '',
        icon: '',
        unsafe: false,
        size: null,
        dom: 'button'
    };

    protected _unsafe: any;

    protected _domEventKeyDown: any;

    protected _text: any;

    protected _icon: any;

    protected _size: any;

    constructor(args: Button.Args = Button.defaultArgs) {
        args = { ...Button.defaultArgs, ...args };
        super(args.dom, args);

        this.class.add(CLASS_BUTTON);

        this._unsafe = args.unsafe;

        this.text = args.text;
        this.size = args.size;
        this.icon = args.icon;

        this._domEventKeyDown = this._onKeyDown.bind(this);
        this.dom.addEventListener('keydown', this._onKeyDown.bind(this));
    }

    // click on enter
    // blur on escape
    protected _onKeyDown(evt: any) {
        if (evt.keyCode === 27) {
            this.blur();
        } else if (evt.keyCode === 13) {
            this._onClick(evt);
        }
    }

    protected _onClick(evt: MouseEvent) {
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

    destroy() {
        if (this._destroyed) return;

        this.dom.removeEventListener('keydown', this._domEventKeyDown);
        super.destroy();
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

    get text() : string {
        return this._text;
    }

    /**
     * The CSS code for an icon for the button. e.g. E401 (notice we omit the '\' character).
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

    get icon() : string {
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

    get size() : string {
        return this._size;
    }
}

Element.register('button', Button);

export default Button;
