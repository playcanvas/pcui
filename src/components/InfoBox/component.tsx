import * as React from 'react';

import { Element } from '../Element/component';

import type { InfoBoxArgs } from './index';
import { InfoBox as InfoBoxClass } from './index';

/**
 * Represents an information box.
 */
class InfoBox extends Element<InfoBoxArgs, object> {
    static ctor = InfoBoxClass;

    render() {
        return <span ref={this.attachElement} />;
    }
}

export { InfoBox };
