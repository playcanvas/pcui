import React from 'react';
import Element from './index';

import BaseComponent from '../base-component';

class LabelGroup extends BaseComponent {
    constructor(props) {
        super(props);
        const child = props.children;
        const created = new child.type.ctor(child.props);
        this.element = new Element({...props, field: created});
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