import Element from './index';
import BaseComponent from '../base-component';

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

Overlay.defaultProps = {};

export default Overlay;
