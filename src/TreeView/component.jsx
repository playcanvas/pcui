import React from 'react';
import TreeViewElement from './index';
import TreeViewItemElement from '../TreeViewItem';
import BaseComponent from '../BaseComponent/index.jsx';

class TreeView extends BaseComponent {
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
            var childElement = new TreeViewItemElement({ text: child.props.text, icon: child.props.icon, open: false });
            if (child.props.onSelected) {
                childElement.on('select', child.props.onSelected);
            }
            element.append(childElement);
            this.loadChildren(child.props.children, childElement);
        });
    }
    componentDidUpdate(props) {
        this.parentElement.removeChild(this.element.dom);
        this.element = new TreeViewElement({...props});
        this.loadChildren(props.children, this.element);
        this.parentElement.appendChild(this.element.dom);
    }
    parentElementRendered(element) {
        if (!element) return;
        this.parentElement = element;
        this.parentElement.appendChild(this.element.dom);
    }
    render() {
        return <div ref={this.parentElementRendered.bind(this)} />
    }
}

TreeView.propTypes = {};
TreeView.ctor = TreeViewElement;
TreeView.defaultProps = {};

export default TreeView;
