import Element from './index';
import BaseComponent from '../BaseComponent/index.jsx';

class BooleanInput extends BaseComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

BooleanInput.ctor = Element;

export default BooleanInput;
