'use strict';


describe("Tokenizer Basic usage: tokenize(from:Number, subject:String)",
    function () {
        it("1. Should run basic example from README flawlessly.",
            function () {
                var tokenizer = global.createTokenizer(),
                    subject = "12345abc67890";
                
                // define
                tokenizer.define([
                    "number",       /[0-9]+/,
                        
                    "sequence",     /[a-c]+/,
                                    /[d-z]+/,
                                    /[A-Z]+/
                ]);
                
                // first
                expect(tokenizer.tokenize(0, subject)).
                    toEqual(["number", "12345", 5]);
                
                
                // second
                expect(tokenizer.tokenize(5, subject)).
                    toEqual(["sequence", "abc", 8]);
                    
                // third
                expect(tokenizer.tokenize(8, subject)).
                    toEqual(["number", "67890", 13]);
                    
                // end
                expect(tokenizer.tokenize(13, subject)).
                    toEqual(["$", "", 14]);
                
                // past end
                expect(tokenizer.tokenize(14, subject)).
                    toEqual(null);
                
            });
    });