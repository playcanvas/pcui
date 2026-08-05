import * as React from 'react';

import { Element } from '../Element/component';
import { GridViewItem } from '../GridViewItem/index';

import type { GridViewArgs } from './index';
import { GridView as GridViewClass } from './index';

type ChildProps = { text?: string; children?: React.ReactNode };

/**
 * Represents a container that shows a flexible wrappable list of items that looks like a grid.
 * Contains GridViewItems.
 */
class GridView extends Element<GridViewArgs, object> {
    static ctor = GridViewClass;

    constructor(props: GridViewArgs) {
        super(props);
        this.element = new GridViewClass({ ...props });
        this.loadChildren(this.props.children, this.element as GridViewClass);
    }

    loadChildren(children: React.ReactNode, element: GridViewClass | GridViewItem) {
        if (!children) return;
        if (!Array.isArray(children)) {
            children = [children];
        }
        (children as React.ReactElement<ChildProps>[]).forEach((child) => {
            const childElement = new GridViewItem({ text: child.props.text });
            element.append(childElement);
            this.loadChildren(child.props.children, childElement);
        });
    }

    render() {
        return (
            <div
                ref={(nodeElement) => {
                    if (nodeElement) {
                        nodeElement.appendChild(this.element.dom);
                    }
                }}
            />
        );
    }
}

export { GridView };
