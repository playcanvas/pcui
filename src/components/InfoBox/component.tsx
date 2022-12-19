import React from 'react';
import Element, { InfoBoxArgs } from './index';
import BaseComponent from '../Element/component';

/**
 * Represents an information box.
 */
class InfoBox extends BaseComponent <InfoBoxArgs, any> {
    constructor(props: InfoBoxArgs) {
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
