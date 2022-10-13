import React from 'react';
import Element from './index';
import ElementComponent, { ElementComponentProps } from '../Element/component';

interface SpinnerProps extends ElementComponentProps {
    size?: number
}

class Spinner extends ElementComponent <SpinnerProps, any> {
    static defaultProps: SpinnerProps;

    constructor(props: SpinnerProps) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        // @ts-ignore
        return <svg ref={this.attachElement} />
    }
}

Spinner.ctor = Element;
Spinner.defaultProps = {
    size: 12
};

export default Spinner;
