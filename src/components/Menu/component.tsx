import * as React from 'react';
import Element, { MenuArgs } from './index';
import BaseComponent from '../Element/component';

/**
 * A Menu is a list of MenuItems which can contain child MenuItems. Useful
 * to show context menus and nested menus. Note that a Menu must be appended to the root Element
 * and then positioned accordingly.
 */
class Menu extends BaseComponent <MenuArgs, any> {
    constructor(props: MenuArgs) {
        super(props);
        this.elementClass = Element;
    }

    onDivLoaded = (element: any) => {
        // @ts-ignore
        this.element = new Element({ ...this.props, dom: element });
    };

    render() {
        return <div ref={this.onDivLoaded} />;
    }
}

Menu.ctor = Element;

export default Menu;
