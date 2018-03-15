/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import {ampComponent} from 'mobify-amp-sdk/dist/amp-sdk'

// Components
import Img from 'mobify-amp-sdk/dist/components/img'
import ListTile from 'mobify-amp-sdk/dist/components/list-tile'
import ProductItem from '../product-item'

/**
 * Product Tile represents a product and its basic information: image,
 * link and price.
 */

const titleClassName = classNames(
    'c-product-tile__name',
    'u-h4',
    'u-text-family',
    'u-text-weight-medium',
    'u-color-neutral-60'
)

const ProductImage = ({src, alt}) => (
    <Img
        src={src}
        alt={alt}
        layout="fixed"
        height="150px"
        width="120px"
        />
)

ProductImage.propTypes = {
    alt: PropTypes.string,
    src: PropTypes.string
}

const ProductTile = ({className, thumbnail, href, price, title}) => {

    return (
        <ListTile className="c-product-tile" href={href}>
            <ProductItem customWidth="45%"
                className={classNames('u-align-center', className)}
                title={<h2 className={titleClassName}>{title}</h2>}
                price={<span className="u-text-weight-bold u-color-error">{price}</span>}
                image={<ProductImage {...thumbnail} />} />
        </ListTile>
    )
}

ProductTile.propTypes = {
    /**
     * Optional className for the product tile
     */
    className: PropTypes.string,
    href: PropTypes.string,
    price: PropTypes.string,
    thumbnail: PropTypes.shape({
        alt: PropTypes.string.isRequired,
        src: PropTypes.string.isRequired,
    }),
    title: PropTypes.string
}

export default ampComponent(ProductTile)
