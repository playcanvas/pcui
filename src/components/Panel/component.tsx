import React from 'react';
import Element from './index';
import BaseComponent from '../Element/component';

/**
 * The Panel is a pcui.Container that itself contains a header container and a content container. The
 * respective pcui.Container functions work using the content container. One can also append elements to the header of the Panel.
 */
class Component extends BaseComponent <Element.Args, any> {
    nodeElement: any;

    containerElement: any;

    constructor(props: Element.Args = Element.defaultArgs) {
        super(props);
        this.elementClass = Element;
    }

    componentDidMount() {
        this.attachElement(this.nodeElement, this.containerElement);
    }

    render() {
        return <div ref={(nodeElement) => {
            this.nodeElement = nodeElement;
        }}>
            <div ref={(containerElement) => {
                this.containerElement = containerElement;
            }} >
            </div>
        </div>;
    }
}

Component.ctor = Element;

export default Component;
