import { Element } from '../Element/component';
import { ElementArgs } from '../Element/index';

import { Divider as DividerClass } from './index';

/**
 * Represents a vertical division between two elements
 */
class Divider extends Element<ElementArgs, any> {
    constructor(props: ElementArgs) {
        super(props);
        this.elementClass = DividerClass;
    }

    render() {
        return super.render();
    }
}

Divider.ctor = DividerClass;

export { Divider };
