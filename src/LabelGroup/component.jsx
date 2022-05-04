import React, { Component } from 'react';
import Element from './index';

import Label from '../Label/component.jsx';

class LabelGroup extends Component {
    constructor(props) {
        super(props);
        this.element = new Element({...props });
    }

    render() {
        return <div className='pcui-label-group'>
            <Label text={this.props.text}/>
            { this.props.children }
        </div>;
    }
}

LabelGroup.propTypes = {};
LabelGroup.ctor = Element;
LabelGroup.defaultProps = {};

export default LabelGroup;
