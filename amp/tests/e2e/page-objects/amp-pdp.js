/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2017 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

const selectors = {
    pdp: '.t-app.amp-mode-touch .t-product-details',
    productName: '.t-product-details-heading__title',
    selectOptions: '.t-app.amp-mode-touch .t-product-details__add-to-cart'
}

const AmpPdp = function(browser) {
    this.browser = browser
    this.selectors = selectors
}

export default AmpPdp
