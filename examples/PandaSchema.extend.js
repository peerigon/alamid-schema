"use strict";

var Schema = require("../lib/Schema");

var PandaSchema = new Schema({
    name: String,
    age: Number,
    friends: {
        type: Array
    }
});

var SuperPanda = PandaSchema.extend("SuperPanda", {
    xRay: true,
    canFly: {
        type: Boolean
    }
});

console.log(SuperPanda);
