"use strict";

/**
 * Returns a required validator.
 *
 * @returns {Function}
 */
function requiredValidator() {
    return function validateRequired(val) {
        return (typeof val !== "undefined" && val !== null && val !== "") || "required";
    };
}

/**
 * Returns an enum validator.
 *
 * @param {Array} enumValues
 * @returns {Function}
 */
function enumValidator(enumValues) {
    return function validateEnum(val) {
        return enumValues.indexOf(val) !== -1 || "enum";
    };
}

/**
 * Returns a min validator.
 *
 * @param {number} minValue
 * @returns {Function}
 */
function minValidator(minValue) {
    return function validateMin(val) {
        return val >= minValue || "min";
    };
}

/**
 * Returns a max validator.
 *
 * @param {number} minValue
 * @returns {Function}
 */
function maxValidator(minValue) {
    return function validateMax(val) {
        return val <= minValue || "max";
    };
}

/**
 * Returns a minLength validator.
 *
 * @param {number} minLength
 * @returns {Function}
 */
function minLengthValidator(minLength) {
    return function validateMinLength(lengthable) {
        return lengthable && (lengthable.length >= minLength) || "min-length";
    };
}

/**
 * Returns a maxLength validator.
 *
 * @param {number} maxLength
 * @returns {Function}
 */
function maxLengthValidators(maxLength) {
    return function validateMaxLength(lengthable) {
        return lengthable && (lengthable.length <= maxLength) || "max-length";
    };
}

/**
 * Returns a hasLength validator.
 *
 * @param {number} hasLength
 * @returns {Function}
 */
function hasLengthValidator(hasLength) {
    return function validateHasLength(lengthable) {
        return lengthable && (lengthable.length === hasLength) || "has-length";
    };
}

exports.required = requiredValidator;
exports.min = minValidator;
exports.max = maxValidator;
exports.enum = enumValidator;
exports.minLength = minLengthValidator;
exports.maxLength = maxLengthValidators;
exports.hasLength = hasLengthValidator;
