import { Element } from '../Element/component';

import { Code as CodeClass, CodeArgs } from './index';

/**
 * Represents a code block.
 */
class Code extends Element<CodeArgs, any> {
    static ctor = CodeClass;
}

export { Code };
