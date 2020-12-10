import Element from './index';
import BaseComponent from '../base-component';

class SelectInput extends BaseComponent {
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