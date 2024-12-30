import * as React from 'react';

import { Element } from '../Element/component';

import { Button as ButtonClass, ButtonArgs } from './index';

/**
 * User input with click interaction
 */
class Button extends Element<ButtonArgs, any> {
    constructor(props: ButtonArgs = {}) {
        super(props);
        this.elementClass = ButtonClass;
    }

    render() {
        return <button ref={(ref: HTMLButtonElement) => this.attachElement(ref, null)} />;
    }
}

Button.ctor = ButtonClass;

export { Button };
