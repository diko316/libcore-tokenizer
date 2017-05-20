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
        
        it('3. Should allow treating of "-" operator as character ' +
            'when outside character class []',
            function () {
                var tokenizer = global.createTokenizer();
                
                function defineRangeOutside() {
                    tokenizer.define(['test', /abcd-def/]);
                }
                
                expect(defineRangeOutside).not.toThrow();
             
            });
        
        it('4. Should allow treating of "[d-d]" character range in ' +
            'character class []',
            function () {
                var tokenizer = global.createTokenizer(),
                    subject = 'abcdef';
                
                function defineRange() {
                    tokenizer.define(['test', /abc[d-d]ef/]);
                }
                
                expect(defineRange).not.toThrow();
                
                expect(tokenizer.tokenize(0, subject)).
                    toEqual(["test", "abcdef", 6]);
                
                
            });
        
        it('5. Should not allow regular expression resulting in empty token',
            function () {
                var tokenizer = global.createTokenizer(),
                    subject = 'abcdef';
                
                function defineOptional() {
                    tokenizer.define(['test', /[a-z0-9]?/]);
                }
                
                function defineKleenStar() {
                    tokenizer.define(['test', /[a-z0-9]*/]);
                }
                
                expect(defineOptional).toThrow();
                expect(defineKleenStar).toThrow();
                
            });
        
    });