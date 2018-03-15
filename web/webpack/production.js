/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

/* eslint-disable import/no-commonjs */
/* eslint-env node */

const webpack = require('webpack')
const assign = require('lodash.assign')

const baseLoaderConfig = require('./base.loader')
const baseMainConfig = require('./base.main')
const workerConfig = require('./base.worker')
const nonPWAConfig = require('./base.non-pwa')
const onboardingConfig = require('./base.onboarding')
const translationsConfig = require('./base.translations')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

/*
 * Use UglifyJS to do tree-shaking and drop dead code. Because
 * we're building for production, we leave more of the UglifyJS
 * options at their defaults, which reduces the code size more
 * than a dev build.
 */
const uglifyPluginOptions = {
    ie8: false,
    compress: {
        // Leave the settings at the default, except for the tree-shaking
        // options (which we explictly enable) and the warnings (which we
        // explicitly disable).
        dead_code: true,
        unused: true,
        warnings: false
    },
    // This is necessary to get maps with the Uglify plugin, and for
    // production builds to succeed (even if we don't want source maps).
    sourceMap: true
}

// Add production flag to main app config
const productionMainConfig = assign(baseMainConfig, {
    // Extend base config with production settings here
    plugins: [].concat(baseMainConfig.plugins, [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
            DEBUG: false
        }),
        new webpack.optimize.UglifyJsPlugin(uglifyPluginOptions)
    ])
})

baseMainConfig.module.rules = baseMainConfig.module.rules.concat({
    test: /\.scss$/,
    loader: ExtractTextPlugin.extract(['css-loader?-autoprefixer&-url&minification', 'postcss-loader', 'sass-loader']),
    include: [
        /progressive-web-sdk/,
        /app/
    ]
})

baseLoaderConfig.plugins = baseLoaderConfig.plugins.concat([
    new webpack.DefinePlugin({
        DEBUG: false
    }),
    new webpack.optimize.UglifyJsPlugin(uglifyPluginOptions)
])

workerConfig.plugins = workerConfig.plugins.concat([
    new webpack.DefinePlugin({
        DEBUG: false
    }),
    new webpack.optimize.UglifyJsPlugin(uglifyPluginOptions)
])

nonPWAConfig.module.rules = nonPWAConfig.module.rules.concat({
    test: /\.scss$/,
    loader: ExtractTextPlugin.extract(['css-loader?-autoprefixer&-url&minification', 'postcss-loader', 'sass-loader']),
    include: [
        /node_modules\/progressive-web-sdk/,
        /app/,
        /non-pwa/
    ]
})

nonPWAConfig.plugins = nonPWAConfig.plugins.concat([
    new webpack.DefinePlugin({
        DEBUG: false
    }),
    new webpack.optimize.UglifyJsPlugin(uglifyPluginOptions)
])

onboardingConfig.plugins = onboardingConfig.plugins.concat([
    new webpack.DefinePlugin({
        DEBUG: false
    })
])

module.exports = [productionMainConfig, baseLoaderConfig, workerConfig, nonPWAConfig, onboardingConfig, translationsConfig]
