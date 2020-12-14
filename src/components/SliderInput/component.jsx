import Element from './index';
import BaseComponent from '../base-component';

class SliderInput extends BaseComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

SliderInput.propTypes = {};

SliderInput.defaultProps = {};

export default SliderInput;
