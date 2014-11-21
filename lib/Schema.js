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
 * Returns a subset of the current schema with the given keys. You may pass an array with keys
 * or just the keys as arguments.
 *
 * @param {String|Array} key1
 * @param {String} key2
 * @param {String} key3
 * @returns {Schema}
 */
Schema.prototype.only = function (key1, key2, key3) {
    var subset = Object.create(this),
        keys;

    if (arguments.length === 1 && Array.isArray(key1)) {
        keys = key1;
    } else {
        keys = slice.call(arguments);
    }

    if (keys.length === 0) {
        throw new Error("(alamid-schema) Cannot create a subset of the schema with no keys");
    }

    subset.keys = keys;

    return subset;
};

/**
 * Returns a subset of the current schema without the given keys. You may pass an array with keys
 * or just the keys as arguments.
 *
 * @param {String|Array} key1
 * @param {String} key2
 * @param {String} key3
 * @returns {Schema}
 */
Schema.prototype.except = function (key1, key2, key3) {
    var subset = Object.create(this),
        keys;

    if (arguments.length === 1 && Array.isArray(key1)) {
        keys = key1;
    } else {
        keys = slice.call(arguments);
    }

    if (keys.length === this.keys.length) {
        throw new Error("(alamid-schema) Cannot create a subset of the schema with no keys");
    }

    subset.keys = this.keys.filter(function (value) {
        return keys.indexOf(value) === -1;
    });

    return subset;
};

/***
 * Returns all writable Fields as Array
 * @returns {Array}
 */
Schema.prototype.getWritableFields = function () {
    var self = this;

    return this.keys.filter(function (key) {
        return self.definition[key].writable === true;
    });
};

/***
 * Returns a Schema with only writable fields
 * @returns {Schema}
 */
Schema.prototype.getWritableSchema = function () {
    return this.only(this.getWritableFields());
};

/***
 * Returns all writable Fields as Array
 * @returns {Array}
 */
Schema.prototype.getReadableFields = function () {
    var self = this;

    return this.keys.filter(function (key) {
        return self.definition[key].readable === true;
    });
};

/***
 * Returns a Schema with only readable fields
 * @returns {Schema}
 */
Schema.prototype.getReadableSchema = function () {
    return this.only(this.getReadableFields());
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

    return new Schema(name, merge(this.definition, definition));
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