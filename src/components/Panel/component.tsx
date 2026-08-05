import * as React from 'react';

import { Element } from '../Element/component';
import type { Element as ElementClass } from '../Element/index';

import type { PanelArgs } from './index';
import { Panel as PanelClass } from './index';

/**
 * The Panel is a Container that itself contains a header container and a content container. The
 * respective Container functions work using the content container. One can also append elements to
 * the header of the Panel.
 */
class Panel extends Element<PanelArgs, object> {
    static ctor = PanelClass;

    nodeElement: HTMLDivElement;

    containerElement: HTMLDivElement;

    componentDidMount() {
        this.attachElement(this.nodeElement, this.containerElement);
    }

    render() {
        const children = React.Children.toArray(this.props.children);
        let elements: React.ReactNode = children;

        if (children.length === 1) {
            elements = React.cloneElement(children[0] as React.ReactElement<{ parent?: ElementClass }>, {
                parent: this.element
            });
        } else if (children.length > 0) {
            elements = children.map((element) =>
                React.cloneElement(element as React.ReactElement<{ parent?: ElementClass }>, { parent: this.element })
            );
        }
        return (
            <div
                ref={(nodeElement) => {
                    this.nodeElement = nodeElement;
                }}
            >
                <div
                    ref={(containerElement) => {
                        this.containerElement = containerElement;
                    }}
                >
                    {elements}
                </div>
            </div>
        );
    }
}

export { Panel };
