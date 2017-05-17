'use strict';

describe('Regular Expression Kleene Star "*" operator.',
    function () {
        
        function predefined() {
            var tokenizer = global.createTokenizer();
            tokenizer.define([
                "dikofied", /diko(xx[0-9]+)*t*/,
                "multi_sign_number", /[\+|\-]*[0-9]+/
            ]);
            return tokenizer;
        }
        
        it("1. Should define tokens with Kleene star operator.",
            function () {
                expect(predefined).not.toThrow();
            });
        
        
        it("2. Should successfully tokenize string based on tokens with " +
           'Kleen star patterns.',
            function () {
                var tokenizer = predefined(),
                    subject = '0912diko+2dikoxx3tttttt9';
                    
                expect(tokenizer.tokenize(0, subject)).
                    toEqual(["multi_sign_number", "0912", 4]);
                    
                expect(tokenizer.tokenize(4, subject)).
                    toEqual(["dikofied", "diko", 8]);
                    
                expect(tokenizer.tokenize(8, subject)).
                    toEqual(["multi_sign_number", "+2", 10]);
                    
                expect(tokenizer.tokenize(10, subject)).
                    toEqual(["dikofied", "dikoxx3ttttttt", 24]);
                    
                expect(tokenizer.tokenize(24, subject)).
                    toEqual(["multi_sign_number", "9", 25]);
                
            });
        
        
        
        
    });