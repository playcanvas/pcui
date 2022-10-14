import React from 'react';
import Element from './index';
import ElementComponent, { ElementComponentProps, IFlexProps, IResizableProps, IParentProps } from '../Element/component';

interface PanelProps extends ElementComponentProps, IFlexProps, IResizableProps, IParentProps {
    headerText?: string,
    headerSize?: number,
    removable?: boolean
    collapseHorizontally?: boolean,
    collapsible?: boolean
}

class Panel extends ElementComponent <PanelProps, any> {
    nodeElement: any;
    containerElement: any;
    constructor(props: any) {
        super(props);
        this.elementClass = Element;
    }
    componentDidMount() {
        this.attachElement(this.nodeElement, this.containerElement);
    }
    render() {
        let elements: any = React.Children.toArray(this.props.children);

        if (elements.length === 1) {
            elements = React.cloneElement(elements[0], { parent: this.element })
        }
        else if (elements.length > 0) {
            elements = elements.map((element: any) => React.cloneElement(element, { parent: this.element }));
        }
        return <div ref={(nodeElement) => this.nodeElement = nodeElement}>
            <div ref={(containerElement) => this.containerElement = containerElement} >
                { elements }
            </div>
        </div>;
    }
}

Panel.ctor = Element;

export default Panel;
