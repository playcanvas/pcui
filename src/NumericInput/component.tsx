import Element from './index';
import ElementComponent from '../Element/component';
import { TextInputProps } from '../TextInput/component';

interface NumericInputProps extends TextInputProps {
    min?: number,
    max?: number,
    precision?: number,
    step?: number,
    hideSlider?: number,
    allowNull?: number,
    value?: number | string
}

class NumericInput extends ElementComponent <NumericInputProps, any> {
    onValidate: (value: string) => boolean;

    constructor(props: NumericInputProps) {
        super(props);
        this.elementClass = Element;

        if (props.onValidate) {
            this.onValidate = props.onValidate;
        }

        this.onAttach = this.onAttachFn.bind(this);
    }

    onAttachFn() {
        if (this.onValidate) {
            this.element.onValidate = this.onValidate;
        }
    }

    render() {
        return super.render();
    }
}

NumericInput.ctor = Element;

export default NumericInput;
