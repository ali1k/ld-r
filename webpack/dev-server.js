let WebpackDevServer = require ('webpack-dev-server');
let webpack = require ('webpack');
let config = require ('./dev.config');
let shell = require ('shelljs');
let DashboardPlugin = require('webpack-dashboard/plugin');

const host = process.env.HOST ? process.env.HOST : 'localhost';
const mainPort = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const devPort = process.env.PORT ? parseInt(process.env.PORT) + 1 : 3001;


const options = {
    //contentBase: `http://${host}:${port}`,
    hot: true,
    historyApiFallback: true,
    //inline: true,
    //lazy: false,
    publicPath: config.output.publicPath,
    proxy: {
        '*': { target: `http://${host}:${devPort}` }
    },
    stats: {
        colors: true,
        chunks:false
    }
};

const compiler = webpack(config);
//enable webpack dashboard on-demand
if(process.env.DASHBOARD){
    compiler.apply(new DashboardPlugin());
}
new WebpackDevServer(compiler, options).listen(mainPort, host,  () => {
    shell.env.PORT = shell.env.PORT || mainPort;
    shell.exec('"./node_modules/.bin/nodemon" start.js -e js,jsx',  () => {});
    console.log('Webpack development server listening on http://%s:%s', host, mainPort);
});
