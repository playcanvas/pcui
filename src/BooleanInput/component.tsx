import Element from './index';
import ElementComponent, { ElementComponentProps } from '../Element/component';

interface BooleanInputProps extends ElementComponentProps {
    type?: 'toggle' | null,
    renderChanges?: boolean,
    value?: boolean
}

class BooleanInput extends ElementComponent <BooleanInputProps, any> {
    constructor(props: BooleanInputProps) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

BooleanInput.ctor = Element;

export default BooleanInput;
