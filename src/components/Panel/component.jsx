import React from 'react';
import Element from './index';
import BaseComponent from '../base-component';

class Panel extends BaseComponent {
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