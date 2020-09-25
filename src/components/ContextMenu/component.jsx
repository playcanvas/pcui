
import React, { Component } from 'react';
import Element from './index';
import PropTypes from 'prop-types';
import ElementComponent from '../Element/component';

class ContextMenu extends ElementComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
    // componentDidMount() {
    //     // console.log(this.props.parent);
    // }
    onDivLoaded = (element) => {
        this.element = new Element({ ...this.props, dom: element });
    }
    render() {
        return <div ref={this.onDivLoaded} />
    }
}

ContextMenu.propTypes = {};

ContextMenu.defaultProps = {};

export default ContextMenu;