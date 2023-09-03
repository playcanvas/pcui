import * as React from 'react';

import CanvasComponent from './component';

export default {
    title: 'Components/Canvas',
    component: CanvasComponent
};

export const Main = args => <CanvasComponent {...args} />;
