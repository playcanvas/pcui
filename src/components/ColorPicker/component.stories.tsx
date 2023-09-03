import * as React from 'react';

import ColorPickerComponent from './component';

export default {
    title: 'Components/ColorPicker',
    component: ColorPickerComponent
};

export const Main = args => <ColorPickerComponent value={[255, 0, 0, 1]} {...args} />;
