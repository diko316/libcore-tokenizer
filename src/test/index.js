'use strict';

global.main = require("../index.js");
console.log('good! ', global.main);


describe("Test Index",
    function () {
        
        it("1. Should run unit test from here on.",
            function () {
                expect(1).toBe(1);
            });

    });
