"use strict";

var value = require("value"),
    defaultValidators = require("./validators.js");

/**
 * Runs the given validators on a single field
 *
 * @private
 * @param {Array} validators
 * @param {*} field
 * @param {Object} context
 * @param {Function} callback
 */
function runValidation(validators, field, context, callback) {
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
        //async
        if (validator.length === 2) {
            validator.call(context, field, validationDone);
        }
        //sync
        else {
            //no setImmediate on client!
            setTimeout(function () {
                validationDone(validator.call(context, field));
            }, 0);
        }
    });
}

/**
 * Adds validation methods to the schema
 *
 * @param {Function} Schema
 */
function validationPlugin(Schema) {

    var constructor = Schema.prototype.constructor;

    Schema.prototype.constructor = function (name, schema) {
        var key,
            fieldDefinition;

        if (arguments.length === 1) {
            schema = arguments[0];
        }

        //call super constructor
        constructor.apply(this, arguments);

        this.validators = {};

        for (key in schema) {
            if (schema.hasOwnProperty(key)) {
                fieldDefinition = schema[key];
                this.validators[key] = [];

                //predefined validators
                if (fieldDefinition.required) {
                    this.validators[key].push(defaultValidators.required());
                }
                if (value(fieldDefinition.enum).typeOf(Array)) {
                    this.validators[key].push(defaultValidators.enum(fieldDefinition.enum));
                }

                if (value(fieldDefinition.min).typeOf(Number)) {
                    this.validators[key].push(defaultValidators.min(fieldDefinition.min));
                }

                if (value(fieldDefinition.max).typeOf(Number)) {
                    this.validators[key].push(defaultValidators.max(fieldDefinition.max));
                }

                //custom validators
                if (value(fieldDefinition.validate).typeOf(Function)) {
                    this.validators[key].push(fieldDefinition.validate);
                } else if (value(fieldDefinition.validate).typeOf(Array)) {
                    this.validators[key] = this.validators[key].concat(fieldDefinition.validate);
                }
            }
        }
    };

    /**
     * Validate if given model matches schema-definition
     * @param {Object} model
     * @param {Function} callback
     */
    Schema.prototype.validate = function (model, callback) {
        var self = this,
            pending = 0,
            result = {
                model: model,
                result: true,
                failedFields: {}
            };

        if(value(model).notTypeOf(Object)) {
            throw new TypeError("Model must be an object");
        }

        if (this.keys.length === 0) {
            setTimeout(function () {
                callback(result);
            }, 0);

            return;
        }

        this.keys.forEach(function (key) {
            if (self.validators[key].length === 0) {
                return;
            }

            pending++;
            runValidation(self.validators[key], model[key], model, function (res) {
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