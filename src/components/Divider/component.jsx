import Element from './index';
import BaseComponent from '../base-component';

class Divider extends BaseComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
}

Divider.propTypes = {};

Divider.defaultProps = {};

export default Divider;