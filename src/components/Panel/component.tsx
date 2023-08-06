import * as React from 'react';
import Element, { PanelArgs } from './index';
import BaseComponent from '../Element/component';

/**
 * The Panel is a Container that itself contains a header container and a content container. The
 * respective Container functions work using the content container. One can also append elements to
 * the header of the Panel.
 */
class Component extends BaseComponent <PanelArgs, any> {
    nodeElement: any;

    containerElement: any;

    constructor(props: PanelArgs = {}) {
        super(props);
        this.elementClass = Element;
    }

    componentDidMount() {
        this.attachElement(this.nodeElement, this.containerElement);
    }

    render() {
        let elements: any = React.Children.toArray(this.props.children);

        if (elements.length === 1) {
            elements = React.cloneElement(elements[0], { parent: this.element });
        } else if (elements.length > 0) {
            elements = elements.map((element: any) => React.cloneElement(element, { parent: this.element }));
        }
        return <div ref={(nodeElement) => {
            this.nodeElement = nodeElement;
        }}>
            <div ref={(containerElement) => {
                this.containerElement = containerElement;
            }} >
                {elements}
            </div>
        </div>;
    }
}

Component.ctor = Element;

export default Component;
