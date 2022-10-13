import Element from './index';
import ElementComponent, { ElementComponentProps } from '../Element/component';

interface VectorInputProps extends ElementComponentProps {
    dimensions?: 2 | 3 | 4,
    min?: number,
    max?: number,
    precision?: number,
    step?: number,
    renderChanges?: boolean,
    placeholder?: Array<string> | string,
    value?: any
}

class VectorInput extends ElementComponent <VectorInputProps, any> {
    static defaultProps: VectorInputProps;

    constructor(props: VectorInputProps) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

VectorInput.ctor = Element;
VectorInput.defaultProps = {};

export default VectorInput;
