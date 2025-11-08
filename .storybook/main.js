import { fileURLToPath } from "node:url";
import path from 'path';
import webpack from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

        // Handle Node.js built-in modules that shouldn't be bundled for the browser.
        // This is required because PlayCanvas Engine uses require('node:worker_threads')
        // in gsplat-sort-worker.js. Since the code checks for 'self' first (which exists
        // in browsers), the worker_threads code path won't execute at runtime.
        config.resolve = config.resolve || {};
        config.resolve.fallback = {
            ...config.resolve.fallback,
            'worker_threads': false
        };
        
        // Use NormalModuleReplacementPlugin to replace node: protocol imports
        config.plugins = config.plugins || [];
        config.plugins.push(
            new webpack.NormalModuleReplacementPlugin(
                /^node:worker_threads$/,
                path.resolve(__dirname, 'node-worker-threads-stub.js')
            )
        );

        return config;
    },

    framework: {
        name: '@storybook/react-webpack5',
        options: {}
    },

    docs: {}
};

export default config;
