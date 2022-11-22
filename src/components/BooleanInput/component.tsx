import Element from './index';
import BaseComponent from '../Element/component';

/**
 * A checkbox element.
 */
class Component extends BaseComponent <Element.Args, any> {
    constructor(props: Element.Args = Element.defaultArgs) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

Component.ctor = Element;

export default Component;
