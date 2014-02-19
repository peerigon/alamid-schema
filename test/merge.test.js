"use strict";

var chai = require("chai"),
    expect = chai.expect,
    merge = require("../lib/merge.js");

describe("merge(source, target)", function () {
    var a,
        b;

    it("should copy all properties from source to target", function () {
        a = {
            1: "1",
            2: "2"
        };
        b = {
            3: "3",
            4: "4"
        };

        merge(a, b);

        expect(b).to.eql({
            1: "1",
            2: "2",
            3: "3",
            4: "4"
        });
    });

    it("should return the target", function () {
        b = {};

        expect(merge({}, b)).to.equal(b);
    });

    it("should not alter the source", function () {
        var a = {},
            b = { b: "b" };

        merge(a, b);

        expect(a).to.eql({});
    });

    it("should merge the object if a property is an object both on the source and on the target", function () {
        a = {
            1: {
               1: "1"
            }
        };
        b = {
            1: {
               2: "2"
            }
        };

        merge(a, b);

        expect(b).to.eql({
            1: {
               1: "1",
               2: "2"
            }
        });
    });

    it("should create a merged array if it's an array both on the source and on the target", function () {
        a = {
            1: [1]
        };
        b = {
            1: [2]
        };

        merge(a, b);

        expect(b).to.eql({
            1: [1, 2]
        });
    });

    it("should create a merged array if it's an array either on the source or on the target", function () {
        a = {
            1: 1
        };
        b = {
            1: [2]
        };

        merge(a, b);

        expect(b).to.eql({
            1: [1, 2]
        });

        a = {
            1: [1]
        };
        b = {
            1: 2
        };

        merge(a, b);

        expect(b).to.eql({
            1: [1, 2]
        });
    });

    it("should use the target's property in any other case", function () {
        a = {
            1: {}
        };
        b = {
            1: "1"
        };

        merge(a, b);

        expect(b).to.eql({
            1: "1"
        });

        a = {
            1: "1"
        };
        b = {
            1: {}
        };

        merge(a, b);

        expect(b).to.eql({
            1: {}
        });

        a = {
            1: "a"
        };
        b = {
            1: "b"
        };

        merge(a, b);

        expect(b).to.eql({
            1: "b"
        });

        a = {
            1: true
        };
        b = {
            1: false
        };

        merge(a, b);

        expect(b).to.eql({
            1: false
        });
    });

});