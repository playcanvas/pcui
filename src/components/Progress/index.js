import './style.scss';
import Element from '../Element';
import Container from '../Container';

const CLASS_ROOT = 'pcui-progress';
const CLASS_INNER = CLASS_ROOT + '-inner';
/**
 * @name Progress
 * @class
 * @classdesc Represents a bar that can highlight progress of an activity.
 * @augments Container
 * @property {number} value Gets / sets the value of the progress bar (between 0 and 100).
 */
class Progress extends Container {
    constructor(args) {
        if (!args) args = {};
        super(args);
        this.class.add(CLASS_ROOT);

        this._inner = new Element();
        this.append(this._inner);
        this._inner.class.add(CLASS_INNER);

        if (args.value !== undefined) {
            this.value = args.value;
        }
    }

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
