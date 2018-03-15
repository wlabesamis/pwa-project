/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import React from 'react'
import PropTypes from 'prop-types'
import {reduxForm} from 'redux-form'
import {createPropsSelector} from 'reselect-immutable-helpers'
import {connect} from 'react-redux'
import {isRegisterLoaded} from '../selectors'
import {submitRegisterForm} from '../actions'

import Button from 'progressive-web-sdk/dist/components/button'
import FieldSet from 'progressive-web-sdk/dist/components/field-set'

import {LoginField} from './common'
import ExtraField from '../../../components/extra-field'

import {UI_NAME} from 'progressive-web-sdk/dist/analytics/data-objects/'
import {REGISTER_FORM_NAME} from '../../../store/form/constants'

import {
    getRegisterUserEnhancementInitialValues,
    getRegisterUserEnhancementFields
} from 'mobify-integration-manager/dist/connectors/hybris/selectors'

class RegisterForm extends React.Component {
    constructor(props) {
        super(props)

        this.onSubmit = this.onSubmit.bind(this)
    }

    onSubmit(values) {
        return this.props.submitForm(values)
    }

    render() {
        const {
            error,
            submitting,
            handleSubmit,
            isFormLoaded,
            extraFields
        } = this.props

        return (
            <form id={REGISTER_FORM_NAME} data-analytics-name={UI_NAME.register} noValidate={true} onSubmit={handleSubmit(this.onSubmit)}>
                {error &&
                    <div className="u-margin-bottom-md u-color-error">
                        {error}
                    </div>
                }

                <FieldSet className="t-login__register-fieldset">
                    <ExtraField name="titleCode" extraFields={extraFields} />

                    <LoginField
                        label="First Name"
                        name="firstname"
                        type="text"
                        analyticsName={UI_NAME.firstName}
                        />

                    <LoginField
                        label="Last Name"
                        name="lastname"
                        type="text"
                        analyticsName={UI_NAME.lastName}
                        />

                    <LoginField
                        label="Email"
                        name="email"
                        type="email"
                        analyticsName={UI_NAME.email}
                        />

                    <LoginField
                        label="Sign Up for Newsletter"
                        name="is_subscribed"
                        type="checkbox"
                        analyticsName={UI_NAME.subscribe}
                        />
                </FieldSet>

                <FieldSet className="t-login__register-fieldset">
                    <LoginField
                        label="Password"
                        name="password"
                        type="password"
                        analyticsName={UI_NAME.password}
                        isPassword
                        />

                    <LoginField
                        label="Confirm Password"
                        name="password_confirmation"
                        type="password"
                        analyticsName={UI_NAME.confirmPassword}
                        isPassword
                        />
                </FieldSet>

                <Button
                    className="pw--primary u-width-full u-margin-top-lg"
                    type="submit"
                    disabled={submitting || !isFormLoaded}
                    data-analytics-name={UI_NAME.register}
                >
                    <span className="u-text-uppercase">Create an Account</span>
                </Button>
            </form>
        )
    }
}

RegisterForm.propTypes = {
    error: PropTypes.string,
    extraFields: ExtraField.propTypes.extraFields, // Just piggy back on the existing definition
    handleSubmit: PropTypes.func,
    isFormLoaded: PropTypes.bool,
    submitForm: PropTypes.func,
    submitting: PropTypes.bool,
}


const ReduxRegisterForm = reduxForm({
    form: REGISTER_FORM_NAME
})(RegisterForm)

const mapStateToProps = createPropsSelector({
    initialValues: getRegisterUserEnhancementInitialValues,
    isFormLoaded: isRegisterLoaded,
    extraFields: getRegisterUserEnhancementFields
})

const mapDispatchToProps = {
    submitForm: submitRegisterForm
}

export default connect(mapStateToProps, mapDispatchToProps)(ReduxRegisterForm)
