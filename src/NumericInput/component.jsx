import Element from './index';
import BaseComponent from '../BaseComponent/index.jsx';

class NumericInput extends BaseComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

NumericInput.ctor = Element;

export default NumericInput;
