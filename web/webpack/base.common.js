/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

/* eslint-disable import/no-commonjs */
/* eslint-env node */

const autoprefixer = require('autoprefixer')
const WebpackNotifierPlugin = require('webpack-notifier')
const packageConfig = require('../package.json')

module.exports = {
    plugins: [
        new WebpackNotifierPlugin({
            title: `Mobify Project: ${packageConfig.name}`,
            excludeWarnings: true,
            skipFirstNotification: true
        }),
    ],
    postcss: () => {
        return [
            // Supported browser list is provided within package.json
            autoprefixer()
        ]
    },
    devServer: {
        compress: true
    }
}
