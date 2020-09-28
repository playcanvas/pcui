import Element from './index';
import ElementComponent from '../Element/component';

class NumericInput extends ElementComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
}

export default NumericInput;