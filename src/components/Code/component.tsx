import Element, { CodeArgs } from './index';
import BaseComponent from '../Element/component';

/**
 * Represents a code block.
 */
class Component extends BaseComponent <CodeArgs, any> {
    static defaultProps: CodeArgs;

    constructor(props: CodeArgs) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

Component.ctor = Element;

export default Component;
