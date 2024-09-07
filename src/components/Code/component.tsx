import { Code as CodeClass, CodeArgs } from './index';
import { Element } from '../Element/component';

/**
 * Represents a code block.
 */
class Code extends Element<CodeArgs, any> {
    static defaultProps: CodeArgs;

    constructor(props: CodeArgs) {
        super(props);
        this.elementClass = CodeClass;
    }

    render() {
        return super.render();
    }
}

Code.ctor = CodeClass;

export { Code };
