import React, { Component } from 'react';
import Element from './index';

import Label from '../Label/component';
import { IParentProps } from '../Element/component';

interface LabelGroupProps extends IParentProps {
    text?: string,
    labelAlignTop?: boolean,
    nativeTooltip?: boolean
}

class LabelGroup extends Component <LabelGroupProps, any> {
    static ctor: any;
    element: Element;
    constructor(props: LabelGroupProps) {
        super(props);
        // @ts-ignore
        this.element = new Element({ ...props });
    }

    render() {
        return <div className='pcui-label-group'>
            <Label text={this.props.text}/>
            { this.props.children }
        </div>;
    }
}

LabelGroup.ctor = Element;

export default LabelGroup;
