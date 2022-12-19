import Element, { OverlayArgs } from './index';
import BaseComponent from '../Element/component';

/**
 * An overlay element.
 */
class Component extends BaseComponent <OverlayArgs, any> {
    constructor(props: OverlayArgs) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

Component.ctor = Element;

export default Component;
