'use strict';



describe('Regular Expression Character Class "[^]" and character range inside.',
    function () {
        
        function predefined() {
            var tokenizer = global.createTokenizer();
            tokenizer.define([
                "guitar_chords", /[a-defg]+/,
                "h_to_m", /[hijklm]+/,
                "others", /[n-z]+/,
                "number", /[\+|\-]?[0-9]+/,
                "decimal", /[\+|\-]?[0-9]+(\.[0-9]+)?/,
                "string",   /\"(\\\"|[^\"])*\"/,
                            /\'(\\\'|[^\'])*\'/,
                "non_alphanumeric",
                            /[^\+\-\"\'a-z0-9]+/
            ]);
            return tokenizer;
        }
        
        it("1. Should define tokens with character class and " +
            "negative character class operator.",
            function () {
                try {
                    predefined();
                }
                catch (e) {
                    console.log(e.toString());
                }
                expect(predefined).not.toThrow();
            });
        
        
        it("2. Should successfully tokenize string based on tokens with " +
           'character class and negative character class patterns.',
            function () {
                var tokenizer = predefined(),
                    subject = 'cdazn+1098m023.01 ()&^%$#fd';
                    
                expect(tokenizer.tokenize(0, subject)).
                    toEqual(["guitar_chords", "cda", 3]);
                    
                expect(tokenizer.tokenize(3, subject)).
                    toEqual(["others", "zn", 5]);
                    
                expect(tokenizer.tokenize(5, subject)).
                    toEqual(["number", "+1098", 10]);
                    
                expect(tokenizer.tokenize(10, subject)).
                    toEqual(["h_to_m", "m", 11]);
                    
                expect(tokenizer.tokenize(11, subject)).
                    toEqual(["decimal", "023.01", 17]);

                expect(tokenizer.tokenize(17, subject)).
                    toEqual(["non_alphanumeric", " ()&^%$#", 25]);

                expect(tokenizer.tokenize(25, subject)).
                    toEqual(["guitar_chords", "fd", 27]);

                expect(tokenizer.tokenize(27, subject)).
                    toEqual(["$", "", 28]);
            });
        
        
        
    });