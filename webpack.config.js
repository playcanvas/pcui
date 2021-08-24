const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const data = {
    mode: process.env.ENVIRONMENT === 'development' ? 'development' : 'production',
    entry: {
        'pcui-react': process.env.STRIP_DEPENDENCIES ? './src/components/index.js' : './src/components/bundle.js',
        'pcui': process.env.STRIP_DEPENDENCIES ? './src/index.js' : './src/bundle.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: process.env.MODULE ? '[name].mjs' : '[name].js',
        library: process.env.MODULE ? undefined : (process.env.LIBRARY_NAME ? `${process.env.LIBRARY_NAME}_[name]` : '[name]'),
        libraryTarget: process.env.MODULE ? 'module' : 'umd'
    },
    experiments: process.env.MODULE ? {
        outputModule: true
    } : undefined,
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
            new CssMinimizerPlugin()
        ]
    },
    plugins: process.env.EXTRACT_CSS ? [new MiniCssExtractPlugin()] : []
};

if (process.env.STRIP_DEPENDENCIES) {
    data.externals = {
        '@playcanvas/playcanvas-observer': 'umd observer'
    };
}

module.exports = data;
