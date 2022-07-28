
import React from 'react';
import Element from './index';
import BaseComponent from '../BaseComponent/index.jsx';

class Menu extends BaseComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
    onDivLoaded = (element) => {
        this.element = new Element({ ...this.props, dom: element });
    }
    render() {
        return <div ref={this.onDivLoaded} />
    }
}

Menu.propTypes = {};
Menu.ctor = Element;
Menu.defaultProps = {};

export default Menu;
