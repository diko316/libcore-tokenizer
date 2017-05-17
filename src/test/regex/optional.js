'use strict';

describe('Regular Expression Optional "?" operator.',
    function () {
        
        function predefined() {
            var tokenizer = global.createTokenizer();
            tokenizer.define([
                "dikofied", /diko(Version[0-9]+)?t?/,
                "number", /[\+|\-]?[0-9]+/
            ]);
            return tokenizer;
        }
        
        it("1. Should define tokens with optional operator.",
            function () {
                expect(predefined).not.toThrow();
            });
        
        
        it("2. Should successfully tokenize string based on tokens with " +
           'optional patterns.',
            function () {
                var tokenizer = predefined(),
                    subject = '0912diko+2dikoVersion3t9';
                    
                expect(tokenizer.tokenize(0, subject)).
                    toEqual(["number", "0912", 4]);
                    
                expect(tokenizer.tokenize(4, subject)).
                    toEqual(["dikofied", "diko", 8]);
                    
                expect(tokenizer.tokenize(8, subject)).
                    toEqual(["number", "+2", 10]);
                    
                expect(tokenizer.tokenize(10, subject)).
                    toEqual(["dikofied", "dikoVersion3t", 23]);
                    
                expect(tokenizer.tokenize(23, subject)).
                    toEqual(["number", "9", 24]);
                
            });
        
        
        
        
    });