import React from 'react';
import GridViewElement from './index';
import GridViewItemElement from '../GridViewItem/index';
import ElementComponent, { ElementComponentProps, IParentProps } from '../Element/component';

interface GridViewProps extends ElementComponentProps, IParentProps {
    vertical?: boolean,
    multiSelect?: boolean,
    allowDeselect?: boolean,
    filterFn?: (GridViewItem: any) => boolean
}

class GridView extends ElementComponent <GridViewProps, any> {
    constructor(props: GridViewProps) {
        super(props);
        // @ts-ignore
        this.element = new GridViewElement({...props});
        this.loadChildren(this.props.children, this.element);
    }
    loadChildren(children: any, element: any) {
        if (!children) return;
        if (!Array.isArray(children)) {
            children = [children];
        }
        children.forEach((child: any) => {
            // @ts-ignore
            var childElement = new GridViewItemElement({ text: child.props.text, open: false });
            element.append(childElement);
            this.loadChildren(child.props.children, childElement);
        });
    }
    render() {
        return <div ref={(nodeElement) => {nodeElement && nodeElement.appendChild(this.element.dom)}} />
    }
}

GridView.ctor = GridViewElement;

export default GridView;
