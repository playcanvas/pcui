import Element from '../Element/index';
import Container from '../Container';

const CLASS_INFOBOX = 'pcui-infobox';

namespace InfoBox {
    export interface Args extends Container.Args {
        /**
         * The CSS code for an icon for the info box. e.g. E401 (notice we omit the '\' character).
         */
        icon?: string;
        /**
         * Gets / sets the 'title' of the info box
         */
        title?: string;
        /**
         * Gets / sets the 'text' of the info box
         */
        text?: string;
        /**
         * If true then the innerHTML property will be used to set the title/text. Otherwise textContent will be used instead.
         */
        unsafe?: boolean;
    }
}

/**
 * Represents an information box.
 */
class InfoBox extends Container {

    static readonly defaultArgs: InfoBox.Args = {
        ...Container.defaultArgs,
        unsafe: false,
        icon: '',
        title: '',
        text: ''
    };

    protected _titleElement: Element;
    protected _textElement: Element;
    protected _unsafe: boolean;
    protected _icon: any;
    protected _title: any;
    protected _text: any;

    constructor(args: InfoBox.Args = InfoBox.defaultArgs) {
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
     * Sets the icon of the info box
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
     * Sets the title of the info box
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
     * Sets the text of the info box
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
