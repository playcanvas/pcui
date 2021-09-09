import Element from './index';
import BaseComponent from '../BaseComponent/index.jsx';

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
SliderInput.ctor = Element;
SliderInput.defaultProps = {};

export default SliderInput;
