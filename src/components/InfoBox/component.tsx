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
        return <span ref={(ref: HTMLSpanElement) => this.attachElement(ref, null)} />;
    }
}

InfoBox.ctor = InfoBoxClass;

export { InfoBox };
