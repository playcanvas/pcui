import { Element } from '../Element/component';

import { GridViewItem as GridViewItemClass, GridViewItemArgs } from './index';

/**
 * Represents a grid view item used in GridView.
 */
class GridViewItem extends Element<GridViewItemArgs, any> {
    constructor(props: GridViewItemArgs) {
        super(props);
        this.elementClass = GridViewItemClass;
    }

    render() {
        return super.render();
    }
}

GridViewItem.ctor = GridViewItemClass;

export { GridViewItem };
