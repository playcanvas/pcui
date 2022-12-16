import Element from './index';
import BaseComponent from '../Element/component';

/**
 * Represents a code block.
 */
class Component extends BaseComponent <Element.Args, any> {
    static defaultProps: Element.Args;

    constructor(props: Element.Args) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

Component.ctor = Element;

export default Component;
