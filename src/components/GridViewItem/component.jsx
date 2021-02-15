import Element from './index';
import BaseComponent from '../base-component';

class GridViewItem extends BaseComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

GridViewItem.propTypes = {};
GridViewItem.ctor = Element;
GridViewItem.defaultProps = {};

export default GridViewItem;
