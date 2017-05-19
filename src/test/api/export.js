'use strict';

describe('Tokenizer instance "toJSON()" and "toObject()" API',
    function () {
        
        it("1. Should export FSM data as JSON String.",
            function () {
                var tokenizer = global.createTokenizer();
                    
                var json;
                
                function parseJSON() {
                    return JSON.parse(json);
                }
                
                tokenizer.define([
                    "number",       /[0-9]+/,
                        
                    "sequence",     /a-c]+/,
                                    /[d-z]+/,
                                    /[A-Z]+/
                ]);
                
                json = tokenizer.toJSON();
                
                expect(typeof json).toBe("string");
                expect(parseJSON).not.toThrow();
                expect(parseJSON()).toBeDefined();
                
            });
        
        it("2, Should export FSM data as Object",
            function () {
                var tokenizer = global.createTokenizer();
                    
                var json;
                
                tokenizer.define([
                    "number",       /[0-9]+/,
                        
                    "sequence",     /a-c]+/,
                                    /[d-z]+/,
                                    /[A-Z]+/
                ]);
                
                json = tokenizer.toObject();
                
                expect(Object.prototype.toString.call(json)).toBe("[object Object]");
                expect(json).toBeDefined();
            });
    });