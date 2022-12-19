import Element, { SliderInputArgs } from './index';
import BaseComponent from '../Element/component';

/**
 * The SliderInput shows a pcui.NumericInput and a slider widget next to it. It acts as a proxy
 * of the NumericInput.
 */
class Component extends BaseComponent <SliderInputArgs, any> {
    constructor(props: SliderInputArgs) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

Component.ctor = Element;

export default Component;
