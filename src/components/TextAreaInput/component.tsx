import Element from './index';
import BaseComponent from '../Element/component';

/**
 * The TextAreaInput wraps a textarea element. It has the same interface as pcui.TextInput.
 */
class Component extends BaseComponent <Element.Args, any> {
    constructor(props: Element.Args) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

Component.ctor = Element;

export default Component;
