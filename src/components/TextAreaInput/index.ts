import Element from '../Element';
import TextInput, { TextInputArgs } from '../TextInput';

const CLASS_TEXT_AREA_INPUT = 'pcui-text-area-input';
const CLASS_TEXT_AREA_INPUT_RESIZABLE = CLASS_TEXT_AREA_INPUT + '-resizable';
const CLASS_TEXT_AREA_INPUT_RESIZABLE_NONE = CLASS_TEXT_AREA_INPUT_RESIZABLE + '-none';
const CLASS_TEXT_AREA_INPUT_RESIZABLE_BOTH = CLASS_TEXT_AREA_INPUT_RESIZABLE + '-both';
const CLASS_TEXT_AREA_INPUT_RESIZABLE_HORIZONTAL = CLASS_TEXT_AREA_INPUT_RESIZABLE + '-horizontal';
const CLASS_TEXT_AREA_INPUT_RESIZABLE_VERTICAL = CLASS_TEXT_AREA_INPUT_RESIZABLE + '-vertical';

/**
 * The arguments for the {@link TextAreaInput} constructor.
 */
export interface TextAreaInputArgs extends TextInputArgs {
    /**
     * Sets which directions the text area can be resized in. One of 'both', 'horizontal',
     * 'vertical' or 'none'. Defaults to 'none'.
     */
    resizable?: 'horizontal' | 'vertical' | 'both' | 'none'
}

/**
 * The TextAreaInput wraps a textarea element. It has the same interface as {@link TextInput}.
 */
class TextAreaInput extends TextInput {
    static readonly defaultArgs: TextAreaInputArgs = {
        ...TextInput.defaultArgs
    };

    constructor(args: TextAreaInputArgs = TextAreaInput.defaultArgs) {
        args = { ...TextAreaInput.defaultArgs, ...args };
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

    protected _onInputKeyDown(evt: KeyboardEvent) {
        if ((evt.key === 'Escape' && this.blurOnEscape) || (evt.key === 'Enter' && this.blurOnEnter && !evt.shiftKey)) {
            this._domInput.blur();
        }

        this.emit('keydown', evt);
    }
}

Element.register('text', TextAreaInput, { renderChanges: true });

export default TextAreaInput;
