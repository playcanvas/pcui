import React from 'react';
import Element from './index';
import BaseComponent from '../Element/component';

/**
 * Represents an information box.
 */
class InfoBox extends BaseComponent <ElementArgs, any> {
    constructor(props: ElementArgs) {
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
