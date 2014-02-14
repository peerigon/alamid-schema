"use strict";

var processSchema = require("./processSchema");

var slice = Array.prototype.slice;

function Schema() {
    Schema.prototype.constructor.apply(this, arguments);
}

/**
 * Creates a new Schema
 *
 * @param {String|Object} name
 * @param {String|Object=} schemaDefinition
 * @constructor
 */
Schema.prototype.constructor = function (name, schemaDefinition) {
    var schema;

    if (arguments.length === 1) {
        name = "Anonymous";
        schemaDefinition = arguments[0];
    }

    this.name = name;

    //data we always extract
    schema = processSchema(schemaDefinition);

    this.keys = schema.keys;
    this.types = schema.types;
};

/**
 * Returns a subset with the given keys of the current schema. You may pass an array with keys
 * or just the keys as arguments.
 *
 * @param {String|Array} key1
 * @param {String} key2
 * @param {String} key3
 * @returns {Schema}
 */
Schema.prototype.fields = function (key1, key2, key3) {
    var subset = Object.create(this),
        keys;

    if (arguments.length === 1 && Array.isArray(key1)) {
        keys = key1;
    } else {
        keys = slice.call(arguments);
    }

    subset.keys = keys;

    return subset;
};

Schema.use = function (plugin, config) {
    this._plugins = this._plugins || [];

    if (this._plugins.indexOf(plugin) === -1) {
        plugin(this, config);
        this._plugins.push(plugin);
    }

    return this;
};

module.exports = Schema;