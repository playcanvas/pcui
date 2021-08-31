import Element from './index';
import BaseComponent from '../BaseComponent/index.jsx';

class ButtonComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.element = new Element(props);
    }

    render() {
        return super.render();
    }
}

ButtonComponent.propTypes = {};

ButtonComponent.defaultProps = {
};

export default ButtonComponent;
