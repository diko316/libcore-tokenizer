'use strict';


describe("Tokenizer instance \"define([definitions...])\" API",
    function () {
        
        it('1. Should define tokens with ' +
           'define([name, regex ..., name, regex...]) parameters',
            function () {
                
                var tokenizer = global.createTokenizer();
                
                tokenizer.define([
                    "name",     /regex/,
                                /name/
                ]);
                
            });
        
        it('2. Should not define tokens with define(non-array) parameters',
            function () {
                
                var tokenizer = global.createTokenizer(),
                    error = null;
                
                try {
                    tokenizer.define(null);
                }
                catch (e) {
                    error = e;
                }
                
                expect(error).not.toBe(null);
                
                try {
                    tokenizer.define('string');
                }
                catch (e) {
                    error = e;
                }
                
                expect(error).not.toBe(null);
                
                try {
                    tokenizer.define(100);
                }
                catch (e) {
                    error = e;
                }
                
                expect(error).not.toBe(null);
                
            });
        
    });