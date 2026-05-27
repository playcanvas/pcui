import * as React from 'react';

import { Element } from '../Element/component';

import { InfoBox as InfoBoxClass, InfoBoxArgs } from './index';

/**
 * Represents an information box.
 */
class InfoBox extends Element<InfoBoxArgs, any> {
    static ctor = InfoBoxClass;

    render() {
        // @ts-expect-error
        return <span ref={this.attachElement} />;
    }
}

export { InfoBox };
