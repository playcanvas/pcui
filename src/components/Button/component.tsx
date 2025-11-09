import * as React from 'react';

import { Element } from '../Element/component';

import { Button as ButtonClass, ButtonArgs } from './index';

/**
 * User input with click interaction
 */
class Button extends Element<ButtonArgs, any> {
    static ctor = ButtonClass;

    render() {
        // @ts-ignore
        return <button ref={this.attachElement} />;
    }
}

export { Button };
