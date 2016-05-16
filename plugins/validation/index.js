"use strict";

var value = require("value");
var defaultValidators = require("./validators.js");

/**
 * Runs the given validators on a single field.
 *
 * Caution: callback will be called in synchronously in some situations. This behavior should usually be avoided in
 * public APIs, but since runValidation() is internal, we know how to deal with it. It allows us to speed up
 * validation and to return all synchronous validation results as soon as possible.
 *
 * The final callback, however, is guaranteed to be asynchronous.
 *
 * @param {Array} validators
 * @param {*} field
 * @param {Object} context
 * @param {Function} callback
 * @returns {Array}
 */
function runValidation(validators, field, context, callback) {
    var fieldErrors = [];
    var pending = 0;

    function saveResult(result) {
        if (result !== true) {
            fieldErrors.push(result);
        }
    }

    function doCallback() {
        callback(fieldErrors);
    }

    function asyncValidationDone(result) {
        saveResult(result);
        pending--;
        pending === 0 && doCallback();
    }

    validators.forEach(function (validator) {
        if (validator.length === 2) {
            pending++;
            validator.call(context, field, asyncValidationDone);
        } else {
            saveResult(validator.call(context, field));
        }
    });

    if (pending === 0) {
        // synchronous callback
        doCallback();
    }

    return fieldErrors;
}

/**
 * Adds validation methods to the schema.
 *
 * @param {Function} Schema
 */
function validationPlugin(Schema) {
    var constructor = Schema.prototype.constructor;

    Schema.prototype.constructor = function (name, schema) {
        var key;
        var fieldDefinition;

        if (arguments.length === 1) {
            schema = arguments[0];
        }

        // call super constructor
        constructor.apply(this, arguments);

        this.validators = {};

        for (key in schema) {
            if (schema.hasOwnProperty(key)) {
                fieldDefinition = schema[key];
                this.validators[key] = [];

                // predefined validators
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

                if (value(fieldDefinition.minLength).typeOf(Number)) {
                    this.validators[key].push(defaultValidators.minLength(fieldDefinition.minLength));
                }

                if (value(fieldDefinition.maxLength).typeOf(Number)) {
                    this.validators[key].push(defaultValidators.maxLength(fieldDefinition.maxLength));
                }

                if (value(fieldDefinition.hasLength).typeOf(Number)) {
                    this.validators[key].push(defaultValidators.hasLength(fieldDefinition.hasLength));
                }

                // The matches validators works on all types, so we just check if the key is present
                if ("matches" in fieldDefinition) {
                    this.validators[key].push(defaultValidators.matches(fieldDefinition.matches));
                }

                // custom validators
                if (value(fieldDefinition.validate).typeOf(Function)) {
                    this.validators[key].push(fieldDefinition.validate);
                } else if (value(fieldDefinition.validate).typeOf(Array)) {
                    this.validators[key] = this.validators[key].concat(fieldDefinition.validate);
                }
            }
        }
    };

    /**
     * Validate if given model matches schema definition. Returns a promise with the validation result object
     * which contains the intermediate result of all synchronous validators.
     *
     * @param {Object} model
     * @param {Function=} callback
     * @returns {Promise}
     */
    Schema.prototype.validate = function (model, callback) {
        var self = this;
        var pending = 0;
        var result = {
            model: model,
            result: true,
            errors: {}
        };
        var promise;

        function handleFieldErrors(key, fieldErrors) {
            if (fieldErrors.length > 0) {
                result.result = false;
                result.errors[key] = fieldErrors;
            }
        }

        function doCallback() {
            callback(result);
        }

        if (value(model).notTypeOf(Object)) {
            throw new TypeError("Model must be an object");
        }

        if (!this.validators) {
            throw new Error("Validators not defined: Have you registered the validate plugin before any schema definitions?");
        }

        promise = new Promise(function (resolve) {
            function done() {
                if (typeof callback === "function") {
                    setTimeout(doCallback, 0);
                }
                resolve(result);
            }

            if (self.fields.length === 0) {
                done();
                return;
            }

            pending = self.fields.length;

            self.fields.forEach(function (key) {
                var fieldErrors = runValidation(self.validators[key], model[key], model, function onFieldValidation(fieldErrors) {
                    pending--;
                    handleFieldErrors(key, fieldErrors);

                    if (pending === 0) {
                        done();
                    }
                });

                handleFieldErrors(key, fieldErrors);
            });
        });
        // Attach intermediate result to promise
        promise.validation = result;

        return promise;
    };
}

module.exports = validationPlugin;
