import React from 'react';
import Element, { SpinnerArgs } from './index';
import BaseComponent from '../Element/component';

/**
 * Represents a spinning icon.
 */
class Component extends BaseComponent <SpinnerArgs, any> {
    static defaultProps: SpinnerArgs;

    constructor(props: SpinnerArgs) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        // @ts-ignore
        return <svg ref={this.attachElement} />;
    }
}

Component.ctor = Element;

export default Component;
