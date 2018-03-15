/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {createPropsSelector} from 'reselect-immutable-helpers'

import {initShippingPage} from './actions'
import {getCartURL} from '../app/selectors'
import {isRunningInAstro, trigger} from '../../utils/astro-integration'
import {formatMessage} from '../../components/intl/index'

import template from '../../template'
import PageMeta from '../../components/page-meta'
import CheckoutShippingReduxForm from './partials/checkout-shipping-form'

import {ProgressSteps, ProgressStepsItem} from 'progressive-web-sdk/dist/components/progress-steps'
import {getCheckoutPageMeta} from 'progressive-web-sdk/dist/store/checkout/selectors'

const CheckoutShipping = ({cartURL, pageMeta}, context) => {
    if (isRunningInAstro) {
        trigger('checkout:enable-alert')
    }

    return (
        <div className="t-checkout-shipping u-bg-color-neutral-10 t--loaded">
            <PageMeta {...pageMeta} />

            <div className="u-bg-color-neutral-00 u-border-light-bottom">
                <div className="t-checkout-shipping__progress">
                    <ProgressSteps>
                        <ProgressStepsItem
                            icon="cart-full"
                            title={formatMessage(context, {id: 'checkoutShipping.progress.cart'})}
                            href={cartURL}
                        />

                        <ProgressStepsItem
                            icon="shipping"
                            title={formatMessage(context, {id: 'checkoutShipping.progress.shipping'})}
                            current
                        />

                        <ProgressStepsItem
                            icon="payment-full"
                            title={formatMessage(context, {id: 'checkoutShipping.progress.payment'})}
                        />

                        <ProgressStepsItem
                            icon="done"
                            title={formatMessage(context, {id: 'checkoutShipping.progress.done'})}
                        />
                    </ProgressSteps>
                </div>
            </div>

            <CheckoutShippingReduxForm />
        </div>
    )
}

CheckoutShipping.propTypes = {
    /**
    * The relative URL for the cart page
    */
    cartURL: PropTypes.string,
    pageMeta: PropTypes.object,
}

CheckoutShipping.contextTypes = {
    intl: PropTypes.object,
}

CheckoutShipping.initAction = initShippingPage

const mapStateToProps = createPropsSelector({
    cartURL: getCartURL,
    pageMeta: getCheckoutPageMeta
})

export default template(connect(
    mapStateToProps
)(CheckoutShipping))
