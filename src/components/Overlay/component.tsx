import { Element } from '../Element/component';

import { Overlay as OverlayClass, OverlayArgs } from './index';

/**
 * An overlay element.
 */
class Overlay extends Element<OverlayArgs, any> {
    static ctor = OverlayClass;

    constructor(props: OverlayArgs) {
        super(props);
        this.elementClass = OverlayClass;
    }
}

export { Overlay };
