"use strict";

var chai = require("chai"),
    expect = chai.expect,
    Schema = require("../" + require("../package.json").main);

describe("Schema", function () {

    describe(".prototype", function () {
        var schema;

        beforeEach(function () {
            schema = new Schema({
                name: String,
                age: Number,
                friends: Array
            });
        });

        describe(".fields(key1, key2, key3)", function () {
            var subset;

            beforeEach(function () {
                subset = schema.fields("name", "age");
            });

            it("should return an independent instance", function () {
                expect(subset).not.to.equal(schema);
            });

            it("should change the .keys-property to the given keys", function () {
                expect(subset.keys).to.eql(["name", "age"]);
            });

        });

    });

});