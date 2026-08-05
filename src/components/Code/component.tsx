import { Element } from '../Element/component';

import type { CodeArgs } from './index';
import { Code as CodeClass } from './index';

/**
 * Represents a code block.
 */
class Code extends Element<CodeArgs, any> {
    static ctor = CodeClass;
}

export { Code };
