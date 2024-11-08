import * as React from 'react';

import { Element } from '../Element/component';
import { TreeViewItem } from '../TreeViewItem/index';

import { TreeView as TreeViewClass, TreeViewArgs } from './index';

/**
 * A container that can show a TreeView like a hierarchy. The TreeView contains
 * TreeViewItems.
 */
class TreeView extends Element<TreeViewArgs, any> {
    parentElement: any;

    constructor(props: TreeViewArgs) {
        super(props);

        this.element = new TreeViewClass({ ...props });
        this.loadChildren(this.props.children, this.element);
    }

    loadChildren(children: any, element: any) {
        if (!children) return;
        if (!Array.isArray(children)) {
            children = [children];
        }
        children.forEach((child: any) => {
            const childElement: any = new TreeViewItem({ text: child.props.text, icon: child.props.icon, open: false });
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
        this.element = new TreeViewClass({ ...this.props });
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

TreeView.ctor = TreeViewClass;

export { TreeView };
