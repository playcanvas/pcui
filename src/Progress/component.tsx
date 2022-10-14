import Element from './index';
import ElementComponent, { ElementComponentProps } from '../Element/component';

interface ProgressProps extends ElementComponentProps {
    value?: number
}

class Progress extends ElementComponent <ElementComponentProps, any> {
    constructor(props: ProgressProps) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

Progress.ctor = Element;

export default Progress;
