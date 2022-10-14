
import React from 'react';
import Element from './index';
import ElementComponent, { ElementComponentProps } from '../Element/component';

interface MenuItemProps {
    hasChildren?: boolean,
    text?: string,
    icon?: string,
    onSelect: () => void,
    onIsEnabled?: () => boolean,
    onIsVisible?: () => boolean,
    items?: Array<MenuItemProps>
}

interface MenuProps extends ElementComponentProps {
    items: Array<MenuItemProps>
}

class Menu extends ElementComponent <MenuProps, any> {
    constructor(props: MenuProps) {
        super(props);
        this.elementClass = Element;
    }
    onDivLoaded = (element: any) => {
        // @ts-ignore
        this.element = new Element({ ...this.props, dom: element });
    }
    render() {
        return <div ref={this.onDivLoaded} />
    }
}

Menu.ctor = Element;

export default Menu;
