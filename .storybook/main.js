import path from 'path';

const config = {
    stories: ['../src/**/*.stories.tsx'],

    addons: ['@storybook/addon-webpack5-compiler-swc', '@storybook/addon-docs'],

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

    framework: {
        name: '@storybook/react-webpack5',
        options: {}
    },

    docs: {}
};

export default config;
