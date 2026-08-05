import { Element } from '../Element/component';

import type { ProgressArgs } from './index';
import { Progress as ProgressClass } from './index';

/**
 * Represents a bar that can highlight progress of an activity.
 */
class Progress extends Element<ProgressArgs, object> {
    static ctor = ProgressClass;
}

export { Progress };
