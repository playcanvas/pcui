import '../src/scss/pcui-theme-green.scss';

const preview = {
    parameters: {
        backgrounds: {
            options: {
                playcanvas: {
                    name: 'playcanvas',
                    value: '#374346'
                },

                white: {
                    name: 'white',
                    value: '#FFFFFF'
                }
            }
        },
        controls: { expanded: true }
    },

    tags: ['autodocs'],

    initialGlobals: {
        backgrounds: {
            value: 'playcanvas'
        }
    }
};

export default preview;
