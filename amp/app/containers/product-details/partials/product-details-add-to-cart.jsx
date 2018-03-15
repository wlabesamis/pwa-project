/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {createPropsSelector} from 'reselect-immutable-helpers'
import {canonicalURL} from '../../../utils'
import {ADD_TO_CART_FORM_NAME} from '../../../../../web/app/store/form/constants'

// Components
import Button from 'mobify-amp-sdk/dist/components/button'

// Selectors
import {getCurrentUrl} from 'progressive-web-sdk/dist/store/app/selectors'

const ProductDetailsAddToCart = ({currentUrl}) => {

    return (
        <div className="u-padding-start-md u-padding-end-md">
            <Button
                href={`${canonicalURL(currentUrl)}#${ADD_TO_CART_FORM_NAME}`}
                className="a--primary u-width-full u-text-uppercase u-margin-bottom-lg t-product-details__add-to-cart"
            >
                Select Options & Buy
            </Button>
        </div>
    )
}

ProductDetailsAddToCart.propTypes = {
    currentUrl: PropTypes.string
}

const mapStateToProps = createPropsSelector({
    currentUrl: getCurrentUrl
})

export default connect(mapStateToProps)(ProductDetailsAddToCart)
