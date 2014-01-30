"use strict";

var processSchema = require("./processSchema");


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

    if (arguments.length === 1) {
        name = "Unknown";
        schemaDefinition = arguments[0];
    }

    this.name = name;

    //data we always extract
    var schema = processSchema(schemaDefinition);

    this.keys = schema.keys;
    this.types = schema.types;
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