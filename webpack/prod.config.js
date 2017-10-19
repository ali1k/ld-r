let webpack = require('webpack');
let path = require('path');
let StatsWriterPlugin = require('webpack-stats-plugin').StatsWriterPlugin;
let Visualizer = require('webpack-visualizer-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');

let webpackConfig = {
    resolve: {
        extensions: ['.js']
    },
    entry: {
        main: [
            './client.js'
        ],
        vendor: [
            'react', 'react-dom', 'async', 'fluxible', 'fluxible-addons-react', 'wicket/wicket', 'fluxible-plugin-fetchr', 'fluxible-router', 'moment', 'rc-calendar', 'semantic-ui-react', 'react-leaflet', 'lodash/collection', 'lodash/string', 'react-search-input', 'classnames/bind', 'chroma-js', 'password-hash', 'recharts'
        ]
    },
    output: {
        path: path.resolve('./build/js'),
        publicPath: '/public/js/',
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: [
                        ['es2015', { modules: false }]
                    ]
                }
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader',
                    publicPath: '/public/css/'
                })
            }
        ]
    },
    node: {
        setImmediate: false
    },
    plugins: [
        // css files from the extract-text-plugin loader
        new ExtractTextPlugin({
            filename: '../css/vendor.bundle.css',
            disable: false,
            allChunks: true
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production'),
                BROWSER: JSON.stringify('true')
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: Infinity,
            filename: '[name].bundle.js'
        }),
        // Write out stats file to build directory.
        new StatsWriterPlugin({
            filename: 'webpack.stats.json', // Default
            fields: null,
            transform: function (data) {
                return JSON.stringify(data, null, 2);
            }
        }),
        new Visualizer()
    ],
    devtool: 'source-map'
};

module.exports = webpackConfig;
