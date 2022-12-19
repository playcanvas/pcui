import Element from './index';
import BaseComponent from '../Element/component';

/**
 *  Represents a grid view item used in GridView.
 */
class GridViewItem extends BaseComponent <ElementArgs, any> {
    constructor(props: ElementArgs) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

GridViewItem.ctor = Element;

export default GridViewItem;
