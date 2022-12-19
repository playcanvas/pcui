import Element, { RadioButtonArgs } from './index';
import BaseComponent from '../Element/component';

/**
 * A radio button element.
 */
class Component extends BaseComponent <RadioButtonArgs, any> {
    constructor(props: RadioButtonArgs) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

Component.ctor = Element;

export default Component;
