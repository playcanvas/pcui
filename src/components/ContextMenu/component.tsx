import React from 'react';
import Element, { ContextMenuArgs } from './index';
import BaseComponent from '../Element/component';

/**
 * Represents a context menu. LEGACY: This is a legacy component and will be removed in the future. Use Menu instead.
 */
class ContextMenu extends BaseComponent <ContextMenuArgs, any> {
    constructor(props: ContextMenuArgs) {
        super(props);
        this.elementClass = Element;
    }

    onDivLoaded = (element: any) => {
        this.element = new Element({ ...this.props, dom: element });
    };

    render() {
        return <div ref={this.onDivLoaded} />;
    }
}

ContextMenu.ctor = Element;

export default ContextMenu;
