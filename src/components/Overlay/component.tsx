import { Element } from '../Element/component';
import { Overlay as OverlayClass, OverlayArgs } from './index';

/**
 * An overlay element.
 */
class Overlay extends Element<OverlayArgs, any> {
    constructor(props: OverlayArgs) {
        super(props);
        this.elementClass = OverlayClass;
    }

    render() {
        return super.render();
    }
}

Overlay.ctor = OverlayClass;

export { Overlay };
