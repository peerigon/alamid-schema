"use strict";

var processDefinition = require("./processDefinition.js"),
    merge = require("./merge.js");

var slice = Array.prototype.slice;

function Schema() {
    Schema.prototype.constructor.apply(this, arguments);
}

/**
 * Creates a new Schema
 *
 * @param {String=Anonymous} name
 * @param {String|Object} definition
 * @constructor
 */
Schema.prototype.constructor = function (name, definition) {
    var schema;

    if (arguments.length === 1) {
        name = "Anonymous";
        definition = arguments[0];
    }

    this.name = name;
    this.definition = definition;

    schema = processDefinition(definition);

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

/**
 * Creates a new schema that inherits from the current schema. Field definitions are merged
 * where appropriate. If a definition conflicts with the parent definition, the child's definition supersedes.
 *
 * @param {String=Anonymous} name
 * @param {Object} definition
 * @returns {Schema}
 */
Schema.prototype.extend = function (name, definition) {
    if (arguments.length === 1) {
        name = "Anonymous";
        definition = arguments[0];
    }

    merge(this.definition, definition);

    return new Schema(name, definition);
};

/**
 * Calls the given function with the Schema as first argument and the given config (optionally). Plugins can be used
 * to hook into class methods by overriding them.
 *
 * You may call this function multiple times with the same plugin, the plugin will only be applied once.
 *
 * @param {Function} plugin
 * @param {Object=} config
 * @returns {Function}
 */
Schema.use = function (plugin, config) {
    this._plugins = this._plugins || [];

    if (this._plugins.indexOf(plugin) === -1) {
        plugin(this, config);
        this._plugins.push(plugin);
    }

    return this;
};

module.exports = Schema;