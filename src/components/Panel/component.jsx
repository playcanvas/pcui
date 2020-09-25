import React, { useEffect } from 'react';
import Element from './index';
import PropTypes from 'prop-types';
import ElementComponent from '../Element/component';

class Panel extends ElementComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
    componentDidMount() {
        this.attachElement(this.nodeElement, this.containerElement);
    }
    render() {
        let elements = React.Children.toArray(this.props.children);

        if (elements.length === 1) {
            elements = React.cloneElement(elements[0], { parent: this.element })
        }
        else if (elements.length > 0) {
            elements = elements.map(element => React.cloneElement(element, { parent: this.element }));
        }
        return <div ref={(nodeElement) => this.nodeElement = nodeElement}>
            <div ref={(containerElement) => this.containerElement = containerElement} >
                { elements }
            </div>
        </div>;
    }
}

Panel.propTypes = {};

Panel.defaultProps = {};

export default Panel;