import Element from './index';
import BaseComponent from '../base-component';

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

VectorInput.defaultProps = {};

export default VectorInput;
