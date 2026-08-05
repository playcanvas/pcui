import { Element } from '../Element/component';

import type { OverlayArgs } from './index';
import { Overlay as OverlayClass } from './index';

/**
 * An overlay element.
 */
class Overlay extends Element<OverlayArgs, object> {
    static ctor = OverlayClass;
}

export { Overlay };
