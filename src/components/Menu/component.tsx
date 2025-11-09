import * as React from 'react';

import { Element } from '../Element/component';

import { Menu as MenuClass, MenuArgs } from './index';

/**
 * A Menu is a list of MenuItems which can contain child MenuItems. Useful to show context menus
 * and nested menus. Note that a Menu must be appended to the root Element and then positioned
 * accordingly.
 */
class Menu extends Element<MenuArgs, any> {
    static ctor = MenuClass;

    onDivLoaded = (element: any) => {
        this.element = new MenuClass({ ...this.props, dom: element });
    };

    render() {
        return <div ref={this.onDivLoaded} />;
    }
}

export { Menu };
