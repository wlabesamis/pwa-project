/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

/* eslint-disable import/no-commonjs */

const webpack = require('webpack')
const ip = require('ip')

const loaderConfig = require('./base.loader')
const mainConfig = require('./base.main')
const workerConfig = require('./base.worker')
const nonPWAConfig = require('./base.non-pwa')
const onboardingConfig = require('./base.onboarding')
const translationsConfig = require('./base.translations')

const CompressionPlugin = require('compression-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

mainConfig.module.rules = mainConfig.module.rules.concat({
    test: /\.scss$/,
    loader: ExtractTextPlugin.extract(['css-loader?-autoprefixer&-url', 'postcss-loader', 'sass-loader']),
    include: [
        /node_modules\/progressive-web-sdk/,
        /app/
    ]
})

mainConfig.output.publicPath = `https://${ip.address()}:8443/`

/*
 * Use UglifyJS to do tree-shaking and drop dead code. We don't want to
 * do complete uglification; that makes debugging more difficult.
 */
const uglifyPluginOptions = {
    ie8: false,
    compress: {
        // These options configure dead-code removal
        dead_code: true,
        unused: true,

        // These options configure uglification. For development,
        // we don't uglify completely.
        booleans: false,
        cascade: false,
        collapse_vars: false,
        comparisons: false,
        conditionals: false,
        drop_debugger: false,
        evaluate: false,
        if_return: false,
        join_vars: true,
        keep_fnames: true,
        loops: false,
        properties: true,
        reduce_vars: false,
        screw_ie8: false,
        sequences: false,
        warnings: false
    },
    mangle: false,
    // This is necessary to get maps with the Uglify plugin
    sourceMap: true
}

/*
 * Produce compressed (gzipped) versions of assets so that the development
 * (preview) server can serve them. Production doesn't need this, because
 * the CDN handles it.
 */
const compressionPluginOptions = {
    algorithm: 'gzip',
    test: /\.(js|html|css)$/,
    threshold: 2048,
    minRatio: 0.8
}

mainConfig.plugins = mainConfig.plugins.concat([
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
        DEBUG: true
    }),
    new webpack.optimize.UglifyJsPlugin(uglifyPluginOptions),
    new CompressionPlugin(compressionPluginOptions)
])

loaderConfig.plugins = loaderConfig.plugins.concat([
    new webpack.DefinePlugin({
        DEBUG: true
    }),
    new webpack.optimize.UglifyJsPlugin(uglifyPluginOptions),
    new CompressionPlugin(compressionPluginOptions)
])

workerConfig.plugins = workerConfig.plugins.concat([
    new webpack.DefinePlugin({
        DEBUG: true
    }),
    new webpack.optimize.UglifyJsPlugin(uglifyPluginOptions),
    new CompressionPlugin(compressionPluginOptions)
])

nonPWAConfig.module.rules = nonPWAConfig.module.rules.concat({
    test: /\.scss$/,
    loader: ExtractTextPlugin.extract(['css-loader?-autoprefixer&-url', 'postcss-loader', 'sass-loader']),
    include: [
        /node_modules\/progressive-web-sdk/,
        /app/,
        /non-pwa/
    ]
})

nonPWAConfig.plugins = nonPWAConfig.plugins.concat([
    new webpack.DefinePlugin({
        DEBUG: true
    }),
    new webpack.optimize.UglifyJsPlugin(uglifyPluginOptions),
    new CompressionPlugin(compressionPluginOptions)
])

onboardingConfig.plugins = onboardingConfig.plugins.concat([
    new webpack.DefinePlugin({
        DEBUG: true
    })
])

module.exports = [mainConfig, loaderConfig, workerConfig, nonPWAConfig, onboardingConfig, translationsConfig]
