import Element, { LabelGroupArgs } from './index';
import BaseComponent from '../Element/component';

/**
 * Represents a group of a Label and a Element. Useful for rows of labeled fields.
 */
class LabelGroup extends BaseComponent <LabelGroupArgs, any> {
    constructor(props: LabelGroupArgs) {
        super(props);
        // @ts-ignore
        this.elementClass = Element;
    }

    attachElement = (nodeElement: HTMLElement, containerElement: any) => {
        if (!nodeElement) return;
        if (Array.isArray(this.props.children) || !this.props.children) {
            throw new Error('A LabelGroup must contain a single child react component');
        }
        const labelFieldChild = (this.props.children as { type: any, props: any });
        const labelField = new labelFieldChild.type.ctor(labelFieldChild.props);
        if (labelFieldChild.props.link) {
            labelField.link(labelFieldChild.props.link.observer, labelFieldChild.props.link.path);
        }
        this.element = new this.elementClass({
            ...this.props,
            dom: nodeElement,
            container: containerElement,
            parent: undefined,
            field: labelField
        });
    };

    render() {
        return super.render();
    }
}

LabelGroup.ctor = Element;

export default LabelGroup;
