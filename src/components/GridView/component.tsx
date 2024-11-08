import * as React from 'react';

import { Element } from '../Element/component';
import { GridViewItem } from '../GridViewItem/index';

import { GridView as GridViewClass, GridViewArgs } from './index';

/**
 * Represents a container that shows a flexible wrappable list of items that looks like a grid.
 * Contains GridViewItems.
 */
class GridView extends Element<GridViewArgs, any> {
    constructor(props: GridViewArgs) {
        super(props);
        this.element = new GridViewClass({ ...props });
        this.loadChildren(this.props.children, this.element);
    }

    loadChildren(children: any, element: any) {
        if (!children) return;
        if (!Array.isArray(children)) {
            children = [children];
        }
        children.forEach((child: any) => {
            const childElement = new GridViewItem({ text: child.props.text });
            element.append(childElement);
            this.loadChildren(child.props.children, childElement);
        });
    }

    render() {
        return <div ref={(nodeElement) => {
            if (nodeElement) {
                nodeElement.appendChild(this.element.dom);
            }
        }} />;
    }
}

GridView.ctor = GridViewClass;

export { GridView };
