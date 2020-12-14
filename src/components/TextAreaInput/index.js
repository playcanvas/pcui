import './style.scss';
import TextInput from '../TextInput';

const CLASS_TEXT_AREA_INPUT = 'pcui-text-area-input';
const CLASS_TEXT_AREA_INPUT_RESIZABLE = CLASS_TEXT_AREA_INPUT + '-resizable';

/**
 * @name TextAreaInput
 * @classdesc The TextAreaInput wraps a textarea element. It has the same interface as pcui.TextInput.
 * @augments TextInput
 * @property {boolean} [resizable=false] Sets whether the size of the text area input can be modified by the user.
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
        if (args.resizable) {
            this.class.add(CLASS_TEXT_AREA_INPUT_RESIZABLE);
        }
    }

    _onInputKeyDown(evt) {
        if ((evt.keyCode === 27 && this.blurOnEscape) || (evt.keyCode === 13 && this.blurOnEnter && !evt.shiftKey)) {
            this._domInput.blur();
        }

        this.emit('keydown', evt);
    }
}

export default TextAreaInput;
