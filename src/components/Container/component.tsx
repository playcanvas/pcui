import * as React from 'react';
import { Container as ContainerClass, ContainerArgs } from './index';
import { Element } from '../Element/component';

/**
 * A container is the basic building block for Elements that are grouped together.
 * A container can contain any other element including other containers.
 */
class Container extends Element<ContainerArgs, any> {
    constructor(props: ContainerArgs = {}) {
        super(props);
        this.elementClass = ContainerClass;
    }

    componentDidMount() {
        if (this.props.onResize) {
            this.element.on('resize', this.props.onResize);
        }
    }

    getParent = () => {
        return this;
    };

    render() {
        let elements: any = React.Children.toArray(this.props.children);

        if (elements.length === 1) {
            elements = React.cloneElement(elements[0], { parent: this.element });
        } else if (elements.length > 0) {
            elements = elements.map((element: any) => React.cloneElement(element, { parent: this.element }));
        }
        // @ts-ignore
        return <div ref={this.attachElement}>
            { elements }
        </div>;
    }
}

Container.ctor = ContainerClass;

export { Container };
