let webpack = require('webpack');
let path = require('path');
//plugins
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

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
        new CleanWebpackPlugin([
            'dist',
        ]),
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
        })
    ],
    stats: {
	       colors: true,
		   children: false,
	       }
};

module.exports = webpackConfig;
