/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {createPropsSelector} from 'reselect-immutable-helpers'
import {
    getProductTitle,
    getProductPrice,
    getProductAvailability,
    getProductPageMeta,
    getProductHref,
    getProductId
} from 'progressive-web-sdk/dist/store/products/selectors'
import {getSelectedCurrency} from 'progressive-web-sdk/dist/store/app/selectors'

import * as selectors from '../selectors'
import {getCartURL, getWishlistURL} from '../../app/selectors'
import {isRunningInAstro} from '../../../utils/astro-integration'
import PageMeta from '../../../components/page-meta'

import SkeletonBlock from 'progressive-web-sdk/dist/components/skeleton-block'
import Breadcrumbs from 'progressive-web-sdk/dist/components/breadcrumbs'
import {FormattedPrice} from '../../../components/intl/index'

const ProductDetailsHeading = ({
    available,
    breadcrumbs,
    currency,
    title,
    price,
    pageMeta,
    isInCheckout,
    cartURL,
    isInWishlist,
    wishlistURL,
    productHref,
    productID
}) => {
    let breadcrumbItems = breadcrumbs

    if (isInCheckout) {
        breadcrumbItems = [{text: 'Cart', href: cartURL}]
    } else if (isInWishlist) {
        breadcrumbItems = [{text: 'Wishlist', href: wishlistURL}]
    }

    return (
        <div className="t-product-details-heading u-padding-md u-box-shadow u-position-relative u-z-index-1">
            <PageMeta {...pageMeta} />

            {!isRunningInAstro &&
                <div className="t-product-details__breadcrumbs u-margin-bottom-md">
                    <Breadcrumbs items={breadcrumbItems} includeMicroData />
                </div>
            }
            {title ?
                <h1 className="t-product-details-heading__title u-text-uppercase u-margin-bottom" itemProp="name">{title}</h1>
            :
                <SkeletonBlock width="50%" height="32px" className="u-margin-bottom" />
            }

            {(available !== null && available !== undefined && price !== null && price !== undefined) ?
                (price.length > 0 &&
                    <span
                        className="t-product-details-heading__price t-product-details__price u-color-accent u-text-weight-regular u-text-family-header u-text-letter-spacing-small"
                        itemScope
                        itemProp="offers"
                        itemType="http://schema.org/AggregateOffer"
                    >
                        <FormattedPrice value={price} />
                        <meta itemProp="priceCurrency" content={currency.code} />
                        <meta itemProp="availability" content="In Stock" />
                    </span>)
            :
                <SkeletonBlock width="25%" height="32px" />
            }
            <meta itemProp="productID" content={productID} />
            <meta itemProp="url" content={productHref} />
        </div>
    )
}

ProductDetailsHeading.propTypes = {
    available: PropTypes.bool,
    breadcrumbs: PropTypes.array,
    cartURL: PropTypes.string,
    currency: PropTypes.object,
    isInCheckout: PropTypes.bool,
    isInWishlist: PropTypes.bool,
    pageMeta: PropTypes.object,
    price: PropTypes.string,
    productHref: PropTypes.string,
    productID: PropTypes.string,
    title: PropTypes.string,
    wishlistURL: PropTypes.string
}

const mapStateToProps = createPropsSelector({
    available: getProductAvailability,
    breadcrumbs: selectors.getProductDetailsBreadcrumbs,
    cartURL: getCartURL,
    currency: getSelectedCurrency,
    title: getProductTitle,
    pageMeta: getProductPageMeta,
    price: getProductPrice,
    productHref: getProductHref,
    productID: getProductId,
    wishlistURL: getWishlistURL
})

export default connect(mapStateToProps)(ProductDetailsHeading)
