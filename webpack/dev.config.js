let webpack = require('webpack');
let path = require('path');

const host = process.env.HOST || '0.0.0.0';
const mainPort = (process.env.PORT) || 3000;
const devPort = (process.env.PORT + 1) || 3001;

let webpackConfig = {
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    entry: {
        main: [
            'webpack-dev-server/client?http://' + host + ':' + mainPort,
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
