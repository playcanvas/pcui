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
            throw 'A LabelGroup must contain a single child react component';
        }
        this.element = new this.elementClass({
            ...this.elementClass.defaultArgs,
            ...this.props,
            dom: nodeElement,
            container: containerElement,
            parent: undefined,
            // @ts-ignore
            field: new this.props.children.type.ctor(this.props.children.props)
        });
    };

    render() {
        return super.render();
    }
}

LabelGroup.ctor = Element;

export default LabelGroup;
