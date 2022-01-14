import ElementCls from './index';
import BaseComponent from '../BaseComponent/index.jsx';

class Element extends BaseComponent {
    constructor(props) {
        super(props);
        this.elementClass = ElementCls;
    }
    attachElement = (nodeElement, containerElement) => {
        if (!nodeElement) return;
        this.element = new this.elementClass(
            nodeElement,
            {
            ...this.props,
            container: containerElement,
            parent: undefined
        });
        if (this.onClick) {
            this.element.on('click', this.onClick);
        }
        if (this.onChange) {
            this.element.on('change', this.onChange);
        }
        if (this.props.parent) {
            this.element.parent = this.props.parent;
        }
    }
    render() {
        return super.render();
    }
}

export default Element;
