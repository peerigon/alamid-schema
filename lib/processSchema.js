"use strict";

var determineType = require("./determineType.js");

/**
 * extract keys, types, defaults from the schema object
 *
 * @param {Object} schema
 * @return {Object}
 */
function processSchema(schema) {
    var key,
        fieldDefinition,
        type,
        keys = [],
        types = {};

    for (key in schema) {
        if (schema.hasOwnProperty(key)) {
            keys.push(key);

            fieldDefinition = schema[key];
            //determine supported types
            type = determineType(fieldDefinition);
            types[key] = type;
        }
    }

    return {
        keys: keys,
        types: types
    };
}

module.exports = processSchema;