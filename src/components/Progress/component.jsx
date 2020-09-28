import Element from './index';
import ElementComponent from '../Element/component';

class Progress extends ElementComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
}

Progress.propTypes = {};

Progress.defaultProps = {};

export default Progress;