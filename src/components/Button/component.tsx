import React from 'react';
import Element, { ButtonArgs } from './index';
import BaseComponent from '../Element/component';

/**
 * User input with click interaction
 */
class Component extends BaseComponent <ButtonArgs, any> {
    constructor(props: ButtonArgs = {}) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        // @ts-ignore
        return <button ref={this.attachElement} />;
    }
}

Component.ctor = Element;

export default Component;
