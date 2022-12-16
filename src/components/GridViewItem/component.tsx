import Element from './index';
import BaseComponent from '../Element/component';

/**
 *  Represents a grid view item used in GridView.
 */
class GridViewItem extends BaseComponent <Element.Args, any> {
    constructor(props: Element.Args) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

GridViewItem.ctor = Element;

export default GridViewItem;
