"use strict";

var chai = require("chai"),
    expect = chai.expect,
    spies = require('chai-spies'),
    chaiAsPromised = require("chai-as-promised");

var Schema = require("../lib/Schema.js"),
    validators = require("../plugins/validation/validators.js"),
    validationPlugin = require("../plugins/validation/index.js");

chai.use(spies);
chai.use(chaiAsPromised);
chai.Assertion.includeStack = true;

function oldEnough(age) {
    return age > 18 || "too-young";
}

function notTooOld(age) {
    return age < 99 || "too-old";
}

Schema.use(validationPlugin);

describe("plugins/validation", function () {

    describe(".prototype", function () {

        describe(".constructor()", function () {

            describe("default validators", function () {

                it("should add a required validator", function () {
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

                it("should add a enum validator", function () {

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

                it("should add a min validator", function () {

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

                it("should add a max validator", function () {

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

            describe("custom validators", function () {

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

            describe("mixed validators", function () {

                it("should register default validators always before custom validators", function () {
                    var schema = new Schema({
                        age: {
                            type: Number,
                            min: 1,
                            validate: [oldEnough, notTooOld]
                        }
                    });

                    expect(schema.validators.age).to.be.an("array");
                    expect(schema.validators.age).to.have.length(3);
                    expect(schema.validators.age[0].name).to.eql("validateMin");
                    expect(schema.validators.age[1]).to.eql(oldEnough);
                    expect(schema.validators.age[2]).to.eql(notTooOld);
                });

            });

            describe("extended schemas", function () {

                it("should merge all specified validators", function () {
                    var schema = new Schema({
                            age: {
                                required: true,
                                max: 99,
                                validate: oldEnough
                            }
                        }),
                        extended = schema.extend({
                            age: {
                                required: false,
                                validate: notTooOld
                            }
                        }),
                        ageValidators = extended.validators.age.toString();

                    expect(ageValidators).to.contain(validators.max(), oldEnough, notTooOld);
                    expect(ageValidators).to.not.contain(validators.required());
                });

            });

        });

        describe(".validate(model, callback)", function () {
            var schema;

            it("should throw an error if model is not an object", function () {
                var schema = new Schema({});

                expect(function () {
                    schema.validate(null, function () {
                    });
                }).to.throw(TypeError);
                expect(function () {
                    schema.validate(undefined, function () {
                    });
                }).to.throw(TypeError);
                expect(function () {
                    schema.validate("", function () {
                    });
                }).to.throw(TypeError);
                expect(function () {
                    schema.validate(12, function () {
                    });
                }).to.throw(TypeError);

                expect(function () {
                    schema.validate({}, function () {
                    });
                }).to.not.throw(TypeError);
            });

            it("should reference the given model to the validation result", function (done) {
                var model = {};

                schema = new Schema({});
                schema.validate(model, function (validation) {
                    expect(validation.model).to.equal(model);
                    done();
                });
            });

            it("should work with sync validators", function (done) {
                schema = new Schema({
                    age: {
                        type: Number,
                        validate: function (age) {
                            return age > 8;
                        }
                    }
                });

                schema.validate({age: 18}, function (validation) {
                    expect(validation.result).to.eql(true);
                    expect(validation.failedFields).to.eql({});
                    done();
                });
            });

            it("should work with async validators", function (done) {
                schema = new Schema({
                    age: {
                        type: Number,
                        validate: function (age, callback) {
                            setTimeout(function () {
                                callback(age > 8);
                            }, 0);
                        }
                    }
                });

                schema.validate({age: 18}, function (validation) {
                    expect(validation.result).to.eql(true);
                    expect(validation.failedFields).to.eql({});
                    done();
                });
            });

            describe("Promise signature", function () {

                before(function () {
                    schema = new Schema({
                        age: {
                            type: Number,
                            min: 3
                        }
                    });
                });

                it("should return a promise if no callback is given", function () {

                    expect(schema.validate({age: 2})).to.be.a("promise");
                });

                it("should resolve if validation succeeds", function () {

                    schema = new Schema({
                        age: {
                            type: Number,
                            min: 3
                        }
                    });

                    return schema.validate({age: 4})
                    .then(function(validation) {
                        expect(validation).to.eql({result: true, model: { age: 4 }, failedFields: {}});
                    });
                });

                it("should reject if validation fails", function () {

                    schema = new Schema({
                        age: {
                            type: Number,
                            min: 5
                        }
                    });

                    return schema.validate({age: 1})
                        .then(function() {
                            throw new Error("Should not resolve");
                        })
                        .catch(function(validation) {
                           expect(validation).to.eql({result: false, model: { age: 1 }, failedFields: {age: ["min"]}});
                        });
                });
            });

            describe("mixed validators", function () {

                function validateAgeAsync(age, callback) {
                    setTimeout(function () {
                        callback(age > 8 || "fail-async");
                    }, 0);
                }

                function validateAgeSync(age) {
                    return age > 8 || "fail-sync";
                }

                it("should pass if async & sync validators pass", function (done) {
                    var asyncSpy = chai.spy(validateAgeAsync),
                        syncSpy = chai.spy(validateAgeSync);

                    schema = new Schema({
                        age: {
                            type: Number,
                            validate: [asyncSpy, syncSpy]
                        }
                    });

                    schema.validate({age: 18}, function (validation) {
                        expect(asyncSpy).to.have.been.called.once();
                        expect(syncSpy).to.have.been.called.once();
                        expect(validation.result).to.eql(true);
                        expect(validation.failedFields).to.eql({});
                        done();
                    });
                });

                it("should fail if an async and sync validator fail", function (done) {
                    var asyncSpy = chai.spy(validateAgeAsync),
                        syncSpy = chai.spy(validateAgeSync);

                    schema = new Schema({
                        age: {
                            type: Number,
                            validate: [asyncSpy, syncSpy]
                        }
                    });

                    schema.validate({age: 6}, function (validation) {
                        expect(asyncSpy).to.have.been.called.once();
                        expect(syncSpy).to.have.been.called.once();
                        expect(validation.result).to.eql(false);
                        expect(validation.failedFields.age).to.contain("fail-async", "fail-sync");
                        done();
                    });
                });

                it("should fail if the async validator fails & sync passes", function (done) {
                    var asyncSpy = chai.spy(function (age, callback) {
                            setTimeout(function () {
                                callback("fail-async");
                            }, 0);
                        }),
                        syncSpy = chai.spy(validateAgeSync);

                    schema = new Schema({
                        age: {
                            type: Number,
                            validate: [asyncSpy, syncSpy]
                        }
                    });

                    schema.validate({age: 6}, function (validation) {
                        expect(asyncSpy).to.have.been.called.once();
                        expect(syncSpy).to.have.been.called.once();
                        expect(validation.result).to.eql(false);
                        expect(validation.failedFields.age).to.contain("fail-async");
                        done();
                    });
                });

                it("should fail if the sync validator fails & async passes", function (done) {
                    var asyncSpy = chai.spy(function (age, callback) {
                            callback(true);
                        }),
                        syncSpy = chai.spy(function (age) {
                            return "fail-sync";
                        });

                    schema = new Schema({
                        age: {
                            type: Number,
                            validate: [asyncSpy, syncSpy]
                        }
                    });

                    schema.validate({age: 8}, function (validation) {
                        expect(asyncSpy).to.have.been.called.once();
                        expect(syncSpy).to.have.been.called.once();
                        expect(validation.result).to.eql(false);
                        expect(validation.failedFields.age).to.contain("fail-sync");
                        done();
                    });
                });
            });

        });
    });

});