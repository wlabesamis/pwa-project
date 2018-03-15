const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');

module.exports = {
    entry: './app/main.js',
    target: 'node',
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'main.js',
        library: 'main',
        libraryTarget: 'commonjs2'
    },
    externals: {
        express: 'commonjs express',
        jsdom: 'commonjs jsdom',
        encoding: 'commonjs encoding',
        ajv: 'commonjs ajv'
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
        alias: {
            'progressive-web-sdk': path.resolve(__dirname, 'node_modules/progressive-web-sdk'),
            'mobify-integration-manager': path.resolve(__dirname, 'node_modules/mobify-integration-manager')
        }
    },
    module: {
        rules: [
            {
                test: /\.js(x?)$/,
                exclude: /node_modules/,
                loader: 'babel-loader?cacheDirectory=true',
                options: {
                    plugins: ['syntax-dynamic-import']
                }
            },
            {
                test: /\.js(x?)$/,
                include: /progressive-web-sdk/,
                use: [
                    {loader: "imports-loader?window=>{location: {href: 'about:blank'}},window.addEventListener=>function(){}"}
                ],
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: 'css-loader?-autoprefixer&-url',
                        options: {
                            minimize: true
                        }
                    },
                    {
                        loader: 'postcss-loader'
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            includePaths: [path.join(__dirname, 'app', 'styles')]
                        }
                    }
                ]
            },
            {
                test: /\.svg$/,
                use: 'raw-loader'
            }
        ]
    },
    plugins: [
        new webpack.LoaderOptionsPlugin({
            options: {
                postcss: () => [
                    autoprefixer({
                        browsers: [
                            'iOS >= 9.0',
                            'Android >= 4.4.4',
                            'last 4 ChromeAndroid versions'
                        ]
                    })
                ]
            }
        }),
        new webpack.ProvidePlugin({
            fetch: 'node-fetch',
            URL: ['whatwg-url', 'URL']
        })
    ],
    devtool: 'sourcemap'
}
