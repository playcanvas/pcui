import Element from '../Element';
import Container, { ContainerArgs } from '../Container';
import Label from '../Label';

const CLASS_LABEL_GROUP = 'pcui-label-group';
const CLASS_LABEL_TOP = CLASS_LABEL_GROUP + '-align-top';

/**
 * The arguments for the {@link LabelGroup} constructor.
 */
export interface LabelGroupArgs extends ContainerArgs {
    /**
     * The label text. Defaults to 'Label'.
     */
    text?: string;
    /**
     * The {@link Element} to be wrapped by the label group.
     */
    field?: Element;
    /**
     * Whether to align the label at the top of the group. Defaults to `false` which aligns it at the center.
     */
    labelAlignTop?: boolean;
    /**
     * Add a native tooltip to the label.
     */
    nativeTooltip?: boolean;
}

/**
 * Represents a group of an {@link Element} and a {@link Label}. Useful for rows of labeled fields.
 */
class LabelGroup extends Container {
    protected _label: Label;

    protected _field: Element;

    /**
     * Creates a new LabelGroup.
     *
     * @param args - The arguments.
     */
    constructor(args: Readonly<LabelGroupArgs> = {}) {
        super(args);

        this.class.add(CLASS_LABEL_GROUP);

        this._label = new Label({
            text: args.text ?? 'Label',
            nativeTooltip: args.nativeTooltip
        });
        this.append(this._label);

        this._field = args.field ?? null;
        if (this._field) {
            this.append(this._field);
        }

        this.labelAlignTop = args.labelAlignTop;
    }

    /**
     * The label element.
     */
    get label() {
        return this._label;
    }

    /**
     * The field element.
     */
    get field() {
        return this._field;
    }

    /**
     * Sets the text of the label.
     */
    set text(value) {
        this._label.text = value;
    }

    /**
     * Gets the text of the label.
     */
    get text() {
        return this._label.text;
    }

    /**
     * Sets whether to align the label at the top of the group. Defaults to `false` which aligns it at the center.
     */
    set labelAlignTop(value) {
        if (value) {
            this.class.add(CLASS_LABEL_TOP);
        } else {
            this.class.remove(CLASS_LABEL_TOP);
        }
    }

    /**
     * Gets whether to align the label at the top of the group.
     */
    get labelAlignTop() {
        return this.class.contains(CLASS_LABEL_TOP);
    }
}

Element.register('labelgroup', LabelGroup);

export default LabelGroup;
