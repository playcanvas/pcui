import React from 'react';
import GridViewElement from './index';
import GridViewItemElement from '../GridViewItem';
import BaseComponent from '../BaseComponent/index.jsx';

class GridView extends BaseComponent {
    constructor(props) {
        super(props);
        this.element = new GridViewElement({...props});
        this.loadChildren(this.props.children, this.element);
    }
    loadChildren(children, element) {
        if (!children) return;
        if (!Array.isArray(children)) {
            children = [children];
        }
        children.forEach((child) => {
            var childElement = new GridViewItemElement({ text: child.props.text, open: false });
            element.append(childElement);
            this.loadChildren(child.props.children, childElement);
        });
    }
    render() {
        return <div ref={(nodeElement) => {nodeElement && nodeElement.appendChild(this.element.dom)}} />
    }
}

GridView.propTypes = {};
GridView.ctor = GridViewElement;
GridView.defaultProps = {};

export default GridView;
