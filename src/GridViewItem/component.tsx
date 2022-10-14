import Element from './index';
import ElementComponent, { ElementComponentProps } from '../Element/component';

interface GridViewItemProps extends ElementComponentProps {
    allowSelect?: boolean,
    text?: string,
    type?: string
}

class GridViewItem extends ElementComponent <GridViewItemProps, any> {
    constructor(props: GridViewItemProps) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

GridViewItem.ctor = Element;

export default GridViewItem;
