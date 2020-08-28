const path = require('path');

module.exports = {
    mode: 'production',
    entry: {
        'index': './src/index.js',
        'component': './src/components/index.js',
        'binding': './src/binding/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: 'pcuiExternal',
        libraryTarget: 'umd',
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
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