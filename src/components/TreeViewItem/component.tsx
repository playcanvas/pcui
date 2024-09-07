import { Element } from '../Element/component';
import { TreeViewItem as TreeViewItemClass, TreeViewItemArgs } from './index';

/**
 * Represents a Tree View Item to be added to a TreeView.
 */
class TreeViewItem extends Element<TreeViewItemArgs, any> {
    onSelect: () => void;

    onDeselect: () => void;

    constructor(props: TreeViewItemArgs) {
        super(props);
        this.elementClass = TreeViewItemClass;

        this.onSelect = () => {
            if (props.onSelect) {
                props.onSelect(() => {
                    this.element.selected = false;
                });
            }
        };
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

TreeViewItem.ctor = TreeViewItemClass;

export { TreeViewItem };
