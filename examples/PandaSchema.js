"use strict";

var Schema = require("../lib/Schema.js");

var Panda = new Schema("Panda", {
    id: {
        type: Number,
        required: true,
        writable: false
    },
    name: "poly",
    age: {
        type: Number,
        required: true
    },
    mood: {
        type: String,
        enum: ["grumpy", "happy"]
    },
    birthday: Date,
    lastUpdate: {
        type: Date,
        required: true,
        readable: true,
        writable: false
    }
});