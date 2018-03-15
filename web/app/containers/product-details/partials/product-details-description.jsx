/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {createPropsSelector} from 'reselect-immutable-helpers'
import {getProductDescription} from 'progressive-web-sdk/dist/store/products/selectors'

import {Accordion, AccordionItem} from 'progressive-web-sdk/dist/components/accordion'

const ProductDetailsDescription = ({description}) => (
    <div className="u-padding-top-md u-bg-color-neutral-10">
        <Accordion className="t-product-details__description u-bg-color-neutral-00" initialOpenItems={[0]}>
            <AccordionItem header="Product Description" closeIconName="close" openIconName="plus">
                <p itemProp="description">{description}</p>
            </AccordionItem>
        </Accordion>
    </div>
)

ProductDetailsDescription.propTypes = {
    description: PropTypes.string
}

const mapStateToProps = createPropsSelector({
    description: getProductDescription
})

export default connect(mapStateToProps)(ProductDetailsDescription)
