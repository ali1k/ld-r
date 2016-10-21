let webpack = require('webpack');
let path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
const host = process.env.HOST || '0.0.0.0';
const port = (process.env.PORT + 1) || 3001;

let webpackConfig = {
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    entry: {
        main: [
            'webpack-dev-server/client?http://' + host + ':3000',
            'webpack/hot/only-dev-server',
            './client.js'
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
                    require.resolve('react-hot-loader'),
                    require.resolve('babel-loader')
                ]
            },
            { test: /\.json$/, loader: 'json-loader'},
            { test: /\.css$/, loader: 'style-loader!css-loader' }
        ]
    },
    node: {
        setImmediate: false
    },
    plugins: [
        // css files from the extract-text-plugin loader
        new ExtractTextPlugin('../css/vendor.bundle.css'),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('dev'),
                BROWSER: JSON.stringify('true')
            }
        })
    ],
    devtool: 'eval'
};

module.exports = webpackConfig;
