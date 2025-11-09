import { Element } from '../Element/component';

import { Progress as ProgressClass, ProgressArgs } from './index';

/**
 * Represents a bar that can highlight progress of an activity.
 */
class Progress extends Element<ProgressArgs, any> {
    constructor(props: ProgressArgs) {
        super(props);
        this.elementClass = ProgressClass;
    }
}

Progress.ctor = ProgressClass;

export { Progress };
