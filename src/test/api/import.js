'use strict';


describe("Tokenizer instance \"fromJSON(json:String|Object)\" API",
    function () {
        
        var json;
        
        beforeEach(function () {
            var tokenizer = global.createTokenizer();
            
            tokenizer.define([
                "number",       /[0-9]+/,
                        
                "sequence",     /a-c]+/,
                                /[d-z]+/,
                                /[A-Z]+/
            ]);
            
            json = tokenizer.toJSON();
        });
        
        it("1. Should import JSON string NFA FSM data.",
            function () {
                var tokenizer = global.createTokenizer(),
                    error = null;
                
                try {
                    tokenizer.fromJSON(json);
                }
                catch (e) {
                    error = e;
                }
                
                expect(error).toBe(null);

            });
        
        
        it("2. Should import Javascript Object NFA FSM data.",
            function () {
                var tokenizer = global.createTokenizer(),
                    error = null,
                    fsm = null;
                
                
                try {
                    fsm = JSON.parse(json);
                }
                catch (e) {
                    error = e;
                }
                
                expect(error).toBe(null);
                
                try {
                    tokenizer.fromJSON(fsm);
                }
                catch (e) {
                    error = e;
                }
                
                expect(error).toBe(null);
            });
        
        it('3. Should not import if parameter is not Javascript Object ' +
            'or JSON String',
            function () {
                var tokenizer = global.createTokenizer(),
                    error = null;
                
                try {
                    tokenizer.fromJSON(null);
                }
                catch (e) {
                    error = e;
                }
                
                expect(error).not.toBe(null);
                
                try {
                    tokenizer.fromJSON(new Date());
                }
                catch (e) {
                    error = e;
                }
                
                expect(error).not.toBe(null);
                
                
                try {
                    tokenizer.fromJSON(100);
                }
                catch (e) {
                    error = e;
                }
                
                expect(error).not.toBe(null);
                
                
            });
        
    });