import Element from './index';
import BaseComponent from '../base-component';

class SliderInput extends BaseComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
}

SliderInput.propTypes = {};

SliderInput.defaultProps = {};

export default SliderInput;