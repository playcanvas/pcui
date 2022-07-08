import Element from './index';
import BaseComponent from '../BaseComponent/index.jsx';

class RadioButton extends BaseComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

RadioButton.ctor = Element;

export default RadioButton;
