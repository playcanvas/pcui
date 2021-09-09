import Element from './index';
import BaseComponent from '../BaseComponent/index.jsx';

class Overlay extends BaseComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

Overlay.propTypes = {};
Overlay.ctor = Element;
Overlay.defaultProps = {};

export default Overlay;
