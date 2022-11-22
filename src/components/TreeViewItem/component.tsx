import Element from './index';
import BaseComponent from '../Element/component';

/**
 * Represents a Tree View Item to be added to a pcui.TreeView.
 */
class Component extends BaseComponent <Element.Args, any> {
    onSelect: () => void;
    onDeselect: () => void;
    constructor(props: Element.Args) {
        super(props);
        this.elementClass = Element;

        this.onSelect = () => {
            if (props.onSelect) {
                props.onSelect(() => {
                    this.element.selected = false;
                });
            }
        }
        if (props.onDeselect) {
            this.onDeselect = props.onDeselect;
        }

        this.onAttach = this.onAttachFn.bind(this);
    }

    onAttachFn() {
        if (this.props.onSelect) {
            this.element.on('select', this.onSelect);
        }
        if (this.props.onDeselect) {
            this.element.on('deselect', this.onDeselect);
        }
    }

    render() {
        return super.render();
    }
}

Component.ctor = Element;

export default Component;
