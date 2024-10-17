import * as React from 'react';
import { Element } from '../Element/component';
import { Label as LabelClass, LabelArgs } from './index';

/**
 * The Label is a simple span element that displays some text.
 */
class Label extends Element<LabelArgs, any> {
    constructor(props: LabelArgs = {}) {
        super(props);
        this.elementClass = LabelClass;
    }

    render() {
        // @ts-ignore
        return <span ref={this.attachElement} />;
    }
}

Label.ctor = LabelClass;

export { Label };
