import Element from './index';
import BaseComponent from '../base-component';

class TreeViewItem extends BaseComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
}

TreeViewItem.propTypes = {};

TreeViewItem.defaultProps = {};

export default TreeViewItem;