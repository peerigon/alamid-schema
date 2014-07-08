"use strict";


var Schema = require("../../lib/Schema.js");
Schema.use(require("../../plugins/validation/index.js"));

var PandaSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        min: 9,
        max: 99
    },
    mood: {
        type: String,
        enum: ["happy", "sleepy"]
    },
    birthday: Date
});

var panda = {
    name: "Hugo",
    age: 3,
    mood: "happy"
};

PandaSchema.validate(panda, function(validation) {

    if(!validation.result) {
        console.log(validation.failedFields);
        console.log("failed fields:", Object.keys(validation.failedFields).join(","));
        return;
    }

    console.log("happy panda");
});