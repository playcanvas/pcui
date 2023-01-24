import Element from './index';
import { ElementArgs } from '../Element/index';
import BaseComponent from '../Element/component';

/**
 * Represents a vertical division between two elements
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
