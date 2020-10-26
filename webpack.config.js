const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssnanoPlugin = require('cssnano-webpack-plugin');

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
                use: [process.env.EXTRACT_CSS ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader', {
                    loader: 'sass-loader',
                    options: {
                        additionalData: "@import './src/scss/pcui.scss';"
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
    },
    optimization: {
        minimizer: [
            new CssnanoPlugin({
                cssnanoOptions: {
                    preset: ['default', {
                        discardDuplicates: true,
                        discardComments: { removeAll: true }
                    }]
                }
            })
        ]
    },
    plugins: process.env.EXTRACT_CSS ? [new MiniCssExtractPlugin()] : []
};
