"use strict";

var processSchema = require("./processSchema");

/**
 * Creates a new Schema
 *
 * @param {String|Object} name
 * @param {String|Object=} schemaDefinition
 * @constructor
 */
var Schema = function (name, schemaDefinition) {
    var self = this,
        args = Array.prototype.slice.call(arguments);

    if(args.length === 1) {
        name = "Unknown";
        schemaDefinition = args[0];
    }

    this.name = name;
    
    //data we always extract
    var schema = processSchema(schemaDefinition);

    this.keys = schema.keys;
    this.types = schema.types;

    //call plugin constructors
    Schema._init.forEach(function (constructor) {
        constructor.call(self, schemaDefinition);
    });
};

Schema._init = [];

Schema.use = function (plugin, config) {
    Schema._plugins = Schema._plugins || [];

    if (Schema._plugins.indexOf(plugin) === -1) {
        plugin(Schema, config);
        Schema._plugins.push(plugin);
    }

    return this;
};

module.exports = Schema;