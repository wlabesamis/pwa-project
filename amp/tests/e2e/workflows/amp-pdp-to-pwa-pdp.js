/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2017 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import process from 'process'
import AmpPdp from '../page-objects/amp-pdp'
import PwaPdp from '../page-objects/pwa-pdp'

const ENV = process.env.NODE_ENV || 'test'

let ampPdp
let pwaPdp

let productName

export default {
    '@tags': ['amp'],

    before: (browser) => {
        ampPdp = new AmpPdp(browser)
        pwaPdp = new PwaPdp(browser)

        // NOTE: There is a bug in chromedriver causing the left-click to open the
        // context menu and stall the test. Overriding the click to use a triggerClick
        // fixes this for now. Ensure this is removed when the bug is fixed.
        // https://bugs.chromium.org/p/chromedriver/issues/detail?id=2172
        browser.click = (selector) => {

            selector = `${selector}`
            browser.triggerClick.apply(this, [selector])

            return browser
        }
    },

    after: (browser) => {
        if (ENV === 'debug') {
            console.log('Debugging, not closing browser')
        } else {
            browser.end()
        }
    },

    'Open AMP Product Detail Page': (browser) => {
        browser
            .url('http://localhost:3000/eye-of-newt.html')
            .waitForElementVisible(ampPdp.selectors.pdp)
    },

    'Select Options & Buy': (browser) => {
        browser
            .getText(ampPdp.selectors.productName, (expectedProductName) => {
                productName = expectedProductName.value
            })
            .waitForElementVisible(ampPdp.selectors.selectOptions)
            .verify.attributeContains(ampPdp.selectors.selectOptions, 'href', 'mobify_id')
            .click(ampPdp.selectors.selectOptions)
    },

    'Verify we are in PWA and Add To Cart form is visible': (browser) => {
        browser
            .waitForElementVisible(pwaPdp.selectors.pdp)
            .getText(pwaPdp.selectors.productName, (actualProductName) => {
                browser.verify.equal(productName.toLowerCase(), actualProductName.value.toLowerCase())
            })
            .waitForElementVisible(pwaPdp.selectors.addToCart)
            .verify.visible(pwaPdp.selectors.addToCart)
    },
}
