'use strict';

describe("Tokenizer instance \"toJSON()\" API",
    function () {
        
        it("1. Should export FSM data as JSON string.",
            function () {
                var tokenizer = global.createTokenizer(),
                    error = null;
                    
                var json, object;
                
                tokenizer.define([
                    "number",       /[0-9]+/,
                        
                    "sequence",     /a-c]+/,
                                    /[d-z]+/,
                                    /[A-Z]+/
                ]);
                
                json = tokenizer.toJSON();
                
                expect(typeof json).toBe("string");
                
                try {
                    object = JSON.parse(json);
                }
                catch (e) {
                    error = e;
                }
                
                expect(error).toBe(null);
                expect(object).toBeDefined();
                
            });
    });