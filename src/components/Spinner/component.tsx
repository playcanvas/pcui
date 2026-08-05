import * as React from 'react';

import { Element } from '../Element/component';

import type { SpinnerArgs } from './index';
import { Spinner as SpinnerClass } from './index';

/**
 * Represents a spinning icon.
 */
class Spinner extends Element<SpinnerArgs, object> {
    static ctor = SpinnerClass;

    render() {
        return <svg ref={this.attachElement} />;
    }
}

export { Spinner };
