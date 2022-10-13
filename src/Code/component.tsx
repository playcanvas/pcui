import Element from './index';
import ElementComponent, { ElementComponentProps } from '../Element/component';

interface CodeProps extends ElementComponentProps {
    text?: string
}

class Code extends ElementComponent <CodeProps, any> {
    static defaultProps: CodeProps;

    constructor(props: CodeProps) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

Code.ctor = Element;
Code.defaultProps = {
    text: 'console.log("hello world");'
};

export default Code;
