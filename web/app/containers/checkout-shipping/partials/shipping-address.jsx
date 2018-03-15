/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {createPropsSelector} from 'reselect-immutable-helpers'
import * as ReduxForm from 'redux-form'
import classNames from 'classnames'

import {setShowAddNewAddress, onSavedShippingAddressChange} from '../actions'
import {ADD_NEW_ADDRESS_FIELD, SAVED_SHIPPING_ADDRESS_FIELD} from '../constants'
import {getIsLoggedIn, getSavedAddresses} from 'progressive-web-sdk/dist/store/user/selectors'
import {getShowAddNewAddress} from '../selectors'

import Field from 'progressive-web-sdk/dist/components/field'
import FieldRow from 'progressive-web-sdk/dist/components/field-row'
import ShippingAddressFields from './shipping-address-fields'
import {UI_NAME} from 'progressive-web-sdk/dist/analytics/data-objects/'

import {FormattedText} from '../../../components/intl/index'

const ShippingAddressForm = ({
    handleShowAddNewAddress,
    isLoggedIn,
    onSavedShippingAddressChange,
    savedAddresses,
    showAddNewAddress
}) => {
    const renderSavedAddress = (address) => {
        const {
            city,
            countryId,
            firstname,
            id,
            lastname,
            postcode,
            regionCode,
            addressLine1,
            addressLine2
        } = address
        const street = [addressLine1, addressLine2].filter((item) => item).join(', ')
        const shippingAddress = (
            <div className="u-color-neutral-40">
                <p className="u-margin-bottom-sm">
                    {city}, {regionCode}, {countryId}, {postcode}
                </p>
                <p>{firstname} {lastname}</p>
            </div>
        )

        return (
            <FieldRow key={id}>
                <ReduxForm.Field
                    component={Field}
                    name={SAVED_SHIPPING_ADDRESS_FIELD}
                    label={
                        <strong className="u-text-weight-semi-bold">{street}</strong>
                    }
                    caption={shippingAddress}
                    type="radio"
                    value={id}
                    customEventHandlers={{
                        onChange: () => {
                            handleShowAddNewAddress(false)
                            onSavedShippingAddressChange(id, address)
                        }
                    }}
                >
                    <input
                        type="radio"
                        noValidate
                        value={id}
                        data-analytics-name={UI_NAME.savedAddress}
                    />
                </ReduxForm.Field>
            </FieldRow>
        )
    }

    const renderAddressFormOrSavedAddressesOrBoth = () => {
        if (isLoggedIn && !!savedAddresses.length) {
            const classes = classNames('t-checkout-payment__add-new-address', {
                'u-border-light u-padding-md': showAddNewAddress
            })

            return [
                savedAddresses.map(renderSavedAddress),
                <FieldRow key={ADD_NEW_ADDRESS_FIELD} className={classes}>
                    <div className="u-flex">
                        <ReduxForm.Field
                            component={Field}
                            name={SAVED_SHIPPING_ADDRESS_FIELD}
                            label={
                                <strong className="u-text-weight-semi-bold">
                                    <FormattedText messageId="checkoutShipping.form.addNewAddress" />
                                </strong>
                            }
                            type="radio"
                            value={ADD_NEW_ADDRESS_FIELD}
                            customEventHandlers={{
                                onChange: () => {
                                    handleShowAddNewAddress(true)

                                    // Reset checkout shippingAddress and defaultShippingAddressId
                                    onSavedShippingAddressChange()
                                }
                            }}
                        >
                            <input
                                type="radio"
                                noValidate
                                value={ADD_NEW_ADDRESS_FIELD}
                                data-analytics-name={UI_NAME.addNewAddress}
                            />
                        </ReduxForm.Field>

                        {showAddNewAddress &&
                            <div className="t-checkout-payment__add-new-address-form">
                                <ShippingAddressFields />
                            </div>
                        }
                    </div>
                </FieldRow>
            ]
        } else {
            return <ShippingAddressFields />
        }
    }

    return (<div className="t-checkout-shipping__shipping-address">
        <div className="t-checkout-shipping__title u-padding-top-lg u-padding-bottom-md">
            <h2 className="u-h4 u-text-uppercase">
                <FormattedText messageId="checkoutShipping.heading.shippingAddress" />
            </h2>
        </div>

        <div className="u-padding-md u-border-light-top u-border-light-bottom u-bg-color-neutral-00">
            {renderAddressFormOrSavedAddressesOrBoth()}
        </div>
    </div>)
}

ShippingAddressForm.propTypes = {
    /**
     * Whether the form is disabled or not
     */
    disabled: PropTypes.bool,

    /**
    * The title for the form
    */
    formTitle: PropTypes.string,

    /**
     * Handles whether or not to show the "Add New Address" form fields
     */
    handleShowAddNewAddress: PropTypes.func,

    /**
    * (Internal) added by redux form
    */
    invalid: PropTypes.bool,

    /**
     * Whether the user is logged in or not
     */
    isLoggedIn: PropTypes.bool,

    /**
    * Saved addresses from the user's account
    */
    savedAddresses: PropTypes.array,

    /**
    * Whether or not to show the "Add New Addres" form fields
    */
    showAddNewAddress: PropTypes.bool,

    /**
    * (Internal) Added by redux form
    */
    submitting: PropTypes.bool,

    /**
     * Fetch shipping methods on saved address selection change
     */
    onSavedShippingAddressChange: PropTypes.func,
}

const mapStateToProps = createPropsSelector({
    isLoggedIn: getIsLoggedIn,
    savedAddresses: getSavedAddresses,
    showAddNewAddress: getShowAddNewAddress
})

const mapDispatchToProps = {
    handleShowAddNewAddress: setShowAddNewAddress,
    onSavedShippingAddressChange
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ShippingAddressForm)
