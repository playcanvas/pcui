import Element from './index';
import BaseComponent from '../BaseComponent/index.jsx';

class VectorInput extends BaseComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

VectorInput.propTypes = {};
VectorInput.ctor = Element;
VectorInput.defaultProps = {};

export default VectorInput;
