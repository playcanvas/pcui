import React from 'react';
import Element from './index';

import BaseComponent from '../base-component';

class LabelGroup extends BaseComponent {
    constructor(props) {
        super(props);
        const child = props.children;
        this.childElement = new child.type.ctor(child.props);
        this.element = new Element({...props, field: this.childElement});
        if (child.props.link) {
            this.childLink = child.props.link;
        }
    }

    componentDidMount() {
        if (this.childLink) {
            this.childElement.link(this.childLink.observer, this.childLink.path);
        }
    }

    render() {
        return <div ref={(nodeElement) => {nodeElement && nodeElement.appendChild(this.element.dom)}} />
    }
}

LabelGroup.propTypes = {};
LabelGroup.ctor = Element;
LabelGroup.defaultProps = {
};

export default LabelGroup;