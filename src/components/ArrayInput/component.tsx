import Element, { ArrayInputArgs } from './index';
import BaseComponent from '../Element/component';

/**
 * Element that allows editing an array of values.
 */
class Component extends BaseComponent <ArrayInputArgs, any> {
    constructor(props: ArrayInputArgs) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

Component.ctor = Element;

export default Component;
