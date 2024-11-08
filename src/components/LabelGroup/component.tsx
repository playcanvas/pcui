import { JSXElementConstructor, ReactElement } from 'react';

import { Element } from '../Element/component';

import { LabelGroup as LabelGroupClass, LabelGroupArgs } from './index';

/**
 * Represents a group of a Label and a Element. Useful for rows of labeled fields.
 */
class LabelGroup extends Element<LabelGroupArgs, any> {
    constructor(props: LabelGroupArgs) {
        super(props);
        this.elementClass = LabelGroupClass;
    }

    attachElement = (nodeElement: HTMLElement, containerElement: any) => {
        if (!nodeElement) return;
        const childrenErrorMessage = 'A LabelGroup must contain a single PCUI react component as a child';
        // check that the LabelGroup has a single child
        if (Array.isArray(this.props.children) || !this.props.children) {
            throw new Error(childrenErrorMessage);
        }
        // casting child as a single ReactElement as we have confirmed it is above
        const child = this.props.children as ReactElement;
        const fieldProps = child.props as Record<any, any>;
        // check if the ReactElement contains an instance of an Element as its type, confirming it is a PCUI react component
        if (!((child.type as JSXElementConstructor<any>).prototype instanceof Element)) {
            throw new Error(childrenErrorMessage);
        }
        // it's safe to cast the ReactElement type as a BaseComponent as we have confirmed it is an Element above
        const fieldClass = (child.type as typeof Element).ctor;
        const labelField = new fieldClass({ ...fieldProps });
        if (child.props.link) {
            labelField.link(fieldProps.link.observer, fieldProps.link.path);
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

LabelGroup.ctor = LabelGroupClass;

export { LabelGroup };
