import Element from './index';
import BaseComponent from '../base-component';

class Divider extends BaseComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

Divider.propTypes = {};
Divider.ctor = Element;
Divider.defaultProps = {};

export default Divider;
