import React from 'react';
import Element from './index';
import PropTypes from 'prop-types';
import ElementComponent from '../Element/component';

class Container extends ElementComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
    render() {
        let elements = React.Children.toArray(this.props.children);

        if (elements.length === 1) {
            elements = React.cloneElement(elements[0], { parent: this.element })
        }
        else if (elements.length > 0) {
            elements = elements.map(element => React.cloneElement(element, { parent: this.element }));
        }
        return <div ref={this.attachElement}>
            { elements }
        </div>
    }
}

Container.propTypes = {};

Container.defaultProps = {};

export default Container;