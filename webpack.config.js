const path = require('path');

module.exports = {
    mode: 'production',
    entry: {
        'es6': './src/index.js',
        'react': './src/components/index.js',
        'binding': './src/binding/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: process.env.LIBRARY_NAME? `${process.env.LIBRARY_NAME}_[name]` : 'pcui_[name]',
        libraryTarget: 'umd',
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "@babel/preset-env",
                            "@babel/preset-react"
                        ],
                        plugins: [
                            "@babel/plugin-proposal-class-properties"
                        ]
                    }
                }
            },
            {
                test: /\.s[ac]ss$/i,
                use: ['style-loader', 'css-loader', {
                    loader: 'sass-loader',
                    options: {
                        additionalData: `@import '${__dirname}/src/scss/pcui.scss';`,
                    }
                }],
            },
        ],
    },
    resolve: {
        modules: [
            path.resolve(__dirname, 'src'),
            'node_modules'
        ],
        extensions: ['.jsx', '.js']
    },
};