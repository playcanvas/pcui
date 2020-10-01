const path = require('path');

module.exports = {
    mode: 'production',
    entry: {
        'pcui': './src/index.js',
        'pcui-react': './src/components/index.js',
        'pcui-binding': './src/binding/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: process.env.LIBRARY_NAME ? `${process.env.LIBRARY_NAME}_[name]` : '[name]',
        libraryTarget: 'umd'
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
                        additionalData: process.env.EXCLUDE_FONT ? "@import './src/scss/pcui-exclude-font.scss';" : "@import './src/scss/pcui.scss';"
                    }
                }]
            }
        ]
    },
    resolve: {
        modules: [
            path.resolve(__dirname, 'src'),
            'node_modules'
        ],
        extensions: ['.jsx', '.js']
    }
};
