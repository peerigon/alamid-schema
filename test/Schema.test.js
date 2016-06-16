"use strict";

var chai = require("chai");
var expect = chai.expect;
var Schema = require("../lib/Schema.js");

chai.config.includeStack = true;

describe("Schema", function () {

    describe(".prototype", function () {
        var schema;
        var definition;

        beforeEach(function () {
            definition = {
                name: {
                    type: "String",
                    readable: false,
                    writable: false
                },
                age: 3,
                friends: {
                    writable: false,
                    type: Array
                }
            };
            schema = new Schema(definition);
        });

        describe(".constructor(definition)", function () {

            it("should extract the fields from the definition", function () {
                expect(schema.fields).to.eql(["name", "age", "friends"]);
            });

            it("should extract the types from the definition if using Constructors", function () {

                schema = new Schema({
                    name: String,
                    age: Number,
                    friends: {
                        type: Array
                    }
                });

                expect(schema.types).to.eql({
                    name: "String",
                    age: "Number",
                    friends: "Array"
                });
            });

            it("should extract the types from the definition if using values", function () {

                schema = new Schema({
                    name: "panda",
                    age: 12,
                    friends: {
                        type: []
                    }
                });

                expect(schema.types).to.eql({
                    name: "String",
                    age: "Number",
                    friends: "Array"
                });
            });

            it("should normalize the definition", function () {
                expect(schema.definition).to.eql({
                    age: {
                        readable: true,
                        type: "Number",
                        writable: true
                    },
                    friends: {
                        readable: true,
                        type: "Array",
                        writable: false
                    },
                    name: {
                        readable: false,
                        type: "String",
                        writable: false
                    }
                });
            });

            it("should apply 'Anonymous' as schema name", function () {
                expect(schema.name).to.equal("Anonymous");
            });

        });

        describe(".constructor(name, definition)", function () {
            var namedSchema;

            beforeEach(function () {
                namedSchema = new Schema("User", definition);
            });

            it("should apply the given name", function () {
                expect(namedSchema.name).to.equal("User");
            });

            it("should work like .constructor(definition)", function () {
                namedSchema.name = schema.name;
                expect(schema).to.eql(namedSchema);
            });

        });

        describe(".only(key1, key2, key3)", function () {
            var subset;

            it("should return an independent instance", function () {
                subset = schema.only("name", "age");
                expect(subset).not.to.equal(schema);
            });

            it("should inherit all properties prototypically except 'fields'", function () {
                var ownProperties = [];
                var key;

                subset = schema.only("name", "age");
                for (key in subset) {
                    if (subset.hasOwnProperty(key)) {
                        ownProperties.push(key);
                    }
                }
                expect(ownProperties).to.eql(["fields"]);
                expect(schema.types).to.be.an("object");
                expect(schema.name).to.be.an("string");
            });

            it("should change the .fields-property to the given keys", function () {
                subset = schema.only("name", "age");
                expect(subset.fields).to.eql(["name", "age"]);
            });

            it("should be possible to create schemas with no fields", function () {
                subset = schema.only();
                expect(subset.fields).to.eql([]);
            });

        });

        describe(".only(keys)", function () {
            var subset;

            it("should just work like .only(key1, key2, kex3)", function () {
                subset = schema.only(["name", "age"]);
                expect(subset.fields).to.eql(["name", "age"]);
            });

            it("should be possible to create schemas with no fields", function () {
                subset = schema.only([]);
                expect(subset.fields).to.eql([]);
            });

        });

        describe(".except(key1, key2, key3)", function () {
            var subset;

            it("should return an independent instance", function () {
                subset = schema.except("name", "age");
                expect(subset).not.to.equal(schema);
            });

            it("should inherit all properties prototypically except 'fields'", function () {
                var ownProperties = [];
                var key;

                subset = schema.except("name", "age");
                for (key in subset) {
                    if (subset.hasOwnProperty(key)) {
                        ownProperties.push(key);
                    }
                }
                expect(ownProperties).to.eql(["fields"]);
                expect(schema.types).to.be.an("object");
                expect(schema.name).to.be.an("string");
            });

            it("should exclude the given keys from the fields-property", function () {
                subset = schema.except("friends", "age");
                expect(subset.fields).to.eql(["name"]);
            });

            it("should be possible to exclude all fields", function () {
                subset = schema.except.apply(schema, schema.fields);
                expect(subset.fields).to.eql([]);
            });

        });

        describe(".except(keys)", function () {
            var subset;

            it("should just work like .only(key1, key2, kex3)", function () {
                subset = schema.only(["name", "age"]);
                expect(subset.fields).to.eql(["name", "age"]);
            });

            it("should be possible to exclude all fields", function () {
                subset = schema.except(schema.fields);
                expect(subset.fields).to.eql([]);
            });

        });

        describe(".extend(definition)", function () {
            var extended;

            it("should create an independent schema", function () {
                extended = schema.extend({});

                expect(extended).to.not.equal(schema);
                expect(extended.fields).to.not.equal(schema.fields);
                expect(extended.types).to.not.equal(schema.types);
                expect(extended).to.eql(schema);
            });

            it("should extend the schema by the specified properties", function () {
                extended = schema.extend({
                    password: String,
                    token: {
                        type: "String"
                    }
                });

                expect(extended.fields).to.contain("password", "token");
                expect(extended.types.password).to.equal("String");
                expect(extended.types.token).to.equal("String");
            });

            it("should merge the definition", function () {
                extended = schema.extend({
                    age: {
                        validate: function () {}
                    }
                });

                expect(extended.types.age).to.equal("Number");
                expect(extended.definition.age.validate).to.be.a("function");
            });

        });

        describe(".extend(name, definition)", function () {
            var extended;

            beforeEach(function () {
                extended = schema.extend("SuperUser", {
                    password: String,
                    token: {
                        type: "String"
                    }
                });
            });

            it("should apply the given name", function () {
                expect(extended.name).to.equal("SuperUser");
            });

            it("should work like .extend(definition)", function () {
                extended.name = schema.name;

                expect(extended.fields).to.contain("password", "token");
                expect(extended.types.password).to.equal("String");
                expect(extended.types.token).to.equal("String");
            });

        });

        describe(".writableFields()", function () {

            it("should return writable fields", function () {
                var writableFields = schema.writableFields();

                expect(writableFields).to.eql(["age"]);
            });

        });

        describe(".writable()", function () {

            it("should return a schema with only writable fields", function () {
                var writableSchema = schema.writable();

                expect(writableSchema).to.be.an.instanceOf(Schema);
                expect(writableSchema.fields).to.eql(["age"]);
            });

        });

        describe(".readableFields()", function () {

            it("should return readable fields", function () {
                var readableFields = schema.readableFields();

                expect(readableFields).to.eql(["age", "friends"]);
            });

        });

        describe(".readable()", function () {

            it("should return a schema with only readable fields", function () {
                var readableSchema = schema.readable();

                expect(readableSchema).to.be.an.instanceOf(Schema);
                expect(readableSchema.fields).to.eql(["age", "friends"]);
            });

        });

        describe(".strip(model)", function () {

            it("should remove all additional keys", function () {
                var model = {
                    name: "Octocat",
                    someOtherProperty: true,
                    andAnArray: [1, 2, 3]
                };

                schema.strip(model);
                expect(model).to.eql({ name: "Octocat" });
            });

            it("will not work with prototype inheritance", function () {
                var model = Object.create({
                    someOtherProperty: true,
                    andAnArray: [1, 2, 3]
                });

                model.name = "Octocat";
                schema.strip(model);
                expect(model).to.eql(model);
            });

            it("should work on empty objects", function () {
                var model = {};

                expect(function () {
                    schema.strip(model);
                }).to.not.throw();
                expect(model).to.eql({});
            });

        });

    });

});
