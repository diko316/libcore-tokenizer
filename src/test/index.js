'use strict';

var Tokenizer = require("../index.js");


global.createTokenizer = function() {
    return new Tokenizer();
};

describe("Test Tokenizer API",
    function () {
        require("./api/definition.js");
        require("./api/import.js");
        require("./api/export.js");
        require("./api/sample.js");
    });


describe("Test Supported Regular Expression operators",
    function () {
        require("./regex/alternative.js");
    });