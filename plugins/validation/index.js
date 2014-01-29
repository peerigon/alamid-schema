"use strict";

var value = require("value"),
    defaultValidators = require("./validators.js");

/**
 * validate a single <field>
 *
 * @param {Array} validators
 * @param {*} field
 * @param {Object} context
 * @param {Function} callback
 */
function validateField(validators, field, context, callback) {
    var result = [],
        pending = validators.length;

    function validationDone(res) {
        pending--;

        if (res !== true) {
            result.push(res);
        }

        if (pending === 0) {
            callback(result);
        }
    }

    validators.forEach(function (validator) {
        //sync
        if (validator.length === 1) {
            setImmediate(validationDone, validator.call(context, field));
        }
        //async
        else {
            validator.call(context, field, validationDone);
        }
    });
}

/**
 * Validation Plugin
 * adds an .validate method to the Schema
 *
 * @param {Function} Schema
 */
function validationPlugin(Schema) {

    Schema._init.push(function (schema) {
        var key,
            fieldDefinition,
            validators = {};

        for (key in schema) {
            if (schema.hasOwnProperty(key)) {
                fieldDefinition = schema[key];
                validators[key] = [];

                //predefined validators
                if (fieldDefinition.required) {
                    validators[key].push(defaultValidators.required());
                }
                if (value(fieldDefinition.enum).typeOf(Array)) {
                    validators[key].push(defaultValidators.enum(fieldDefinition.enum));
                }

                if (value(fieldDefinition.min).typeOf(Number)) {
                    validators[key].push(defaultValidators.min(fieldDefinition.min));
                }

                if (value(fieldDefinition.max).typeOf(Number)) {
                    validators[key].push(defaultValidators.min(fieldDefinition.max));
                }

                //custom validators
                if (value(fieldDefinition.validate).typeOf(Function)) {
                    validators[key].push(fieldDefinition.validate);
                } else if (value(fieldDefinition.validators).typeOf(Array)) {
                    validators[key] = validators[key].concat(fieldDefinition.validators);
                }
            }
        }

        this.validators = validators;
    });

    /**
     * validate if given <data> matches schema-definition
     * @param {Object} data
     * @param {Function} callback
     */
    Schema.prototype.validate = function validate(data, callback) {
        var self = this,
            pending = 0,
            result = {
                result: true,
                failedFields: {}
            };

        this.keys.forEach(function (key) {
            if (self.validators[key].length === 0) {
                return;
            }

            pending++;
            validateField(self.validators[key], data[key], data, function (res) {
                pending--;

                if (res.length > 0) {
                    result.result = false;
                    result.failedFields[key] = res;
                }

                if (pending === 0) {
                    callback(result);
                }
            });
        });
    };
}

module.exports = validationPlugin;