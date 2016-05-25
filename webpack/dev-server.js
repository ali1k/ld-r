let WebpackDevServer = require ('webpack-dev-server');
let webpack = require ('webpack');
let config = require ('./dev.config');
let shell = require ('shelljs');

const host = process.env.HOST || '0.0.0.0';
const mainPort = (process.env.PORT) || 3000;
const devPort = (process.env.PORT + 1) || 3001;

const options = {
    //contentBase: `http://${host}:${port}`,
    hot: true,
    historyApiFallback: true,
    //inline: true,
    //lazy: false,
    publicPath: config.output.publicPath,
    proxy: {
        '*': { target: `http://${host}:${devPort}` }
    }
    //stats: {
        //colors: true
    //}
};

const compiler = webpack(config);

new WebpackDevServer(compiler, options).listen(mainPort, host,  () => {
    shell.env.PORT = shell.env.PORT || devPort;
    shell.exec('"./node_modules/.bin/nodemon" start.js -e js,jsx',  () => {});
    console.log('Webpack development server listening on %s:%s', host, mainPort);
});
