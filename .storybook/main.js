import path from 'path';

const config = {
    stories: ['../src/**/*.stories.tsx'],

    addons: [
        '@storybook/addon-essentials'
    ],

    webpackFinal: async (config, { configType }) => {
        config.module.rules = config.module.rules.filter((rule) => {
            if (!rule.test) return true;
            return !rule.test.test(".scss");
        });
        config.module.rules.unshift({
            test: /\.s[ac]ss$/i,
            use: [
                'style-loader',
                'css-loader',
                {
                    loader: 'sass-loader',
                    options: {
                        sassOptions: {
                            includePaths: [
                                path.resolve(__dirname, '../src/scss')
                            ]
                        }
                    }
                }
            ]
        });

        return config;
    },

    features: {
        storyStoreV7: false,
    },

    framework: {
        name: '@storybook/react-webpack5',
        options: {}
    },

    docs: {
        autodocs: true
    }
};

export default config;
