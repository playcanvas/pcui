import Element from '../Element';
import Container from '../Container';

const CLASS_INFOBOX = 'pcui-infobox';

/**
 * @name InfoBox
 * @class
 * @classdesc Represents an information box.
 * @augments Container
 * @property {string} icon=E401 The CSS code for an icon for the info box. e.g. E401 (notice we omit the '\' character).
 * @property {string} title=Title Gets / sets the 'title' of the info box
 * @property {string} text=Text Gets / sets the 'text' of the info box
 */
class InfoBox extends Container {
    /**
     * Creates a new InfoBox.
     *
     * @param {object} args - The arguments. Extends the pcui.Container constructor arguments. All settable properties can also be set through the constructor.
     * @param {boolean} [args.unsafe] - If true then the innerHTML property will be used to set the title/text. Otherwise textContent will be used instead.
     */
    constructor(args) {
        if (!args) args = {};
        super(args);

        this.class.add(CLASS_INFOBOX);
        this._titleElement = new Element();
        this._textElement = new Element();
        this.append(this._titleElement);
        this.append(this._textElement);

        this._unsafe = args.unsafe || false;

        this.icon = args.icon || '';
        this.title = args.title || '';
        this.text = args.text || '';
    }

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
