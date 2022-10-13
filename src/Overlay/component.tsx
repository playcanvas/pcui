import Element from './index';
import ElementComponent, { ElementComponentProps } from '../Element/component';

interface OverlayProps extends ElementComponentProps {
    clickable?: boolean,
    transparent?: boolean
}

class Overlay extends ElementComponent <OverlayProps, any> {
    constructor(props: OverlayProps) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

Overlay.ctor = Element;

export default Overlay;
