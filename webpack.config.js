const path = require('path');
const { CheckerPlugin } = require('awesome-typescript-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HOST = 'localhost';
const GUI_PORT = 3000;
const MW_URL = process.env.MW_URL || "http://localhost:" + 5000;

module.exports = {
    resolve: { extensions: ['.ts', '.js'] },
    resolveLoader: {
        modules: ['node_modules', path.resolve(__dirname, 'loaders')]
    },
    plugins: [
        new CheckerPlugin(),
        new HtmlWebpackPlugin({
            template: './gui/src/index.html',
            favicon: './gui/src/favicon.ico'
        })
    ],
    entry: {
        app: './gui/src/index.ts'
    },
    output: {
        path: path.resolve(process.cwd(), './dist/gui'),
        filename: '[name].bundle.js',
        chunkFilename: '[name].bundle.js'
    },
    devtool: 'eval',
    module: {
        rules: [
            { include: /\.json$/, loaders: ["json-loader"] },
            {
                test: /\.ts$/,
                use: [
                    'ng-annotate-loader',
                    'awesome-typescript-loader'
                ],
                exclude: /node_modules/
            }, {
                test: /\.(png|jpg|jpeg|gif)$/,
                loader: 'file-loader?name=[name].[ext]?[hash]'
            }, {
                test: /\.html$/,
                exclude: /index\.html/,
                use: [{
                    loader: 'html-loader',
                    options: {
                        root: path.join(__dirname, '..', 'src/assets').replace(/^([A-Z]:)/, v => v.toUpperCase()),
                        attrs: [
                            'img:src',
                            'proteus-data-and-reporting-sub-menu:icon-path',
                            'link:href'
                        ]
                    }
                }],
            },
            {
                test: /\.less$/,
                use: ['style-loader', 'css-loader?sourceMap', 'less-loader?sourceMap']
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader?sourceMap']
            },
            { test: /\.woff(2)?(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader?name=[name].[ext]" },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader?name=[name].[ext]" },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader?name=[name].[ext]" },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader?name=[name].[ext]" }
        ],
    },
    devServer: {
        contentBase: "build/",
        host: "0.0.0.0",
        public: `${HOST}:${GUI_PORT}`,
        port: GUI_PORT,
        proxy: {
            '/api': MW_URL
        },
        stats: {
            modules: false,
            cached: false,
            colors: true,
            chunk: false
        }
    }
};