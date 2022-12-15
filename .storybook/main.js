const config = {
    stories: ['../src/**/*.stories.tsx', '../src/examples/**/*.stories.tsx'],
    addons: [
        '@storybook/addon-actions/register',
        '@storybook/addon-links',
        '@storybook/addon-docs',
        '@storybook/addon-backgrounds/register'
    ],
    webpackFinal: async (config, { configType }) => {
        // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
        // You can change the configuration based on that.
        // 'PRODUCTION' is used when building the static version of storybook.

        config.module.rules = config.module.rules.filter(rule => {
            if (!rule.test) return true;
            return !rule.test.test(".scss");
        });
        config.module.rules.unshift(
            {
                test: /\.s[ac]ss$/i,
                use: ['style-loader', 'css-loader', {
                    loader: 'sass-loader',
                    options: {
                        additionalData: `@import '${__dirname}/../src/scss/pcui-storybook.scss';`
                    }
                }],
            }
        );

        // Return the altered config
        return config;
    },
    core: {
        builder: "webpack5"
    }
};
module.exports = config;
