"use strict";

var chai = require("chai"),
    expect = chai.expect,
    Schema = require("../" + require("../package.json").main);

describe("Schema", function () {

    describe(".prototype", function () {
        var schema;

        beforeEach(function () {
            schema = new Schema({
                name: {
                    type: "String",
                    readable: false,
                    writable: false
                },
                age: 3,
                friends: {
                    type: Array
                }
            });
        });

        describe(".constructor(definition)", function () {

            it("should extract the keys from the definition", function () {
                expect(schema.keys).to.eql(["name", "age", "friends"]);
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
                    "age": {
                        "readable": true,
                        "type": "Number",
                        "writable": true
                    },
                    "friends": {
                        "readable": true,
                        "type": "Array",
                        "writable": true
                    },
                    "name": {
                        "readable": false,
                        "type": "String",
                        "writable": false
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
                namedSchema = new Schema("User", {
                    name: {
                        type: "String",
                        readable: false,
                        writable: false
                    },
                    age: 3,
                    friends: {
                        type: Array
                    }
                });
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

            it("should inherit all properties prototypically except 'keys'", function () {
                var ownProperties = [],
                    key;

                subset = schema.only("name", "age");
                for (key in subset) {
                    if (subset.hasOwnProperty(key)) {
                        ownProperties.push(key);
                    }
                }
                expect(ownProperties).to.eql(["keys"]);
                expect(schema.types).to.be.an("object");
                expect(schema.name).to.be.an("string");
            });

            it("should change the .keys-property to the given keys", function () {
                subset = schema.only("name", "age");
                expect(subset.keys).to.eql(["name", "age"]);
            });

            it("should throw an error if no keys are given", function () {
                expect(function () {
                    schema.only();
                }).to.throw("Cannot create a subset of the schema with no keys");
            });

        });

        describe(".only(keys)", function () {
            var subset;

            it("should just work like .only(key1, key2, kex3)", function () {
                subset = schema.only(["name", "age"]);
                expect(subset.keys).to.eql(["name", "age"]);
            });

            it("should throw an error if no keys are given", function () {
                expect(function () {
                    schema.only([]);
                }).to.throw("Cannot create a subset of the schema with no keys");
            });

        });

        describe(".except(key1, key2, key3)", function () {
            var subset;

            it("should return an independent instance", function () {
                subset = schema.except("name", "age");
                expect(subset).not.to.equal(schema);
            });

            it("should inherit all properties prototypically except 'keys'", function () {
                var ownProperties = [],
                    key;

                subset = schema.except("name", "age");
                for (key in subset) {
                    if (subset.hasOwnProperty(key)) {
                        ownProperties.push(key);
                    }
                }
                expect(ownProperties).to.eql(["keys"]);
                expect(schema.types).to.be.an("object");
                expect(schema.name).to.be.an("string");
            });

            it("should exclude the given keys from the keys-property", function () {
                subset = schema.except("friends", "age");
                expect(subset.keys).to.eql(["name"]);
            });

            it("should throw an error if no keys are given", function () {
                expect(function () {
                    schema.except.apply(schema, schema.keys);
                }).to.throw("Cannot create a subset of the schema with no keys");
            });

        });

        describe(".except(keys)", function () {
            var subset;

            it("should just work like .only(key1, key2, kex3)", function () {
                subset = schema.only(["name", "age"]);
                expect(subset.keys).to.eql(["name", "age"]);
            });

            it("should throw an error if no keys are given", function () {
                expect(function () {
                    schema.except(schema.keys);
                }).to.throw("Cannot create a subset of the schema with no keys");
            });

        });

        describe(".extend(definition)", function () {
            var extended;

            it("should create an independent schema", function () {
                extended = schema.extend({});

                expect(extended).to.not.equal(schema);
                expect(extended.keys).to.not.equal(schema.keys);
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

                expect(extended.keys).to.contain("password", "token");
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

                expect(extended.keys).to.contain("password", "token");
                expect(extended.types.password).to.equal("String");
                expect(extended.types.token).to.equal("String");
            });

        });

        describe(".writableFields()", function () {

            it("should return writable fields", function () {
                var writableFields = schema.writableFields();
                expect(writableFields).to.eql(["age", "friends"]);
            });

        });

        describe(".writable()", function () {

            it("should return a schema with only writeable Fields", function () {
                var writableSchema = schema.writable();
                expect(writableSchema.keys.length).to.eql(2);
            });

        });

        describe(".readableFields()", function () {

            it("should return readable fields", function () {
                var readableFields = schema.readableFields();
                expect(readableFields).to.eql(["age", "friends"]);
            });

        });


        describe(".readable()", function () {

            it("should return a schema with only readable Fields", function () {
                var readableSchema = schema.readable();
                expect(readableSchema.keys.length).to.eql(2);
            });

        });

    });

});