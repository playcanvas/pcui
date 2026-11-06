import { Element } from '../Element/component';
import type { ParentProps } from '../Element/component';

import type { CodeArgs } from './index';
import { Code as CodeClass } from './index';

/**
 * Represents a code block.
 */
class Code extends Element<ParentProps<CodeArgs>, object> {
    static ctor = CodeClass;
}

export { Code };
