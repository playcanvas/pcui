import Element from './index';
import ElementComponent, { ElementComponentProps } from '../Element/component';

export interface TextInputProps extends ElementComponentProps {
    placeholder?: string,
    value?: number | string,
    renderChanges?: boolean,
    blurOnEnter?: boolean,
    blurOnEscape?: boolean,
    keyChange?: boolean,
    onValidate?: (value: string) => boolean
}

class TextInput extends ElementComponent <TextInputProps, any> {
    onValidate: (value: string) => boolean;

    constructor(props: TextInputProps) {
        super(props);
        this.elementClass = Element;

        if (props.onValidate) {
            this.onValidate = props.onValidate;
        }

        this.onAttach = this.onAttachFn.bind(this);
    }

    onAttachFn() {
        if (this.onValidate) {
            this.element.onValidate = this.onValidate;
        }
    }

    render() {
        return super.render();
    }
}

TextInput.ctor = Element;

export default TextInput;
