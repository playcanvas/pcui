
import React from 'react';
import Element from './index';
import ElementComponent, { ElementComponentProps } from '../Element/component';

interface ContextMenuProps extends ElementComponentProps {
    items: Array<{ text: string, onClick: (e: any) => void }>,
    dom?: any,
    triggerElement?: any
}

class ContextMenu extends ElementComponent <ContextMenuProps, any> {
    constructor(props: ContextMenuProps) {
        super(props);
        this.elementClass = Element;
    }

    onDivLoaded = (element: any) => {
        this.element = new Element({ ...this.props, dom: element });
    }
    render() {
        return <div ref={this.onDivLoaded} />
    }
}

ContextMenu.ctor = Element;

export default ContextMenu;
