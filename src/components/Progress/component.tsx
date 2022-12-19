import Element, { ProgressArgs } from './index';
import BaseComponent from '../Element/component';

/**
 * Represents a bar that can highlight progress of an activity.
 */
class Component extends BaseComponent <ProgressArgs, any> {
    constructor(props: ProgressArgs) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

Component.ctor = Element;

export default Component;
