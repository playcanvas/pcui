import * as React from 'react';

import { Element } from '../Element/component';

import type { MenuArgs } from './index';
import { Menu as MenuClass } from './index';

/**
 * A Menu is a list of MenuItems which can contain child MenuItems. Useful to show context menus
 * and nested menus. Note that a Menu must be appended to the root Element and then positioned
 * accordingly.
 */
class Menu extends Element<MenuArgs, object> {
    static ctor = MenuClass;

    onDivLoaded = (element: HTMLDivElement | null) => {
        this.element = new MenuClass({ ...this.props, dom: element });
    };

    render() {
        return <div ref={this.onDivLoaded} />;
    }
}

export { Menu };
