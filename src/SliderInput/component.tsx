import Element from './index';
import ElementComponent, { ElementComponentProps, IFlexProps } from '../Element/component';

interface SliderInputProps extends ElementComponentProps, IFlexProps {
    min?: number,
    max?: number,
    sliderMin?: number,
    sliderMax?: number,
    pre?: number,
    precision?: number,
    step?: number,
    allowNull?: boolean,
    value?: number
}

class SliderInput extends ElementComponent <SliderInputProps, any> {
    constructor(props: SliderInputProps) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

SliderInput.ctor = Element;

export default SliderInput;
