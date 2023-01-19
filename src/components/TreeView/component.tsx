import * as React from 'react';
import TreeViewElement, { TreeViewArgs } from './index';
import TreeViewItemElement from '../TreeViewItem/index';
import BaseComponent from '../Element/component';

/**
 * A container that can show a TreeView like a hierarchy. The TreeView contains
 * TreeViewItems.
 */
class Component extends BaseComponent <TreeViewArgs, any> {
    parentElement: any;

    constructor(props: TreeViewArgs) {
        super(props);

        this.element = new TreeViewElement({ ...props });
        this.loadChildren(this.props.children, this.element);
    }

    loadChildren(children: any, element: any) {
        if (!children) return;
        if (!Array.isArray(children)) {
            children = [children];
        }
        children.forEach((child: any) => {
            const childElement: any = new TreeViewItemElement({ text: child.props.text, icon: child.props.icon, open: false });
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
        return <div ref={this.parentElementRendered.bind(this)} />;
    }
}

Component.ctor = TreeViewElement;

export default Component;
