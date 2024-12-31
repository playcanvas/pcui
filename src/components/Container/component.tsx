import * as React from 'react';

import { Element } from '../Element/component';

import { Container as ContainerClass, ContainerArgs } from './index';

// Define interface for child props
interface ContainerChildProps {
    parent: ContainerClass;
}

/**
 * A container is the basic building block for Elements that are grouped together.
 * A container can contain any other element including other containers.
 */
class Container extends Element<ContainerArgs, any> {
    declare element: ContainerClass;

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
        const elementsArray = Array.from(React.Children.toArray(this.props.children));
        let elements: React.ReactNode;

        if (elementsArray.length === 1) {
            elements = React.cloneElement(
                elementsArray[0] as React.ReactElement<ContainerChildProps>,
                { parent: this.element }
            );
        } else if (elementsArray.length > 0) {
            elements = elementsArray.map(element => 
                React.cloneElement(
                    element as React.ReactElement<ContainerChildProps>,
                    { parent: this.element }
                )
            );
        }

        // @ts-ignore
        return <div ref={this.attachElement}>
            { elements }
        </div>;
    }
}

Container.ctor = ContainerClass;

export { Container };
