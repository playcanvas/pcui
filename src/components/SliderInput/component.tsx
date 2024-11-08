import { Element } from '../Element/component';

import { SliderInput as SliderInputClass, SliderInputArgs } from './index';

/**
 * The SliderInput shows a NumericInput and a slider widget next to it. It acts as a proxy of the
 * NumericInput.
 */
class SliderInput extends Element<SliderInputArgs, any> {
    constructor(props: SliderInputArgs) {
        super(props);
        this.elementClass = SliderInputClass;
    }

    render() {
        return super.render();
    }
}

SliderInput.ctor = SliderInputClass;

export { SliderInput };
