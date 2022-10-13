import Element from './index';
import ElementComponent, { ElementComponentProps } from '../Element/component';

interface DividerProps extends ElementComponentProps {}

class Divider extends ElementComponent <DividerProps, any> {
    constructor(props: DividerProps) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

Divider.ctor = Element;

export default Divider;
