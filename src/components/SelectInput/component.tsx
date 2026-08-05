import { Element } from '../Element/component';

import type { SelectInputArgs } from './index';
import { SelectInput as SelectInputClass } from './index';

/**
 * An input that allows selecting from a dropdown or entering tags.
 */
class SelectInput extends Element<SelectInputArgs, object> {
    static ctor = SelectInputClass;

    onSelect?: SelectInputArgs['onSelect'];

    constructor(props: SelectInputArgs) {
        super(props);

        this.onSelect = props.onSelect;

        this.onAttach = this.onAttachFn.bind(this);
    }

    onAttachFn() {
        if (this.props.onSelect) {
            this.element.on('select', this.onSelect);
        }
    }
}

export { SelectInput };
