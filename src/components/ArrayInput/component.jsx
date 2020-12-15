import Element from './index';
import BaseComponent from '../base-component';

class ArrayInput extends BaseComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

ArrayInput.propTypes = {};

ArrayInput.defaultProps = {};

export default ArrayInput;
