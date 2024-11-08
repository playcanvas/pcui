import { Container, ContainerArgs } from '../Container';
import { Element } from '../Element';
import { Label } from '../Label';

const CLASS_ROOT = 'pcui-code';
const CLASS_INNER = `${CLASS_ROOT}-inner`;

/**
 * The arguments for the {@link Code} constructor.
 */
interface CodeArgs extends ContainerArgs {
    /**
     * Sets the text to display in the code block.
     */
    text?: string
}

/**
 * Represents a code block.
 */
class Code extends Container {
    protected _inner: Label;

    protected _text: string;

    /**
     * Creates a new Code.
     *
     * @param args - The arguments.
     */
    constructor(args: Readonly<CodeArgs> = {}) {
        super(args);

        this.class.add(CLASS_ROOT);

        this._inner = new Label({
            class: CLASS_INNER
        });
        this.append(this._inner);

        if (args.text) {
            this.text = args.text;
        }
    }

    /**
     * Sets the text to display in the code block.
     */
    set text(value) {
        this._text = value;
        this._inner.text = value;
    }

    /**
     * Gets the text to display in the code block.
     */
    get text() {
        return this._text;
    }
}

Element.register('code', Code);

export { Code, CodeArgs };
