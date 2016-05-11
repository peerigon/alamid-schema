"use strict";

var Schema = require("../../lib/Schema.js");

var panda = {
    name: "Hugo",
    age: 3,
    mood: "happy",
    treasures: [
        "Coconut",
        "Water",
        "Daughter"
    ]
};
var PandaSchema;

Schema.use(require("../../plugins/validation/index.js"));

PandaSchema = new Schema({
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
    treasures: {
        type: Array,
        required: true,
        maxLength: 3
    },
    birthday: Date
});

PandaSchema.validate(panda, function (validation) {
    if (!validation.result) {
        console.log(validation.errors);
        console.log("failed fields:", Object.keys(validation.errors).join(","));
        return;
    }

    console.log("happy panda");
});
