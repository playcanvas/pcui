import { addParameters } from '@storybook/react'; // <- or your storybook framework

addParameters({
  backgrounds: {
    default: 'playcanvas',
    values: [
      { name: 'playcanvas', value: '#374346', default: true },
      { name: 'white', value: '#FFFFFF' },
    ],
    controls: { expanded: true },
  }
});