import { Element } from '../Element/component';

import type { GridViewItemArgs } from './index';
import { GridViewItem as GridViewItemClass } from './index';

/**
 * Represents a grid view item used in GridView.
 */
class GridViewItem extends Element<GridViewItemArgs, object> {
    static ctor = GridViewItemClass;
}

export { GridViewItem };
