import React from 'react';
import TreeViewElement from './index';
import TreeViewItemElement from '../TreeViewItem/index';
import ElementComponent from '../Element/component';

class TreeView extends ElementComponent {
    constructor(props) {
        super(props);
        this.element = new TreeViewElement({...props});
        this.loadChildren(this.props.children, this.element);
    }
    loadChildren(children, element) {
        if (!children) return;
        if (!Array.isArray(children)) {
            children = [children];
        }
        children.forEach((child) => {
            var childElement = new TreeViewItemElement({ text: child.props.text, open: false });
            element.append(childElement);
            this.loadChildren(child.props.children, childElement);
        });
    }
    render() {
        return <div ref={(nodeElement) => {nodeElement && nodeElement.appendChild(this.element.dom)}} />
    }
}

TreeView.propTypes = {};

TreeView.defaultProps = {};

export default TreeView;