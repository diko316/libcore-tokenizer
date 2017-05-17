'use strict';

describe("Tokenizer instance \"toJSON()\" API",
    function () {
        
        it("1. Should export FSM data as JSON string.",
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
    });