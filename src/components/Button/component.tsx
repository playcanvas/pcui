import * as React from 'react';

import { Element } from '../Element/component';

import type { ButtonArgs } from './index';
import { Button as ButtonClass } from './index';

/**
 * User input with click interaction
 */
class Button extends Element<ButtonArgs, object> {
    static ctor = ButtonClass;

    render() {
        return <button ref={this.attachElement} />;
    }
}

export { Button };
