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
                
                var tokenizer = global.createTokenizer();

                function defineNull() {
                    tokenizer.define(null);
                }
                
                function defineString() {
                    tokenizer.define('string');
                }
                
                function defineNumber() {
                    tokenizer.define(100);
                }
                
                expect(defineNull).toThrow();
                expect(defineString).toThrow();
                expect(defineNumber).toThrow();
                
                
            });
        
    });