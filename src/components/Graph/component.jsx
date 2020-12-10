import Element from './index';
import BaseComponent from '../base-component';

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
