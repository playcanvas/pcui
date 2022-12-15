import React from 'react';

import GridView from './component';
import GridViewItem from '../GridViewItem/component';

export default {
    component: GridView
};

export const Main = args => (
    <GridView {...args}>
        <GridViewItem text='Item 1' />
        <GridViewItem text='Item 2' />
        <GridViewItem text='Item 3' />
        <GridViewItem text='Item 4' />
        <GridViewItem text='Item 5' />
        <GridViewItem text='Item 6' />
        <GridViewItem text='Item 7' />
        <GridViewItem text='Item 8' />
        <GridViewItem text='Item 9' />
    </GridView>
);
