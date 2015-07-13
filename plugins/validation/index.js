"use strict";

if (typeof Promise === "undefined") {
    require("when/es6-shim/Promise");
}

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

    // Return immediately if the field has no validator defined
    if (pending === 0) {
        setTimeout(function () {
            return callback(result);
        }, 0);
    }

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

                if (value(fieldDefinition.minLength).typeOf(Number)) {
                    this.validators[key].push(defaultValidators.minLength(fieldDefinition.minLength));
                }

                if (value(fieldDefinition.maxLength).typeOf(Number)) {
                    this.validators[key].push(defaultValidators.maxLength(fieldDefinition.maxLength));
                }

                if (value(fieldDefinition.hasLength).typeOf(Number)) {
                    this.validators[key].push(defaultValidators.hasLength(fieldDefinition.hasLength));
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
     * @returns {Promise}
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

        if(!this.validators) {
            throw new Error("Validators not defined: Have you registered the validate plugin before any schema definitions?");
        }

        var promise = new Promise(function (resolve, reject) {
            if (self.keys.length === 0) {
                setTimeout(function () {
                    resolve(result);
                }, 0);
            }

            self.keys.forEach(function (key) {
                pending++;
                runValidation(self.validators[key], model[key], model, function (res) {
                    pending--;

                    if (res.length > 0) {
                        result.result = false;
                        result.failedFields[key] = res;
                    }

                    if (pending === 0) {
                        if (result === false) {
                            reject(result);
                        }

                        resolve(result);
                    }
                });
            });
        });

        if (typeof callback === "function") {
            promise
                .then(function (res) {
                    callback(res);
                })
                .catch(function (err) {
                    callback(err);
                });
        } else {
            return promise;
        }
    };
}

module.exports = validationPlugin;