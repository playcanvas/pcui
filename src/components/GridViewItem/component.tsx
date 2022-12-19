import Element, { GridViewItemArgs } from './index';
import BaseComponent from '../Element/component';

/**
 *  Represents a grid view item used in GridView.
 */
class GridViewItem extends BaseComponent <GridViewItemArgs, any> {
    constructor(props: GridViewItemArgs) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

GridViewItem.ctor = Element;

export default GridViewItem;
