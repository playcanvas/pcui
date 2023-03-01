import Element, { SelectInputArgs } from './index';
import BaseComponent from '../Element/component';

/**
 * An input that allows selecting from a dropdown or entering tags.
 */
class Component extends BaseComponent <SelectInputArgs, any> {
    onSelect?: () => void;

    constructor(props: SelectInputArgs) {
        super(props);
        this.elementClass = Element;

        this.onSelect = props.onSelect;

        this.onAttach = this.onAttachFn.bind(this);

    }

    onAttachFn() {
        if (this.props.onSelect) {
            this.element.on('select', this.onSelect);
        }
    }

    render() {
        return super.render();
    }
}

Component.ctor = Element;

export default Component;
