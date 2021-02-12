import Element from './index';
import BaseComponent from '../base-component';

class TreeViewItem extends BaseComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

TreeViewItem.propTypes = {};
TreeViewItem.ctor = Element;
TreeViewItem.defaultProps = {};

export default TreeViewItem;
