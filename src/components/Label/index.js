import './style.scss';
import * as pcuiClass from '../../class';
import Element, { ElementArgs } from '../Element';

const CLASS_LABEL = 'pcui-label';

/**
 * @name LabelArgs
 * @class
 * @classdesc The class for all Label arguments extending ElementArgs.
 * @augments ElementArgs
 * @property {boolean} [unsafe] - If true then the innerHTML property will be used to set the text. Otherwise textContent will be used instead.
 * @property {boolean} [nativeTooltip] - If true then use the text of the label as the native HTML tooltip.
 * @property {boolean} [allowTextSelection] - If true then the label can be clicked to select text.
 * @property {string} [text] - The text of the Label.
 * @property {string} [value] - The text of the Label, used when `text` is not set.
 */
class LabelArgs extends ElementArgs {
}

/**
 * @name Label
 * @class
 * @classdesc The Label is a simple span element that displays some text.
 * @property {string} placeholder Gets / sets the placeholder label that appears on the right of the label.
 * @property {string} text Gets / sets the text of the Label.
 * @property {boolean} renderChanges If true then the Label will flash when its text changes.
 * @augments Element
 * @mixes IBindable
 * @param {LabelArgs} [args] - The arguments. Extends the pcui.Element constructor arguments. All settable properties can also be set through the constructor.
 */
class Label extends Element {
    /**
     * Creates a new Label.
     * 
     * @param {LabelArgs} [args] - The arguments. Extends the pcui.Element constructor arguments. All settable properties can also be set through the constructor.
     */
    constructor(args) {
        if (!args) args = {};

        super(args.dom ? args.dom : document.createElement('span'), args);

        this.class.add(CLASS_LABEL);

        this._unsafe = args.unsafe || false;
        this.text = args.text || args.value || '';

        if (args.allowTextSelection) {
            this.class.add(pcuiClass.DEFAULT_MOUSEDOWN);
        }

        if (args.nativeTooltip) {
            this.dom.title = this.text;
        }
        this.placeholder = args.placeholder || null;

        this.renderChanges = args.renderChanges || false;

        this.on('change', () => {
            if (this.renderChanges) {
                this.flash();
            }
        });
    }

    _updateText(value) {
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

    get text() {
        return this._text;
    }

    set text(value) {
        if (value === undefined || value === null) {
            value = '';
        }

        const changed = this._updateText(value);

        if (changed && this._binding) {
            this._binding.setValue(value);
        }
    }

    get value() {
        return this.text;
    }

    set value(value) {
        this.text = value;
    }

    /* eslint accessor-pairs: 0 */
    set values(values) {
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

    get placeholder() {
        return this.dom.getAttribute('placeholder');
    }

    set placeholder(value) {
        if (value) {
            this.dom.setAttribute('placeholder', value);
        } else {
            this.dom.removeAttribute('placeholder');
        }
    }
}

Element.register('label', Label);

export default Label;
