import Element from './index';
import ElementComponent, { ElementComponentProps } from '../Element/component';

interface ArrayInputProps extends ElementComponentProps {
    type?: string,
    fixedSize?: boolean,
    elementArgs?: object
}

class ArrayInput extends ElementComponent <ArrayInputProps, any> {
    constructor(props: ArrayInputProps) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

ArrayInput.ctor = Element;

export default ArrayInput;
