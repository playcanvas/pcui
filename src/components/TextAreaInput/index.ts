import Element from '../Element/index';
import TextInput from '../TextInput/index';

const CLASS_TEXT_AREA_INPUT = 'pcui-text-area-input';
const CLASS_TEXT_AREA_INPUT_RESIZABLE = CLASS_TEXT_AREA_INPUT + '-resizable';
const CLASS_TEXT_AREA_INPUT_RESIZABLE_NONE = CLASS_TEXT_AREA_INPUT_RESIZABLE + '-none';
const CLASS_TEXT_AREA_INPUT_RESIZABLE_BOTH = CLASS_TEXT_AREA_INPUT_RESIZABLE + '-both';
const CLASS_TEXT_AREA_INPUT_RESIZABLE_HORIZONTAL = CLASS_TEXT_AREA_INPUT_RESIZABLE + '-horizontal';
const CLASS_TEXT_AREA_INPUT_RESIZABLE_VERTICAL = CLASS_TEXT_AREA_INPUT_RESIZABLE + '-vertical';

namespace TextAreaInput {
    export interface Args extends TextInput.Args {
        /**
         * Sets which directions the text area can be resized in. One of 'both', 'horizontal', 'vertical' or 'none'. Defaults to none.
         */
        resizable?: 'horizontal' | 'vertical' | 'both' | 'none'
    }
}

/**
 * The TextAreaInput wraps a textarea element. It has the same interface as pcui.TextInput.
 */
class TextAreaInput extends TextInput {
    static readonly defaultArgs: TextAreaInput.Args = {
        ...TextInput.defaultArgs
    };

    constructor(args: TextAreaInput.Args = TextAreaInput.defaultArgs) {
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
        if ((evt.keyCode === 27 && this.blurOnEscape) || (evt.keyCode === 13 && this.blurOnEnter && !evt.shiftKey)) {
            this._domInput.blur();
        }

        this.emit('keydown', evt);
    }
}

Element.register('text', TextAreaInput, { renderChanges: true });

export default TextAreaInput;
