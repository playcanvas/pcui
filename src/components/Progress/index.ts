import Element from '../Element';
import Container, { ContainerArgs } from '../Container';

const CLASS_ROOT = 'pcui-progress';
const CLASS_INNER = CLASS_ROOT + '-inner';

/**
 * The arguments for the {@link Progress} constructor.
 */
export interface ProgressArgs extends ContainerArgs {
    /**
     * Sets the value of the progress bar (between 0 and 100).
     */
    value?: number
}

/**
 * Represents a bar that can highlight progress of an activity.
 */
class Progress extends Container {
    protected _inner = new Element({
        class: CLASS_INNER
    });

    protected _value: number;

    constructor(args: Readonly<ProgressArgs> = {}) {
        super(args);
        this.class.add(CLASS_ROOT);

        this.append(this._inner);

        if (args.value !== undefined) {
            this.value = args.value;
        }
    }

    /**
     * Gets / sets the value of the progress bar (between 0 and 100).
     */
    set value(val) {
        if (this._value === val) return;

        this._value = val;
        this._inner.width = `${this._value}%`;
        this.emit('change', val);
    }

    get value() {
        return this._value;
    }
}

Element.register('progress', Progress);

export default Progress;
