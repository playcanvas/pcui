import Element, { NumericInputArgs } from './index';
import BaseComponent from '../Element/component';

/**
 * The NumericInput represents an input element that holds numbers.
 */
class Component extends BaseComponent <NumericInputArgs, any> {
    onValidate: (value: string) => boolean;

    constructor(props: NumericInputArgs) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

Component.ctor = Element;

export default Component;
