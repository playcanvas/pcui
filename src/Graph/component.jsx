import Element from './index';
import ElementComponent from '../Element/componentx';

class ButtonComponent extends ElementComponent {
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
