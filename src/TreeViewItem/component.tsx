import Element from './index';
import ElementComponent, { ElementComponentProps, IParentProps } from '../Element/component';

interface TreeViewItemProps extends ElementComponentProps, IParentProps {
    allowSelect?: boolean,
    open?: boolean,
    allowDrag?: boolean,
    allowDrop?: boolean,
    text?: string,
    icon?: string,
    onSelect?: (deselect: () => void) => void,
    onDeselect?: () => void
}

class TreeViewItem extends ElementComponent <TreeViewItemProps, any> {
    onSelect: () => void;
    onDeselect: () => void;
    constructor(props: TreeViewItemProps) {
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

TreeViewItem.ctor = Element;

export default TreeViewItem;
