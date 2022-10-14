import Element from './index';
import ElementComponent, { ElementComponentProps } from '../Element/component';

interface RadioButtonProps extends ElementComponentProps {
    renderChanges?: boolean
}

class RadioButton extends ElementComponent <RadioButtonProps, any> {
    constructor(props: RadioButtonProps) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

RadioButton.ctor = Element;

export default RadioButton;
