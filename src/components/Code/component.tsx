import Element from './index';
import BaseComponent from '../Element/component';

/**
 * Represents a code block.
 */
class Component extends BaseComponent <ElementArgs, any> {
    static defaultProps: ElementArgs;

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
