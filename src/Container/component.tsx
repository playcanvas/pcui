import React from 'react';
import Element from './index';
import ElementComponent, { ElementComponentProps, IFlexProps, IParentProps, IResizableProps } from '../Element/component';

interface ContainerProps extends ElementComponentProps, IFlexProps, IParentProps, IResizableProps {}

class Container extends ElementComponent <ContainerProps, any>{
    constructor(props: any) {
        super(props);
        this.elementClass = Element;
    }
    componentDidMount() {
        if (this.props.onResize) {
            this.element.on('resize', this.props.onResize);
        }
    }
    getParent = () => {
        return this;
    }
    render() {
        let elements: any = React.Children.toArray(this.props.children);

        if (elements.length === 1) {
            elements = React.cloneElement(elements[0], { parent: this.element })
        }
        else if (elements.length > 0) {
            elements = elements.map((element: any) => React.cloneElement(element, { parent: this.element }));
        }
        // @ts-ignore
        return <div ref={this.attachElement}>
            { elements }
        </div>
    }
}

Container.ctor = Element;

export default Container;
