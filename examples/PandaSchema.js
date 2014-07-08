"use strict";

var Schema = require("../lib/Schema.js");

var Panda = new Schema("Panda", {
    name: "poly",
    age: {
        type: Number,
        required: true
    },
    mood: {
        type: String,
        enum: ["grumpy", "happy"]
    },
    birthday: Date
});