import Element, { BooleanInputArgs } from './index';
import BaseComponent from '../Element/component';

/**
 * A checkbox element.
 */
class Component extends BaseComponent <BooleanInputArgs, any> {
    constructor(props: BooleanInputArgs = Element.defaultArgs) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

Component.ctor = Element;

export default Component;
