import Element from './index';
import PropTypes from 'prop-types';
import ElementComponent from '../Element/component';

class InfoBox extends ElementComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
}

InfoBox.propTypes = {};

InfoBox.defaultProps = {
    icon: 'E401',
    title: 'Hello World',
    text: 'foobar'
};

export default InfoBox;