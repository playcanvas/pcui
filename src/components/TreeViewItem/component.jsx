import Element from './index';
import ElementComponent from '../Element/component';

class TreeViewItem extends ElementComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
}

TreeViewItem.propTypes = {};

TreeViewItem.defaultProps = {};

export default TreeViewItem;