import Element from './index';
import ElementComponent from '../Element/component';

class SliderInput extends ElementComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
}

SliderInput.propTypes = {};

SliderInput.defaultProps = {};

export default SliderInput;