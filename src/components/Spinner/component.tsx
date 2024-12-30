import * as React from 'react';

import { Element } from '../Element/component';

import { Spinner as SpinnerClass, SpinnerArgs } from './index';

/**
 * Represents a spinning icon.
 */
class Spinner extends Element<SpinnerArgs, any> {
    static defaultProps: SpinnerArgs;

    constructor(props: SpinnerArgs) {
        super(props);
        this.elementClass = SpinnerClass;
    }

    render() {
        // @ts-ignore
        return <svg ref={this.attachElement} />;
    }
}

Spinner.ctor = SpinnerClass;

export { Spinner };
