'use strict';


describe("Regular Expression alternation \"|\" operator",
    function () {
        
        function predefined() {
            var tokenizer = global.createTokenizer();
            tokenizer.define([
                "linking_verb", /are|is|was|were/,
                "subject", /diko|people/,
                "adjective", /good|cute|innocent/,
                "space", /[ \r\n\t]/,
                "period", /\./
            ]);
            return tokenizer;
        }
        
        it("1. Should successfully declare tokens with \"|\" pattern",
            function () {
                expect(predefined).not.toThrow();
            });
        
        it("2. Should successfully tokenize string when alternation " +
            "\"|\" pattern is used on declared tokens",
            function () {
                var tokenizer = predefined(),
                    subject = "diko is cute. people are innocent.";
                
                
                // first
                expect(tokenizer.tokenize(0, subject)).
                    toEqual(["subject", "diko", 4]);
                    
                expect(tokenizer.tokenize(4, subject)).
                    toEqual(["space", " ", 5]);
                    
                expect(tokenizer.tokenize(5, subject)).
                    toEqual(["linking_verb", "is", 7]);
                    
                expect(tokenizer.tokenize(7, subject)).
                    toEqual(["space", " ", 8]);
                    
                expect(tokenizer.tokenize(8, subject)).
                    toEqual(["adjective", "cute", 12]);
                    
                expect(tokenizer.tokenize(12, subject)).
                    toEqual(["period", ".", 13]);
                    
                expect(tokenizer.tokenize(13, subject)).
                    toEqual(["space", " ", 14]);
                    
                expect(tokenizer.tokenize(14, subject)).
                    toEqual(["subject", "people", 20]);
                    
                expect(tokenizer.tokenize(20, subject)).
                    toEqual(["space", " ", 21]);
                    
                expect(tokenizer.tokenize(21, subject)).
                    toEqual(["linking_verb", "are", 24]);
                    
                expect(tokenizer.tokenize(24, subject)).
                    toEqual(["space", " ", 25]);
                    
                expect(tokenizer.tokenize(25, subject)).
                    toEqual(["adjective", "innocent", 33]);
                
                expect(tokenizer.tokenize(33, subject)).
                    toEqual(["period", ".", 34]);
                    
                expect(tokenizer.tokenize(34, subject)).
                    toEqual(["$", "", 35]);
            });
        
    });