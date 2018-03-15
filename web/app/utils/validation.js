import isPostalCode from 'validator/lib/isPostalCode'
import isCreditCart from 'validator/lib/isCreditCard'

/**
 * Validates that the given full name has at least two
 * "words" (regex '\w') separated by at least one space
 * @param {string} fullName
 */
export const validateFullName = (fullName) => {
    return /\w+\s+\w+/.test(fullName)
}

/**
 * Checks to see if a credit card has expired given the expiry date.
 *
 * @param ccExpiry {string} expects a numeric string with the format "mmyy"
 */
export const validateCCExpiry = (ccExpiry) => {
    // Expects 'mmyy' format
    if (ccExpiry.length !== 4) {
        return false
    }
    const today = new Date()
    const thisMonth = today.getMonth() + 1 // month indexing begins at 0
    const thisYear = today.getFullYear() % 100
    const expMonth = parseInt(ccExpiry.substring(0, 2))
    const expYear = parseInt(ccExpiry.substring(2))

    if (thisYear > expYear) {
        return false
    } else if (thisYear === expYear && expMonth < thisMonth) {
        return false
    } else {
        return true
    }
}

/**
 * Validates the given credit card number
 * @param {string} ccNumber
 */
export const validateCCNumber = (ccNumber) => {
    return isCreditCart(ccNumber)
}

/**
 * Validates the given postal code according to the rules for the given country
 * @param {string} postalCode The postal code to validate
 * @param {string} countryId The country to validate for (country is any ISO-3166 "alpha-2" code)
 */
export const validatePostalCode = (postalCode, countryId) => {
    if (!countryId) {
        throw new Error('`countryId` must be supplied to this function')
    }

    // Custom validators
    if (countryId === 'IM') {
        // Reference: https://www.mrs.org.uk/pdf/postcodeformat.pdf and https://en.wikipedia.org/wiki/IM_postcode_area
        return /IM([1-9]|86|87|99)\s*\d[ABD-HJLNP-UWXYZ][ABD-HJLNP-UWXYZ]/.test(postalCode)
    }

    try {
        return isPostalCode(postalCode, countryId)
    } catch (e) {
        console.error(
            'validatePostalCode caught error from isPostalCode. ' +
            'This usually occurs when isPostalCode() is passed a countryId ' +
            `('${countryId}' in this case) that it does not support. ` +
            '\n\n' +
            `To fix this, update this function to validate '${countryId}' ` +
            'postal codes manually.\n\n', e)
        return false
    }
}
