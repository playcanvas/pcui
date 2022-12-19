import Element, { DividerArgs } from './index';
import BaseComponent from '../Element/component';

/**
 * Represents a vertical division between two elements
 */
class Component extends BaseComponent <DividerArgs, any> {
    constructor(props: DividerArgs) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

Component.ctor = Element;

export default Component;
