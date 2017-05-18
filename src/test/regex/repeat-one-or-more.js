'use strict';

describe('Regular Expression Repeat "+" operator.',
    function () {
        
        
        function predefined() {
            var tokenizer = global.createTokenizer();
            tokenizer.define([
                "dikofied", /diko(xx[0-9])+t+/,
                "multi_sign_number", /[\+|\-]*[0-9]+/
            ]);
            return tokenizer;
        }
        
        it('1. Should define tokens with repeat "+" operator.',
            function () {
                expect(predefined).not.toThrow();
            });
        
        
        it('2. Should successfully tokenize string based on tokens with ' +
           'repeat "+" patterns.',
            function () {
                var tokenizer = predefined(),
                    subject = '0912dikoxx5t+2dikoxx3xx4t9';
                
                expect(tokenizer.tokenize(0, subject)).
                    toEqual(["multi_sign_number", "0912", 4]);
                
                expect(tokenizer.tokenize(4, subject)).
                    toEqual(["dikofied", "dikoxx5t", 12]);
                
                expect(tokenizer.tokenize(12, subject)).
                    toEqual(["multi_sign_number", "+2", 14]);
                    
                expect(tokenizer.tokenize(14, subject)).
                    toEqual(["dikofied", "dikoxx3xx4t", 25]);
                    
                expect(tokenizer.tokenize(25, subject)).
                    toEqual(["multi_sign_number", "9", 26]);
                    
                expect(tokenizer.tokenize(26, subject)).
                    toEqual(["$", "", 27]);
            });
        
        
        
    });