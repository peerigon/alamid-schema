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

            it("should return an independent instance", function () {
                subset = schema.fields("name", "age");
                expect(subset).not.to.equal(schema);
            });

            it("should change the .keys-property to the given keys", function () {
                subset = schema.fields("name", "age");
                expect(subset.keys).to.eql(["name", "age"]);
            });

        });

        describe(".fields(keys)", function () {
            var subset;

            it("should just work like .fields(key1, key2, kex3)", function () {
                subset = schema.fields(["name", "age"]);
                expect(subset.keys).to.eql(["name", "age"]);
            });

        });

    });

});