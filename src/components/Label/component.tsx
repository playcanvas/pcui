import * as React from 'react';

import { Element } from '../Element/component';

import type { LabelArgs } from './index';
import { Label as LabelClass } from './index';

/**
 * The Label is a simple span element that displays some text.
 */
class Label extends Element<LabelArgs, object> {
    static ctor = LabelClass;

    render() {
        return <span ref={this.attachElement} />;
    }
}

export { Label };
