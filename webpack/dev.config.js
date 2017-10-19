let webpack = require('webpack');
let path = require('path');

const host = process.env.HOST ? process.env.HOST : 'localhost';
const mainPort = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const devPort = process.env.PORT ? parseInt(process.env.PORT) + 1 : 3001;

let webpackConfig = {
    resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
            react: path.resolve('./node_modules/react'),
        }
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
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            { test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    }
                ]
            }
        ]
    },
    node: {
        setImmediate: false
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('dev'),
                BROWSER: JSON.stringify('true')
            }
        })
    ],
    devtool: 'cheap-module-source-map'
};

module.exports = webpackConfig;
