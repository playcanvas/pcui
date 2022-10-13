import Element from './index';
import ElementComponent, { ElementComponentProps } from '../Element/component';

interface SelectInputProps extends ElementComponentProps {
    renderChanges?: boolean,
    placeholder?: string,
    multiSelect?: boolean,
    invalidOptions?: Array<string>,
    options: Array<{ v: string | number | null, t: string}>,
    allowNull?: boolean,
    allowInput?: boolean,
    createFn?: (value: string | boolean | number) => void,
    createLabelText?: string,
    type?: string,
    value?: string | number | null
}

class SelectInput extends ElementComponent <SelectInputProps, any> {
    static defaultProps: SelectInputProps;

    constructor(props: SelectInputProps) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

SelectInput.ctor = Element;
SelectInput.defaultProps = {
    options: [
        {
            v: 'Foo',
            t: 'Foo'
        },
        {
            v: 'Bar',
            t: 'Bar'
        }
    ]
};

export default SelectInput;
