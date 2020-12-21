import './style.scss';
import Element from '../Element';
import TextInput from '../TextInput';

const CLASS_TEXT_AREA_INPUT = 'pcui-text-area-input';
const CLASS_TEXT_AREA_INPUT_RESIZABLE = CLASS_TEXT_AREA_INPUT + '-resizable';
const CLASS_TEXT_AREA_INPUT_RESIZABLE_NONE = CLASS_TEXT_AREA_INPUT_RESIZABLE + '-none';
const CLASS_TEXT_AREA_INPUT_RESIZABLE_BOTH = CLASS_TEXT_AREA_INPUT_RESIZABLE + '-both';
const CLASS_TEXT_AREA_INPUT_RESIZABLE_HORIZONTAL = CLASS_TEXT_AREA_INPUT_RESIZABLE + '-horizontal';
const CLASS_TEXT_AREA_INPUT_RESIZABLE_VERTICAL = CLASS_TEXT_AREA_INPUT_RESIZABLE + '-vertical';

/**
 * @name TextAreaInput
 * @classdesc The TextAreaInput wraps a textarea element. It has the same interface as pcui.TextInput.
 * @augments TextInput
 * @property {string} [resizable=none] Sets whether the size of the text area input can be modified by the user. Can be one of 'none', 'both', 'horizontal' or 'vertical'.
 */
class TextAreaInput extends TextInput {
    /**
     * Creates a new TextAreaInput.
     *
     * @param {object} args - The arguments. Extends the pcui.TextInput constructor arguments.
     */
    constructor(args) {
        args = Object.assign({
            input: document.createElement('textarea')
        }, args);

        super(args);

        this.class.add(CLASS_TEXT_AREA_INPUT);
        switch (args.resizable) {
            case 'both':
                this.class.add(CLASS_TEXT_AREA_INPUT_RESIZABLE_BOTH);
                break;
            case 'horizontal':
                this.class.add(CLASS_TEXT_AREA_INPUT_RESIZABLE_HORIZONTAL);
                break;
            case 'vertical':
                this.class.add(CLASS_TEXT_AREA_INPUT_RESIZABLE_VERTICAL);
                break;
            case 'none':
            default:
                this.class.add(CLASS_TEXT_AREA_INPUT_RESIZABLE_NONE);
                break;
        }
    }

    _onInputKeyDown(evt) {
        if ((evt.keyCode === 27 && this.blurOnEscape) || (evt.keyCode === 13 && this.blurOnEnter && !evt.shiftKey)) {
            this._domInput.blur();
        }

        this.emit('keydown', evt);
    }
}

Element.register('text', TextAreaInput, { renderChanges: true });

export default TextAreaInput;
