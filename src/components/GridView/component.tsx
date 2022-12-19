import React from 'react';
import GridViewElement from './index';
import GridViewItemElement from '../GridViewItem/index';
import BaseComponent from '../Element/component';

/**
 * Represents a container that shows a flexible wrappable
 * list of items that looks like a grid. Contains GridViewItem's.
 */
class GridView extends BaseComponent <GridViewElementArgs, any> {
    constructor(props: GridViewElementArgs) {
        super(props);
        // @ts-ignore
        this.element = new GridViewElement({ ...props });
        this.loadChildren(this.props.children, this.element);
    }

    loadChildren(children: any, element: any) {
        if (!children) return;
        if (!Array.isArray(children)) {
            children = [children];
        }
        children.forEach((child: any) => {
            // @ts-ignore
            const childElement = new GridViewItemElement({ text: child.props.text, open: false });
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

GridView.ctor = GridViewElement;

export default GridView;
