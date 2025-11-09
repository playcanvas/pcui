import { Element } from '../Element/component';

import { SelectInput as SelectInputClass, SelectInputArgs } from './index';

/**
 * An input that allows selecting from a dropdown or entering tags.
 */
class SelectInput extends Element<SelectInputArgs, any> {
    onSelect?: (value: string) => void;

    constructor(props: SelectInputArgs) {
        super(props);
        this.elementClass = SelectInputClass;

        this.onSelect = props.onSelect;

        this.onAttach = this.onAttachFn.bind(this);

    }

    onAttachFn() {
        if (this.props.onSelect) {
            this.element.on('select', this.onSelect);
        }
    }
}

SelectInput.ctor = SelectInputClass;

export { SelectInput };
