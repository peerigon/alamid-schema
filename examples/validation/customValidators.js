"use strict";

var fs = require("fs");
var path = require("path");
var Schema = require("../../lib/Schema.js");

var PandaSchema;
var panda;

Schema.use(require("../../plugins/validation/index.js"));

// CUSTOM VALIDATORS

// sync
function oldEnough(age) {
    return age > 18 || "too-young";
}

// async
function nameIsUnique(name, callback) {
    fs.readFile(path.join(__dirname, "names.json"), function (err, names) {
        if (err) {
            throw err;
        }
        names = JSON.parse(names);
        callback(names.indexOf(name) === -1 || "name-already-taken");
    });
}

PandaSchema = new Schema({
    name: {
        type: String,
        required: true,
        validate: nameIsUnique
    },
    age: {
        type: Number,
        validate: oldEnough,
        max: 99
    }
});

panda = {
    name: "hugo",
    age: 3,
    mood: "happy"
};

PandaSchema.validate(panda, function (validation) {
    if (!validation.result) {
        console.log(validation.failedFields);
        console.log("failed fields:", Object.keys(validation.failedFields).join(","));
        return;
    }

    /**
     * { name: [ 'name-already-taken' ], age: [ 'too-young' ] }
     */

    console.log("happy panda");
});
