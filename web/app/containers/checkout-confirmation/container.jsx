/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {createPropsSelector} from 'reselect-immutable-helpers'

import {initialize} from './actions'
import template from '../../template'
import PageMeta from '../../components/page-meta'
import {trigger} from '../../utils/astro-integration'

import CheckoutConfirmationSplash from './partials/checkout-confirmation-splash'
import CheckoutConfirmationDetails from './partials/checkout-confirmation-details'
import CheckoutConfirmationQuestions from './partials/checkout-confirmation-questions'

import {getCheckoutPageMeta} from 'progressive-web-sdk/dist/store/checkout/selectors'

class CheckoutConfirmation extends React.Component {
    componentDidMount() {
        trigger('checkout:completed')
    }

    render() {
        return (
            <div className="t-checkout-confirmation">
                <PageMeta {...this.props.pageMeta} />
                <CheckoutConfirmationSplash />
                <CheckoutConfirmationDetails />
                <CheckoutConfirmationQuestions />
            </div>
        )
    }
}

CheckoutConfirmation.propTypes = {
    pageMeta: PropTypes.object
}

const mapStateToProps = createPropsSelector({
    pageMeta: getCheckoutPageMeta
})

CheckoutConfirmation.initAction = initialize

export default template(connect(mapStateToProps)(CheckoutConfirmation))
