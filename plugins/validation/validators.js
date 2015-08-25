"use strict";

/**
 * returns a required validator
 * @returns {Function}
 */
function requiredValidator() {
    return function validateRequired(val) {
        return (val !== undefined && val !== null && val !== "") || "required";
    };
}

/**
 * returns an enum validator
 * @param {Array} enumValues
 * @return {Function}
 */
function enumValidator(enumValues) {
    return function validateEnum(val) {
        return enumValues.indexOf(val) !== -1 || "enum";
    };
}

/**
 * returns a min validator
 * @param {Number} minValue
 * @return {Function}
 */
function minValidator(minValue) {
    return function validateMin(val) {
        return val >= minValue || "min";
    };
}

/**
 * returns a max validator
 * @param {Number} minValue
 * @return {Function}
 */
function maxValidator(minValue) {
    return function validateMax(val) {
        return val <= minValue || "max";
    };
}

/**
 * returns a minLength validator
 * @param {Number} minLength
 * @return {Function}
 */
function minLengthValidator(minLength) {
    return function validateMinLength(lengthable) {
        return lengthable.length >= minLength || "minLength";
    }
}

/**
 * returns a maxLength validator
 * @param {Number} maxLength
 * @returns {Function}
 */
function maxLengthValidators(maxLength) {
    return function validateMaxLength(lengthable) {
        return lengthable.length <= maxLength || "maxLength"
    }
}

/**
 * returns a hasLength validator
 * @param {Number} hasLength
 * @return {Function}
 */
function hasLengthValidator(hasLength) {
    return function validateHasLength(lengthable) {
        return lengthable.length === hasLength || "hasLength"
    }
}

exports.required = requiredValidator;
exports.min = minValidator;
exports.max = maxValidator;
exports.enum = enumValidator;
exports.minLength = minLengthValidator;
exports.maxLength = maxLengthValidators;
exports.hasLength = hasLengthValidator;