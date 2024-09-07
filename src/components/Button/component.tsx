import * as React from 'react';
import { Button as ButtonClass, ButtonArgs } from './index';
import { Element } from '../Element/component';

/**
 * User input with click interaction
 */
class Button extends Element<ButtonArgs, any> {
    constructor(props: ButtonArgs = {}) {
        super(props);
        this.elementClass = ButtonClass;
    }

    render() {
        // @ts-ignore
        return <button ref={this.attachElement} />;
    }
}

Button.ctor = ButtonClass;

export { Button };
