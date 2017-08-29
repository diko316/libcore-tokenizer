'use strict';


import Tokenizer from "../index.js";

global.createTokenizer = function() {
    return new Tokenizer();
};

export { Tokenizer };

export default Tokenizer;