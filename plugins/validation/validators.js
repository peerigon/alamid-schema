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

exports.required = requiredValidator;
exports.min = minValidator;
exports.max = minValidator;
exports.enum = enumValidator;