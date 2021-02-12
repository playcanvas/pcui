import Element from './index';
import BaseComponent from '../base-component';

class Progress extends BaseComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

Progress.propTypes = {};
Progress.ctor = Element;
Progress.defaultProps = {};

export default Progress;
