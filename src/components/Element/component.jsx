import React from 'react';
import Element from './index';
import BaseComponent from '../base-component';

class ElementComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
    attachElement = (nodeElement, containerElement) => {
        if (!nodeElement) {
            nodeElement = document.createElement('div');
        }

        this.element = new this.elementClass(
            nodeElement,
            {
            ...this.props,
            container: containerElement,
            parent: undefined
        });
        if (this.onClick) {
            this.element.on('click', this.onClick);
        }
        if (this.onChange) {
            this.element.on('change', this.onChange);
        }
        if (this.props.parent) {
            this.element.parent = this.props.parent;
        }
    }
}

export default ElementComponent;
