import React from 'react';
import Element from './index';
import BaseComponent from '../BaseComponent/index.jsx';

class Container extends BaseComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
    componentDidMount() {
        if (this.props.onResize) {
            this.element.on('resize', this.props.onResize);
        }
    }
    getParent = () => {
        console.log(this);
        return this;
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
Container.ctor = Element;
Container.defaultProps = {};

export default Container;
