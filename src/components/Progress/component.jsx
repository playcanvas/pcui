import Element from './index';
import BaseComponent from '../base-component';

class Progress extends BaseComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
}

Progress.propTypes = {};

Progress.defaultProps = {};

export default Progress;