"use strict";

var isArray = Array.isArray;

function merge(source, target) {
    var key;
    var sourceValue;
    var targetValue;

    for (key in source) {
        if (source.hasOwnProperty(key)) {
            sourceValue = source[key];
            targetValue = target[key];

            if (isArray(targetValue) || isArray(sourceValue)) {
                target[key] = [].concat(sourceValue, targetValue);
            } else if (isObject(targetValue) && isObject(sourceValue)) {
                target[key] = merge(sourceValue, targetValue);
            } else if (target.hasOwnProperty(key) === false) {
                target[key] = sourceValue;
            }
        }
    }

    return target;
}

function isObject(obj) {
    return obj !== null && typeof obj === "object";
}

module.exports = merge;
