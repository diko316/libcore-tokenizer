'use strict';

var Tokenizer = require("../index.js");


global.createTokenizer = function() {
    return new Tokenizer();
};


require("./api/definition.js");
require("./api/import.js");
require("./api/export.js");
require("./api/sample.js");




require("./regex/alternative.js");
require("./regex/character-class.js");
require("./regex/optional.js");
require("./regex/repeat-none-or-more.js");
require("./regex/repeat-one-or-more.js");
