import Element, { VectorInputArgs } from './index';
import BaseComponent from '../Element/component';

/**
 * A vector input.
 */
class Component extends BaseComponent <VectorInputArgs, any> {
    constructor(props: VectorInputArgs) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

Component.ctor = Element;

export default Component;
