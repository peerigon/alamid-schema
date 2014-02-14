"use strict";

var chai = require("chai"),
    expect = chai.expect,
    Schema = require("../lib/Schema.js"),
    validators = require("../plugins/validation/validators.js"),
    validationPlugin = require("../plugins/validation/index.js");

chai.Assertion.includeStack = true;

function oldEnough(age) {
    return age > 18 || "too-young";
}

function notTooOld(age) {
    return age < 99 || "too-old";
}

describe("validationPlugin", function () {

    before(function () {
        Schema.use(validationPlugin);
    });

    describe("#constructor", function () {

        describe("#default validators", function () {

            it("should accept required validators", function () {

                var schema = new Schema({
                    name: {
                        type: String,
                        required: true
                    }
                });

                expect(schema.validators.name).to.be.an("array");
                expect(schema.validators.name).to.have.length(1);
                expect(schema.validators.name[0].name).to.eql(validators.required().name);
            });

            it("should accept enum validators", function () {

                var schema = new Schema({
                    tags: {
                        type: String,
                        "enum": ["a", "b"]
                    }
                });

                expect(schema.validators.tags).to.be.an("array");
                expect(schema.validators.tags).to.have.length(1);
                expect(schema.validators.tags[0].name).to.eql(validators.enum().name);
            });

            it("should accept min validators", function () {

                var schema = new Schema({
                    age: {
                        type: Number,
                        min: 0
                    }
                });

                expect(schema.validators.age).to.be.an("array");
                expect(schema.validators.age).to.have.length(1);
                expect(schema.validators.age[0].name).to.eql(validators.min().name);
            });

            it("should accept max validators", function () {

                var schema = new Schema({
                    age: {
                        type: Number,
                        max: 200
                    }
                });

                expect(schema.validators.age).to.be.an("array");
                expect(schema.validators.age).to.have.length(1);
                expect(schema.validators.age[0].name).to.eql(validators.max().name);
            });
        });

        describe("#custom validators", function () {

            it("should accept a single validation function", function () {

                var schema = new Schema({
                    age: {
                        type: Number,
                        validate: oldEnough
                    }
                });

                expect(schema.validators.age).to.be.an("array");
                expect(schema.validators.age).to.have.length(1);
                expect(schema.validators.age[0]).to.eql(oldEnough);
            });

            it("should accept an array of validation functions", function () {

                var schema = new Schema({
                    age: {
                        type: Number,
                        validate: [oldEnough, notTooOld]
                    }
                });

                expect(schema.validators.age).to.be.an("array");
                expect(schema.validators.age).to.have.length(2);
                expect(schema.validators.age[0]).to.eql(oldEnough);
                expect(schema.validators.age[1]).to.eql(notTooOld);
            });
        });
    });

    describe(".validate", function () {

    });


});