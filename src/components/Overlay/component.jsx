import Element from './index';
import ElementComponent from '../Element/component';

class Overlay extends ElementComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
}

Overlay.propTypes = {};

Overlay.defaultProps = {};

export default Overlay;