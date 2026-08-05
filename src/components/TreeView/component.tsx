import * as React from 'react';

import { Element } from '../Element/component';
import { TreeViewItem } from '../TreeViewItem/index';

import type { TreeViewArgs } from './index';
import { TreeView as TreeViewClass } from './index';

type ChildProps = {
    text?: string;
    icon?: string;
    children?: React.ReactNode;
    onSelect?: () => void;
    onDeselect?: () => void;
};

/**
 * A container that can show a TreeView like a hierarchy. The TreeView contains
 * TreeViewItems.
 */
class TreeView extends Element<TreeViewArgs, object> {
    static ctor = TreeViewClass;

    parentElement: HTMLDivElement;

    constructor(props: TreeViewArgs) {
        super(props);

        this.element = new TreeViewClass({ ...props });
        this.loadChildren(this.props.children, this.element as TreeViewClass);
    }

    loadChildren(children: React.ReactNode, element: TreeViewClass | TreeViewItem) {
        if (!children) return;
        if (!Array.isArray(children)) {
            children = [children];
        }
        (children as React.ReactElement<ChildProps>[]).forEach((child) => {
            const childElement = new TreeViewItem({ text: child.props.text, icon: child.props.icon, open: false });
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
        this.loadChildren(this.props.children, this.element as TreeViewClass);
        this.parentElement.appendChild(this.element.dom);
    }

    parentElementRendered(element: HTMLDivElement | null) {
        if (!element) return;
        this.parentElement = element;
        this.parentElement.appendChild(this.element.dom);
    }

    render() {
        return <div ref={this.parentElementRendered.bind(this)} />;
    }
}

export { TreeView };
