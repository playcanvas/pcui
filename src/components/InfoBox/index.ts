import { Container, ContainerArgs } from '../Container';
import { Element } from '../Element';

const CLASS_INFOBOX = 'pcui-infobox';

/**
 * The arguments for the {@link InfoBox} constructor.
 */
interface InfoBoxArgs extends ContainerArgs {
    /**
     * The CSS code for an icon for the {@link InfoBox}. e.g. 'E401' (notice we omit the '\\' character). Defaults to ''.
     * Useful icon values for InfoBox are:
     *
     * - 'E218' - warning
     * - 'E400' - info
     */
    icon?: string;
    /**
     * Sets the 'title' of the {@link InfoBox}. Defaults to ''.
     */
    title?: string;
    /**
     * Sets the 'text' of the {@link InfoBox}. Defaults to ''.
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
    protected _titleElement = new Element();

    protected _textElement = new Element();

    protected _unsafe: boolean;

    protected _icon: string;

    protected _title: string;

    protected _text: string;

    /**
     * Creates a new InfoBox.
     *
     * @param args - The arguments.
     */
    constructor(args: Readonly<InfoBoxArgs> = {}) {
        super(args);

        this.class.add(CLASS_INFOBOX);

        this.append(this._titleElement);
        this.append(this._textElement);

        this._unsafe = args.unsafe ?? false;
        this.icon = args.icon ?? '';
        this.title = args.title ?? '';
        this.text = args.text ?? '';
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

    /**
     * Gets the icon of the info box.
     */
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

    /**
     * Gets the title of the info box.
     */
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

    /**
     * Gets the text of the info box.
     */
    get text() {
        return this._text;
    }
}

Element.register('infobox', InfoBox);

export { InfoBox, InfoBoxArgs };
