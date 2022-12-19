import Element from './index';
import BaseElement from '../Element/index';
import BaseComponent from '../Element/component';

/**
 * Represents a vertical division between two elements
 */
class Component extends BaseComponent <BaseElementArgs, any> {
    constructor(props: BaseElementArgs) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

Component.ctor = Element;

export default Component;
