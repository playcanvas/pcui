import Element from './index';
import BaseComponent from '../Element/component';

/**
 * An overlay element.
 */
class Component extends BaseComponent <ElementArgs, any> {
    constructor(props: ElementArgs) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

Component.ctor = Element;

export default Component;
