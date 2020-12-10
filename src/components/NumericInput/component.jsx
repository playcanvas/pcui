import Element from './index';
import BaseComponent from '../base-component';

class NumericInput extends BaseComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
}

export default NumericInput;