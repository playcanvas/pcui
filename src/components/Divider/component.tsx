import { Element } from '../Element/component';
import type { ElementArgs } from '../Element/index';

import { Divider as DividerClass } from './index';

/**
 * Represents a vertical division between two elements
 */
class Divider extends Element<ElementArgs, object> {
    static ctor = DividerClass;
}

export { Divider };
