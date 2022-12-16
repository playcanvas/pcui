import React from 'react';
import Element from './index';
import BaseComponent from '../Element/component';

/**
 * Represents an information box.
 */
class InfoBox extends BaseComponent <Element.Args, any> {
    constructor(props: Element.Args) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        // @ts-ignore
        return <span ref={this.attachElement} />;
    }
}

InfoBox.ctor = Element;

export default InfoBox;
