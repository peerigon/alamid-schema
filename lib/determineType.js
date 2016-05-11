"use strict";

var value = require("value");

var supportedTypes = [
    "String",
    "Number",
    "Boolean",
    "Date",
    "Array",
    "Object"
];
var fnName = /function ([a-z]+?)\(/i;

/**
 * Determine the type of an object. Inspired by mongoose.
 *
 * @param {*} obj
 * @returns {string}
 */
function determineType(obj) {
    var type;
    var typeValue;
    var name;

    if (value(obj).typeOf(Object)) {
        type = obj.type || "Object";
    } else {
        type = obj;
    }

    typeValue = value(type);

    if (typeValue.typeOf(String)) {
        name = type.charAt(0).toUpperCase() + type.substring(1);
        return supportedTypes.indexOf(name) === -1 ? "String" : name;
    } else if (typeValue.typeOf(Function)) {
        name = type.toString().match(fnName)[1];
    } else if (typeValue.typeOf(Object)) {
        if (type.type) {
            name = type.type;
        } else {
            return "Object";
        }
    } else {
        name = type.constructor.toString().match(fnName)[1];
    }

    if (supportedTypes.indexOf(name) === -1) {
        throw new TypeError("Type '" + name + "' is not supported");
    }

    return name;
}

module.exports = determineType;
