import Element from '../Element/index';
import Container, { ContainerArgs } from '../Container';

const CLASS_INFOBOX = 'pcui-infobox';

/**
 * The arguments for the {@link InfoBox} constructor.
 */
export interface InfoBoxArgs extends ContainerArgs {
    /**
     * The CSS code for an icon for the {@link InfoBox}. e.g. 'E401' (notice we omit the '\\' character). Defaults to ''.
     * Useful icon values for InfoBox are:
     *
     * - 'E218' - warning
     * - 'E400' - info
     */
    icon?: string;
    /**
     * Gets / sets the 'title' of the {@link InfoBox}. Defaults to ''.
     */
    title?: string;
    /**
     * Gets / sets the 'text' of the {@link InfoBox}. Defaults to ''.
     */
    text?: string;
    /**
     * If `true`, the {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML innerHTML} property will be
     * used to set the text. Otherwise, {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent textContent}
     * will be used instead. Defaults to `false`.
     */
    unsafe?: boolean;
}

/**
 * Represents an information box.
 */
class InfoBox extends Container {
    static readonly defaultArgs: InfoBoxArgs = {
        ...Container.defaultArgs,
        unsafe: false,
        icon: '',
        title: '',
        text: ''
    };

    protected _titleElement: Element;

    protected _textElement: Element;

    protected _unsafe: boolean;

    protected _icon: string;

    protected _title: string;

    protected _text: string;

    constructor(args: InfoBoxArgs = InfoBox.defaultArgs) {
        args = { ...InfoBox.defaultArgs, ...args };
        super(args);

        this.class.add(CLASS_INFOBOX);
        this._titleElement = new Element(document.createElement('div'));
        this._textElement = new Element(document.createElement('div'));
        this.append(this._titleElement);
        this.append(this._textElement);

        this._unsafe = args.unsafe;

        this.icon = args.icon;
        this.title = args.title;
        this.text = args.text;
    }

    /**
     * Sets the icon of the info box.
     */
    set icon(value) {
        if (this._icon === value) return;
        this._icon = value;
        if (value) {
            // set data-icon attribute but first convert the value to a code point
            this.dom.setAttribute('data-icon', String.fromCodePoint(parseInt(value, 16)));
        } else {
            this.dom.removeAttribute('data-icon');
        }
    }

    get icon() {
        return this._icon;
    }

    /**
     * Sets the title of the info box.
     */
    set title(value) {
        if (this._title === value) return;
        this._title = value;
        if (this._unsafe) {
            this._titleElement.dom.innerHTML = value;
        } else {
            this._titleElement.dom.textContent = value;
        }
    }

    get title() {
        return this._title;
    }

    /**
     * Sets the text of the info box.
     */
    set text(value) {
        if (this._text === value) return;
        this._text = value;
        if (this._unsafe) {
            this._textElement.dom.innerHTML = value;
        } else {
            this._textElement.dom.textContent = value;
        }
    }

    get text() {
        return this._text;
    }
}

Element.register('infobox', InfoBox);

export default InfoBox;
