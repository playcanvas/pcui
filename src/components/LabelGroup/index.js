import Label from '../Label';
import Container from '../Container';
import './style.scss';

const CLASS_LABEL_GROUP = 'pcui-label-group';
const CLASS_LABEL_TOP = CLASS_LABEL_GROUP + '-align-top';

/**
 * @name LabelGroup
 * @classdesc Represents a group of a pcui.Label and a pcui.Element. Useful for rows of labeled fields.
 * @augments Container
 * @property {string} text Gets / sets the label text.
 * @property {Element} field Gets the field. This can only be set through the constructor by passing it in the arguments.
 * @property {Element} label Gets the label element.
 * @property {boolean} labelAlignTop Whether to align the label at the top of the group. Defaults to false which aligns it at the center.
 */
class LabelGroup extends Container {
    /**
     * Creates a new LabelGroup.
     *
     * @param {object} args - The arguments. Extends the pcui.Element arguments. Any settable property can also be set through the constructor.
     * @param {boolean} [args.nativeTooltip] - If true then use the text as the HTML tooltip of the label.
     */
    constructor(args) {
        if (!args) args = {};

        super(args);

        this.class.add(CLASS_LABEL_GROUP);

        this._label = new Label({
            text: args.text || 'Label',
            nativeTooltip: args.nativeTooltip
        });
        this.append(this._label);

        this._field = args.field;
        if (this._field) {
            this.append(this._field);
        }

        this.labelAlignTop = args.labelAlignTop || false;
    }

    get label() {
        return this._label;
    }

    get field() {
        return this._field;
    }

    get text() {
        return this._label.text;
    }

    set text(value) {
        this._label.text = value;
    }

    get labelAlignTop() {
        return this.class.contains(CLASS_LABEL_TOP);
    }

    set labelAlignTop(value) {
        if (value) {
            this.class.add(CLASS_LABEL_TOP);
        } else {
            this.class.remove(CLASS_LABEL_TOP);
        }
    }
}

export default LabelGroup;
