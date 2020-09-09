let webpack = require('webpack');
let path = require('path');
//plugins
const ExtractCssChunks = require('extract-css-chunks-webpack-plugin');
const StatsWriterPlugin = require('webpack-stats-plugin').StatsWriterPlugin;
const Visualizer = require('webpack-visualizer-plugin');

let webpackConfig = {
    mode: 'production',
    devtool: '',
    resolve: {
        extensions: ['.js'],
        alias: {
            react: path.resolve('./node_modules/react'),
        }
    },
    entry: {
        main: './client.js'
    },
    output: {
        path: path.resolve('./build/js'),
        publicPath: '/public/js/',
        filename: '[name].js'
    },
    optimization: {
        minimize: true,
        runtimeChunk: {
            name: 'vendor.bundle'
        },
        splitChunks: {
            cacheGroups: {
                default: false,
                commons: {
                    test: /node_modules/,
                    name: 'vendor.bundle',
                    chunks: 'initial',
                    minSize: 1
                }
            }
        }
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules(?!(\/|\\)react-sigma)/ ,
                loader: 'babel-loader',
                options: {
                    babelrc: true
                }
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: ExtractCssChunks.loader,
                        options: {
                            publicPath: '/public/css/'
                        },
                    },
                    'css-loader',
                ],
            }
        ]
    },
    node: {
        setImmediate: false
    },
    plugins: [
        // css files from the extract-text-plugin loader
        new ExtractCssChunks({
            filename: '../css/[name].css',
            chunkFilename: '../css/vendor.bundle.css',
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production'),
                BROWSER: JSON.stringify('true')
            }
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
    stats: {
	       colors: true,
		   children: false,
	       }
};

module.exports = webpackConfig;
