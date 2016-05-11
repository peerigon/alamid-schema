"use strict";

var chai = require("chai");
var spies = require("chai-spies");
var chaiAsPromised = require("chai-as-promised");
var Schema = require("../lib/Schema.js");
var validators = require("../plugins/validation/validators.js");
var validationPlugin = require("../plugins/validation/index.js");
var expect = chai.expect;

function oldEnough(age) {
    return age > 18 || "too-young";
}

function notTooOld(age) {
    return age < 99 || "too-old";
}

chai.use(spies);
chai.use(chaiAsPromised);
chai.config.includeStack = true;
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
                            enum: ["a", "b"]
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

                it("should add a minLength validator", function () {
                    var schema = new Schema({
                        name: {
                            type: String,
                            minLength: 5
                        }
                    });

                    expect(schema.validators.name).to.be.an("array");
                    expect(schema.validators.name).to.have.length(1);
                    expect(schema.validators.name[0].name).to.eql(validators.minLength().name);
                });

                it("should add a maxLength validator", function () {

                    var schema = new Schema({
                        name: {
                            type: String,
                            maxLength: 5
                        }
                    });

                    expect(schema.validators.name).to.be.an("array");
                    expect(schema.validators.name).to.have.length(1);
                    expect(schema.validators.name[0].name).to.eql(validators.maxLength().name);
                });

                it("should add a hasLength validator", function () {
                    var schema = new Schema({
                        name: {
                            type: String,
                            hasLength: 5
                        }
                    });

                    expect(schema.validators.name).to.be.an("array");
                    expect(schema.validators.name).to.have.length(1);
                    expect(schema.validators.name[0].name).to.eql(validators.hasLength().name);
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
                    });
                    var extended = schema.extend({
                        age: {
                            required: false,
                            validate: notTooOld
                        }
                    });
                    var ageValidators = extended.validators.age.toString();

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

                schema.validate({ age: 18 }, function (validation) {
                    expect(validation.result).to.eql(true);
                    expect(validation.errors).to.eql({});
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

                schema.validate({ age: 18 }, function (validation) {
                    expect(validation.result).to.eql(true);
                    expect(validation.errors).to.eql({});
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
                    expect(schema.validate({ age: 2 })).to.be.a("promise");
                });

                it("should resolve if validation succeeds", function () {
                    schema = new Schema({
                        age: {
                            type: Number,
                            min: 3
                        }
                    });

                    return schema.validate({ age: 4 })
                    .then(function (validation) {
                        expect(validation).to.eql({ result: true, model: { age: 4 }, errors: {} });
                    });
                });

                it("should reject if validation fails", function () {
                    schema = new Schema({
                        age: {
                            type: Number,
                            min: 5
                        }
                    });

                    return schema.validate({ age: 1 })
                        .then(function () {
                            throw new Error("Should not resolve");
                        })
                        .catch(function (validation) {
                            expect(validation).to.eql({ result: false, model: { age: 1 }, errors: { age: ["min"] } });
                        });
                });

                it("should provide the intermediate result of all synchronous validators", function () {
                    var intermediateResult;

                    schema = new Schema({
                        age: {
                            type: Number,
                            min: 5,
                            validate: [
                                function syncTrue() {
                                    return true;
                                },
                                function asyncTrue(value, callback) {
                                    setTimeout(function () {
                                        callback(true);
                                    }, 0);
                                },
                                function syncFail() {
                                    return "sync-fail";
                                },
                                function asyncFail(value, callback) {
                                    setTimeout(function () {
                                        callback("async-fail");
                                    }, 0);
                                }
                            ]
                        }
                    });

                    intermediateResult = schema.validate({ age: 1 }).validation;

                    expect(intermediateResult.result).to.equal(false);
                    expect(intermediateResult.errors.age).to.eql(["min", "sync-fail"]);
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
                    var asyncSpy = chai.spy(validateAgeAsync);
                    var syncSpy = chai.spy(validateAgeSync);

                    schema = new Schema({
                        age: {
                            type: Number,
                            validate: [asyncSpy, syncSpy]
                        }
                    });

                    schema.validate({ age: 18 }, function (validation) {
                        expect(asyncSpy).to.have.been.called.once();
                        expect(syncSpy).to.have.been.called.once();
                        expect(validation.result).to.eql(true);
                        expect(validation.errors).to.eql({});
                        done();
                    });
                });

                it("should fail if an async and sync validator fail", function (done) {
                    var asyncSpy = chai.spy(validateAgeAsync);
                    var syncSpy = chai.spy(validateAgeSync);

                    schema = new Schema({
                        age: {
                            type: Number,
                            validate: [asyncSpy, syncSpy]
                        }
                    });

                    schema.validate({ age: 6 }, function (validation) {
                        expect(asyncSpy).to.have.been.called.once();
                        expect(syncSpy).to.have.been.called.once();
                        expect(validation.result).to.eql(false);
                        expect(validation.errors.age).to.contain("fail-async", "fail-sync");
                        done();
                    });
                });

                it("should fail if the async validator fails & sync passes", function (done) {
                    var asyncSpy = chai.spy(function (age, callback) {
                        setTimeout(function () {
                            callback("fail-async");
                        }, 0);
                    });
                    var syncSpy = chai.spy(validateAgeSync);

                    schema = new Schema({
                        age: {
                            type: Number,
                            validate: [asyncSpy, syncSpy]
                        }
                    });

                    schema.validate({ age: 6 }, function (validation) {
                        expect(asyncSpy).to.have.been.called.once();
                        expect(syncSpy).to.have.been.called.once();
                        expect(validation.result).to.eql(false);
                        expect(validation.errors.age).to.contain("fail-async");
                        done();
                    });
                });

                it("should degrade gracefully with an false async validator", function (done) {
                    var falseAsyncSpy = chai.spy(function (age, callback) {
                        callback("fail-false-async"); // callback is called synchronously. This is a common error.
                    });

                    schema = new Schema({
                        age: {
                            type: Number,
                            validate: falseAsyncSpy
                        }
                    });

                    schema.validate({ age: 8 }, function (validation) {
                        expect(falseAsyncSpy).to.have.been.called.once();
                        expect(validation.result).to.equal(false);
                        expect(validation.errors.age).to.contain("fail-false-async");
                        done();
                    });
                });

                it("should fail if the sync validator fails & async passes", function (done) {
                    var asyncSpy = chai.spy(function (age, callback) {
                        setTimeout(function () {
                            callback("fail-async");
                        }, 0);
                    });
                    var syncSpy = chai.spy(function (age) {
                        return "fail-sync";
                    });

                    schema = new Schema({
                        age: {
                            type: Number,
                            validate: [asyncSpy, syncSpy]
                        }
                    });

                    schema.validate({ age: 8 }, function (validation) {
                        expect(asyncSpy).to.have.been.called.once();
                        expect(syncSpy).to.have.been.called.once();
                        expect(validation.result).to.equal(false);
                        expect(validation.errors.age).to.contain("fail-sync");
                        done();
                    });
                });
            });

        });
    });

});
