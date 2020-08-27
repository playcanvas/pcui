import Element from './index';
import PropTypes from 'prop-types';
import ElementComponent from '../Element/component';

class SelectInput extends ElementComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
}

SelectInput.propTypes = {};

SelectInput.defaultProps = {
    options: [
        {
            v: 'Foo',
            t: 'Foo'
        },
        {
            v: 'Bar',
            t: 'Bar'
        },
    ]
};

export default SelectInput;