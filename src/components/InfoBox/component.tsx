import * as React from 'react';
import { Element } from '../Element/component';
import { InfoBox as InfoBoxClass, InfoBoxArgs } from './index';

/**
 * Represents an information box.
 */
class InfoBox extends Element<InfoBoxArgs, any> {
    constructor(props: InfoBoxArgs) {
        super(props);
        this.elementClass = InfoBoxClass;
    }

    render() {
        // @ts-ignore
        return <span ref={this.attachElement} />;
    }
}

InfoBox.ctor = InfoBoxClass;

export { InfoBox };
