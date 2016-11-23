let webpack = require('webpack');
let path = require('path');
let StatsWriterPlugin = require('webpack-stats-plugin').StatsWriterPlugin;
let Visualizer = require('webpack-visualizer-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');

let webpackConfig = {
    resolve: {
        extensions: ['', '.js']
    },
    entry: {
        main: [
            './client.js'
        ],
        vendor: [
            'react', 'react-dom', 'async', 'fluxible', 'fluxible-addons-react', 'wicket/wicket', 'fluxible-plugin-fetchr', 'fluxible-router', 'moment', 'rc-calendar', 'semantic-ui-react', 'react-leaflet'
        ]
    },
    output: {
        path: path.resolve('./build/js'),
        publicPath: '/public/js/',
        filename: '[name].js'
    },
    module: {
        loaders: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loaders: [
                    require.resolve('babel-loader')
                ]
            },
            { test: /\.json$/, loader: 'json-loader'},
            { test: /\.css$/, loader: ExtractTextPlugin.extract('style', 'css') }
        ]
    },
    node: {
        setImmediate: false
    },
    plugins: [
        // css files from the extract-text-plugin loader
        new ExtractTextPlugin('../css/vendor.bundle.css'),

        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production'),
                BROWSER: JSON.stringify('true')
            }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
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
