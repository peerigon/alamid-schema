"use strict";

var determineType = require("./determineType.js");
var value = require("value");

/**
 * Normalizes the schema definition and extracts fields and types.
 *
 * @param {Object} definition
 * @returns {Object}
 */
function processDefinition(definition) {
    var fields = [];
    var types = {};
    var key;
    var fieldDefinition;
    var type;

    for (key in definition) {
        if (definition.hasOwnProperty(key)) {
            fields.push(key);

            fieldDefinition = definition[key];
            type = determineType(fieldDefinition);

            // Normalize the type definition
            if (value(fieldDefinition).getConstructor() === Object) {
                definition[key].type = type;
            } else {
                definition[key] = {
                    type: type
                };
            }

            if (value(fieldDefinition).getConstructor() === Object) {
                definition[key].writable = fieldDefinition.hasOwnProperty("writable") ? fieldDefinition.writable : true;
            } else {
                definition[key].writable = true;
            }

            if (value(fieldDefinition).getConstructor() === Object) {
                definition[key].readable = fieldDefinition.hasOwnProperty("readable") ? fieldDefinition.readable : true;
            } else {
                definition[key].readable = true;
            }

            types[key] = type;
        }
    }

    return {
        fields: fields,
        types: types
    };
}

module.exports = processDefinition;
