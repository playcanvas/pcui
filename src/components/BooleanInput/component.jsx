import Element from './index';
import ElementComponent from '../Element/component';

class BooleanInput extends ElementComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
}

BooleanInput.propTypes = {};

BooleanInput.defaultProps = {};

export default BooleanInput;