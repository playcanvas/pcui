import React from 'react';
import TreeViewElement from './index';
import TreeViewItemElement from '../TreeViewItem/index';
import ElementComponent, { ElementComponentProps, IParentProps } from '../Element/component';

interface TreeViewProps extends ElementComponentProps, IParentProps {
    allowDrag?: boolean,
    allowReordering?: boolean,
    allowRenaming?: boolean,
    filter?: string
}

class TreeView extends ElementComponent <TreeViewProps, any> {
    parentElement: any;

    constructor(props: TreeViewProps) {
        super(props);
        // @ts-ignore
        this.element = new TreeViewElement({...props});
        this.loadChildren(this.props.children, this.element);
    }
    loadChildren(children: any, element: any) {
        if (!children) return;
        if (!Array.isArray(children)) {
            children = [children];
        }
        children.forEach((child: any) => {
            var childElement: any = new TreeViewItemElement({ text: child.props.text, icon: child.props.icon, open: false });
            if (child.props.onSelect) {
                childElement.on('select', child.props.onSelect);
            }
            if (child.props.onDeselect) {
                childElement.on('deselect', child.props.onDeselect);
            }
            element.append(childElement);
            this.loadChildren(child.props.children, childElement);
        });
    }
    componentDidUpdate() {
        this.parentElement.removeChild(this.element.dom);
        // @ts-ignore
        this.element = new TreeViewElement({ ...this.props });
        this.loadChildren(this.props.children, this.element);
        this.parentElement.appendChild(this.element.dom);
    }
    parentElementRendered(element: any) {
        if (!element) return;
        this.parentElement = element;
        this.parentElement.appendChild(this.element.dom);
    }
    render() {
        return <div ref={this.parentElementRendered.bind(this)} />
    }
}

TreeView.ctor = TreeViewElement;

export default TreeView;
